import os
import bcrypt
import jwt
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request
from bson import ObjectId

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)

async def get_current_user(request: Request, db) -> dict:
    """Extract and verify user from token"""
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(request: Request, db) -> dict:
    """Require admin role"""
    user = await get_current_user(request, db)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def check_brute_force(db, ip: str, email: str) -> bool:
    """Check if login attempts are locked out"""
    identifier = f"{ip}:{email.lower()}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    
    if attempt and attempt.get("locked_until"):
        if datetime.now(timezone.utc) < attempt["locked_until"]:
            return True  # Still locked
        else:
            # Lockout expired, clear it
            await db.login_attempts.delete_one({"identifier": identifier})
    
    return False

async def record_failed_login(db, ip: str, email: str):
    """Record a failed login attempt"""
    identifier = f"{ip}:{email.lower()}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    
    if attempt:
        new_count = attempt.get("count", 0) + 1
        update = {"$set": {"count": new_count, "last_attempt": datetime.now(timezone.utc)}}
        
        if new_count >= 5:
            update["$set"]["locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        await db.login_attempts.update_one({"identifier": identifier}, update)
    else:
        await db.login_attempts.insert_one({
            "identifier": identifier,
            "count": 1,
            "last_attempt": datetime.now(timezone.utc)
        })

async def clear_failed_logins(db, ip: str, email: str):
    """Clear failed login attempts on successful login"""
    identifier = f"{ip}:{email.lower()}"
    await db.login_attempts.delete_one({"identifier": identifier})
