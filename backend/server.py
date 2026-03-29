from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import List
import uuid

from models import (
    UserCreate, UserLogin, User, UserRole, Token,
    BotSessionCreate, BotSession, SessionStatus,
    TransactionCreate, Transaction, TransactionType, TransactionStatus,
    AdminCreditGrant, PaymentVerification
)
from bot_models import BotCredential, BotCredentialCreate, BotCredentialUpdate
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user
)
from bot_automation import bot_automation
from real_bot_controller import RealFFBotController, encrypt_password, decrypt_password

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
sessions_collection = db.bot_sessions
transactions_collection = db.transactions
bot_credentials_collection = db.bot_credentials  # New collection

# Create the main app
app = FastAPI(title="FF Glory Bot API")

# Create API router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_doc = {
        "_id": str(uuid.uuid4()),
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": "admin" if user_data.email == "sandeepdatta866@gmail.com" else "user",
        "credits": 0,
        "totalGloryEarned": 0,
        "createdAt": datetime.utcnow()
    }
    
    await users_collection.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_data.email, "role": user_doc["role"]}
    )
    
    # Return user and token
    user_response = {
        "id": user_doc["_id"],
        "name": user_doc["name"],
        "email": user_doc["email"],
        "role": user_doc["role"],
        "credits": user_doc["credits"],
        "totalGloryEarned": user_doc["totalGloryEarned"],
        "createdAt": user_doc["createdAt"]
    }
    
    return {
        "user": user_response,
        "access_token": access_token,
        "token_type": "bearer"
    }

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    """Login user"""
    # Find user
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    
    # Return user and token
    user_response = {
        "id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "credits": user["credits"],
        "totalGloryEarned": user["totalGloryEarned"],
        "createdAt": user["createdAt"]
    }
    
    return {
        "user": user_response,
        "access_token": access_token,
        "token_type": "bearer"
    }

@api_router.get("/auth/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "credits": user["credits"],
        "totalGloryEarned": user["totalGloryEarned"],
        "createdAt": user["createdAt"]
    }

# ============================================================================
# BOT SESSION ENDPOINTS
# ============================================================================

@api_router.post("/sessions/start", response_model=dict)
async def start_bot_session(session_data: BotSessionCreate, current_user: dict = Depends(get_current_user)):
    """Start a new bot farming session"""
    # Get user
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user has credits
    if user["credits"] < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient credits"
        )
    
    # Validate bot count (must be multiple of 4)
    if session_data.botCount % 4 != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot count must be a multiple of 4"
        )
    
    # Create session
    session_id = str(uuid.uuid4())
    glory_per_hour = 50000 * session_data.botCount  # 50k per bot per hour
    
    session_doc = {
        "_id": session_id,
        "userId": user["_id"],
        "clanId": session_data.clanId,
        "region": session_data.region,
        "botCount": session_data.botCount,
        "status": "running",
        "gloryEarned": 0,
        "gloryPerHour": glory_per_hour,
        "startTime": datetime.utcnow(),
        "estimatedCompletion": datetime.utcnow() + timedelta(hours=6),
        "createdAt": datetime.utcnow()
    }
    
    await sessions_collection.insert_one(session_doc)
    
    # Deduct credit
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$inc": {"credits": -1}}
    )
    
    # Create credit usage transaction
    transaction_doc = {
        "_id": str(uuid.uuid4()),
        "userId": user["_id"],
        "type": "credit_usage",
        "credits": -1,
        "status": "completed",
        "sessionId": session_id,
        "timestamp": datetime.utcnow()
    }
    await transactions_collection.insert_one(transaction_doc)
    
    # Start bot automation
    success = await bot_automation.start_session(
        session_id,
        session_data.clanId,
        session_data.region,
        session_data.botCount
    )
    
    if not success:
        # Refund credit if bot failed to start
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$inc": {"credits": 1}}
        )
        await sessions_collection.update_one(
            {"_id": session_id},
            {"$set": {"status": "failed"}}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start bot session"
        )
    
    logger.info(f"Bot session {session_id} started for user {user['email']}")
    
    return {
        "sessionId": session_id,
        "status": "running",
        "botCount": session_data.botCount,
        "gloryPerHour": glory_per_hour,
        "estimatedCompletion": session_doc["estimatedCompletion"]
    }

@api_router.get("/sessions", response_model=List[dict])
async def get_user_sessions(current_user: dict = Depends(get_current_user)):
    """Get all sessions for current user"""
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    sessions = await sessions_collection.find({"userId": user["_id"]}).sort("createdAt", -1).to_list(100)
    
    # Update glory earned from bot automation
    for session in sessions:
        if session["status"] == "running":
            bot_status = bot_automation.get_session_status(session["_id"])
            if bot_status:
                session["gloryEarned"] = bot_status["glory_earned"]
    
    # Convert ObjectId to string
    for session in sessions:
        session["id"] = session.pop("_id")
    
    return sessions

@api_router.patch("/sessions/{session_id}/stop", response_model=dict)
async def stop_bot_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Stop a running bot session"""
    user = await users_collection.find_one({"email": current_user["email"]})
    session = await sessions_collection.find_one({"_id": session_id, "userId": user["_id"]})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session["status"] != "running":
        raise HTTPException(status_code=400, detail="Session is not running")
    
    # Stop bot automation
    glory_earned = await bot_automation.stop_session(session_id)
    
    # Update session
    await sessions_collection.update_one(
        {"_id": session_id},
        {
            "$set": {
                "status": "completed",
                "endTime": datetime.utcnow(),
                "gloryEarned": glory_earned or session["gloryEarned"]
            }
        }
    )
    
    # Update user's total glory
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$inc": {"totalGloryEarned": glory_earned or 0}}
    )
    
    return {"status": "completed", "gloryEarned": glory_earned}

# ============================================================================
# TRANSACTION ENDPOINTS
# ============================================================================

@api_router.post("/transactions/purchase", response_model=dict)
async def create_purchase_transaction(txn_data: TransactionCreate, current_user: dict = Depends(get_current_user)):
    """Create a credit purchase transaction (pending admin approval)"""
    user = await users_collection.find_one({"email": current_user["email"]})
    
    # Pricing plans
    plans = {
        "plan-1": {"credits": 1, "price": 10},
        "plan-2": {"credits": 3, "price": 20},
        "plan-3": {"credits": 10, "price": 50}
    }
    
    plan = plans.get(txn_data.planId)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan ID")
    
    # Create transaction (pending approval)
    transaction_doc = {
        "_id": str(uuid.uuid4()),
        "userId": user["_id"],
        "type": "credit_purchase",
        "amount": plan["price"],
        "credits": plan["credits"],
        "status": "pending",
        "paymentMethod": "UPI",
        "upiId": txn_data.upiId,
        "upiTransactionId": txn_data.transactionId,
        "timestamp": datetime.utcnow()
    }
    
    await transactions_collection.insert_one(transaction_doc)
    
    logger.info(f"Payment transaction created: {transaction_doc['_id']} for user {user['email']}")
    
    transaction_doc["id"] = transaction_doc.pop("_id")
    return transaction_doc

@api_router.get("/transactions", response_model=List[dict])
async def get_user_transactions(current_user: dict = Depends(get_current_user)):
    """Get all transactions for current user"""
    user = await users_collection.find_one({"email": current_user["email"]})
    transactions = await transactions_collection.find({"userId": user["_id"]}).sort("timestamp", -1).to_list(100)
    
    for txn in transactions:
        txn["id"] = txn.pop("_id")
    
    return transactions

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@api_router.get("/admin/users", response_model=List[dict])
async def get_all_users(current_user: dict = Depends(get_admin_user)):
    """Get all users (admin only)"""
    users = await users_collection.find({}, {"password": 0}).to_list(1000)
    
    for user in users:
        user["id"] = user.pop("_id")
    
    return users

@api_router.get("/admin/sessions", response_model=List[dict])
async def get_all_sessions(current_user: dict = Depends(get_admin_user)):
    """Get all bot sessions (admin only)"""
    sessions = await sessions_collection.find({}).sort("createdAt", -1).to_list(1000)
    
    # Update running sessions with current glory
    for session in sessions:
        if session["status"] == "running":
            bot_status = bot_automation.get_session_status(session["_id"])
            if bot_status:
                session["gloryEarned"] = bot_status["glory_earned"]
        session["id"] = session.pop("_id")
    
    return sessions

@api_router.get("/admin/transactions", response_model=List[dict])
async def get_all_transactions(current_user: dict = Depends(get_admin_user)):
    """Get all transactions (admin only)"""
    transactions = await transactions_collection.find({}).sort("timestamp", -1).to_list(1000)
    
    for txn in transactions:
        txn["id"] = txn.pop("_id")
    
    return transactions

@api_router.post("/admin/credits/grant", response_model=dict)
async def grant_credits(grant_data: AdminCreditGrant, current_user: dict = Depends(get_admin_user)):
    """Grant credits to a user (admin only)"""
    # Update user credits
    result = await users_collection.update_one(
        {"_id": grant_data.userId},
        {"$inc": {"credits": grant_data.credits}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create transaction record
    transaction_doc = {
        "_id": str(uuid.uuid4()),
        "userId": grant_data.userId,
        "type": "admin_credit",
        "credits": grant_data.credits,
        "status": "completed",
        "timestamp": datetime.utcnow(),
        "reason": grant_data.reason or "Admin granted credits"
    }
    
    await transactions_collection.insert_one(transaction_doc)
    
    logger.info(f"Admin granted {grant_data.credits} credits to user {grant_data.userId}")
    
    return {"success": True, "message": f"Granted {grant_data.credits} credits"}

@api_router.post("/admin/payments/verify", response_model=dict)
async def verify_payment(verification: PaymentVerification, current_user: dict = Depends(get_admin_user)):
    """Verify and approve/reject payment transaction (admin only)"""
    transaction = await transactions_collection.find_one({"_id": verification.transactionId})
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] != "pending":
        raise HTTPException(status_code=400, detail="Transaction already processed")
    
    if verification.status == "approve":
        # Approve transaction and add credits
        await transactions_collection.update_one(
            {"_id": verification.transactionId},
            {"$set": {"status": "completed"}}
        )
        
        await users_collection.update_one(
            {"_id": transaction["userId"]},
            {"$inc": {"credits": transaction["credits"]}}
        )
        
        logger.info(f"Payment {verification.transactionId} approved and {transaction['credits']} credits added")
        return {"success": True, "message": "Payment approved and credits added"}
    else:
        # Reject transaction
        await transactions_collection.update_one(
            {"_id": verification.transactionId},
            {"$set": {"status": "failed"}}
        )
        
        logger.info(f"Payment {verification.transactionId} rejected")
        return {"success": True, "message": "Payment rejected"}

@api_router.get("/admin/stats", response_model=dict)
async def get_admin_stats(current_user: dict = Depends(get_admin_user)):
    """Get platform statistics (admin only)"""
    total_users = await users_collection.count_documents({})
    
    # Calculate total revenue
    completed_txns = await transactions_collection.find({
        "type": "credit_purchase",
        "status": "completed"
    }).to_list(10000)
    total_revenue = sum(txn.get("amount", 0) for txn in completed_txns)
    
    # Active sessions
    active_sessions = await sessions_collection.count_documents({"status": "running"})
    
    # Total glory farmed
    all_sessions = await sessions_collection.find({}).to_list(10000)
    total_glory = sum(session.get("gloryEarned", 0) for session in all_sessions)
    
    return {
        "totalUsers": total_users,
        "totalRevenue": total_revenue,
        "activeSessions": active_sessions,
        "totalGlory": total_glory
    }

# ============================================================================
# BOT CREDENTIALS MANAGEMENT (ADMIN ONLY)
# ============================================================================

@api_router.post("/admin/bots/add", response_model=dict)
async def add_bot_credential(bot_data: BotCredentialCreate, current_user: dict = Depends(get_admin_user)):
    """Add new bot account credentials (admin only)"""
    try:
        # Test login with credentials first
        bot_controller = RealFFBotController(bot_data.email, bot_data.password, bot_data.region)
        login_result = await bot_controller.login()
        await bot_controller.cleanup()
        
        if not login_result.get("success"):
            raise HTTPException(status_code=400, detail="Invalid credentials or login failed")
        
        # Store encrypted credentials
        bot_doc = {
            "_id": str(uuid.uuid4()),
            "email": bot_data.email,
            "password": encrypt_password(bot_data.password),
            "uid": login_result.get("uid"),
            "region": bot_data.region,
            "status": "active",
            "current_guild": None,
            "last_login": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
        
        await bot_credentials_collection.insert_one(bot_doc)
        
        logger.info(f"Bot credential added: {bot_data.email} (UID: {login_result.get('uid')})")
        
        return {
            "success": True,
            "message": "Bot credentials added successfully",
            "bot_id": bot_doc["_id"],
            "uid": login_result.get("uid")
        }
        
    except Exception as e:
        logger.error(f"Error adding bot credentials: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/bots", response_model=List[dict])
async def get_all_bots(current_user: dict = Depends(get_admin_user)):
    """Get all bot credentials (admin only)"""
    bots = await bot_credentials_collection.find({}).to_list(1000)
    
    # Don't send passwords to frontend
    for bot in bots:
        bot["id"] = bot.pop("_id")
        bot.pop("password", None)  # Remove password from response
    
    return bots

@api_router.delete("/admin/bots/{bot_id}", response_model=dict)
async def delete_bot_credential(bot_id: str, current_user: dict = Depends(get_admin_user)):
    """Delete bot credentials (admin only)"""
    result = await bot_credentials_collection.delete_one({"_id": bot_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    return {"success": True, "message": "Bot credentials deleted"}

@api_router.post("/admin/bots/{bot_id}/test", response_model=dict)
async def test_bot_login(bot_id: str, current_user: dict = Depends(get_admin_user)):
    """Test bot login and get account info (admin only)"""
    bot = await bot_credentials_collection.find_one({"_id": bot_id})
    
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    try:
        # Decrypt password and test login
        password = decrypt_password(bot["password"])
        bot_controller = RealFFBotController(bot["email"], password, bot["region"])
        
        login_result = await bot_controller.login()
        
        if login_result.get("success"):
            # Update last login time
            await bot_credentials_collection.update_one(
                {"_id": bot_id},
                {"$set": {"last_login": datetime.utcnow().isoformat()}}
            )
        
        await bot_controller.cleanup()
        
        return login_result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@api_router.post("/admin/bots/{bot_id}/join-guild", response_model=dict)
async def bot_join_guild(bot_id: str, guild_uid: str, current_user: dict = Depends(get_admin_user)):
    """Make bot join a specific guild (admin only)"""
    bot = await bot_credentials_collection.find_one({"_id": bot_id})
    
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    try:
        password = decrypt_password(bot["password"])
        bot_controller = RealFFBotController(bot["email"], password, bot["region"])
        
        # Login and join guild
        await bot_controller.login()
        joined = await bot_controller.join_guild(guild_uid)
        
        if joined:
            # Update bot's current guild
            await bot_credentials_collection.update_one(
                {"_id": bot_id},
                {"$set": {"current_guild": guild_uid}}
            )
        
        await bot_controller.cleanup()
        
        return {
            "success": joined,
            "message": f"Bot joined guild {guild_uid}" if joined else "Failed to join guild"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "FF Glory Bot API v1.0", "status": "running"}

# Include router in app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
