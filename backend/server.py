from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import secrets

from models import (
    UserCreate, UserLogin, UserUpdate, UserProfile,
    GameCreate, AddGameStats,
    TournamentCreate, TournamentUpdate, TournamentRegistration, MatchResult, TournamentStatus,
    ClanCreate, ClanUpdate, ClanInvite, ClanJoinRequest, ClanRole,
    PostCreate, PostUpdate, CommentCreate, MessageCreate,
    ScheduleEventCreate
)
from auth import (
    hash_password, verify_password, 
    create_access_token, create_refresh_token, generate_reset_token,
    get_current_user, get_admin_user,
    check_brute_force, record_failed_login, clear_failed_logins,
    get_jwt_secret, JWT_ALGORITHM
)
import jwt

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="GameVerse API", description="Comprehensive Gaming Platform API")

# Create API router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == "_id":
                result["id"] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(v) if isinstance(v, (dict, ObjectId)) else v for v in value]
            else:
                result[key] = value
        return result
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    """Register a new user"""
    email_lower = user_data.email.lower()
    
    # Check if email exists
    existing_email = await db.users.find_one({"email": email_lower})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    existing_username = await db.users.find_one({"username": user_data.username.lower()})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user document
    user_doc = {
        "name": user_data.name,
        "email": email_lower,
        "username": user_data.username.lower(),
        "password_hash": hash_password(user_data.password),
        "role": "user",
        "profile": {
            "bio": None,
            "avatar_url": None,
            "banner_url": None,
            "country": None,
            "social_links": {},
            "streaming_links": {}
        },
        "game_stats": [],
        "achievements": [],
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create tokens
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    # Set cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    user_doc["_id"] = result.inserted_id
    # Remove password_hash before returning
    user_doc.pop("password_hash", None)
    return serialize_doc(user_doc)

@api_router.post("/auth/login")
async def login(credentials: UserLogin, request: Request, response: Response):
    """Login user"""
    email_lower = credentials.email.lower()
    ip = request.client.host if request.client else "unknown"
    
    # Check brute force lockout
    if await check_brute_force(db, ip, email_lower):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again in 15 minutes.")
    
    # Find user
    user = await db.users.find_one({"email": email_lower})
    if not user:
        await record_failed_login(db, ip, email_lower)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        await record_failed_login(db, ip, email_lower)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear failed attempts
    await clear_failed_logins(db, ip, email_lower)
    
    user_id = str(user["_id"])
    
    # Create tokens
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    # Set cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return serialize_doc(user)

@api_router.post("/auth/logout")
async def logout(response: Response):
    """Logout user"""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user info"""
    user = await get_current_user(request, db)
    return serialize_doc(user)

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    """Refresh access token"""
    refresh = request.cookies.get("refresh_token")
    if not refresh:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    try:
        payload = jwt.decode(refresh, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"])
        
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
        
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.post("/auth/forgot-password")
async def forgot_password(email: str):
    """Request password reset"""
    user = await db.users.find_one({"email": email.lower()})
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    token = generate_reset_token()
    await db.password_reset_tokens.insert_one({
        "user_id": user["_id"],
        "token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "used": False
    })
    
    # Log reset link (in production, send email)
    reset_url = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
    logger.info(f"Password reset link for {email}: {reset_url}")
    
    return {"message": "If the email exists, a reset link has been sent"}

@api_router.post("/auth/reset-password")
async def reset_password(token: str, new_password: str):
    """Reset password with token"""
    reset_record = await db.password_reset_tokens.find_one({
        "token": token,
        "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Update password
    await db.users.update_one(
        {"_id": reset_record["user_id"]},
        {"$set": {"password_hash": hash_password(new_password)}}
    )
    
    # Mark token as used
    await db.password_reset_tokens.update_one(
        {"_id": reset_record["_id"]},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successfully"}

# ============================================================================
# USER PROFILE ENDPOINTS
# ============================================================================

@api_router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    """Get public user profile"""
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    except:
        user = await db.users.find_one({"username": user_id.lower()}, {"password_hash": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return serialize_doc(user)

@api_router.patch("/users/me")
async def update_profile(update_data: UserUpdate, request: Request):
    """Update current user's profile"""
    user = await get_current_user(request, db)
    
    update_dict = {}
    if update_data.name:
        update_dict["name"] = update_data.name
    if update_data.username:
        # Check if username is taken
        existing = await db.users.find_one({"username": update_data.username.lower(), "_id": {"$ne": ObjectId(user["_id"])}})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_dict["username"] = update_data.username.lower()
    if update_data.profile:
        for key, value in update_data.profile.dict(exclude_none=True).items():
            update_dict[f"profile.{key}"] = value
    
    if update_dict:
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"_id": ObjectId(user["_id"])}, {"password_hash": 0})
    return serialize_doc(updated_user)

@api_router.get("/users")
async def search_users(q: str = "", limit: int = 20):
    """Search users"""
    query = {}
    if q:
        query = {"$or": [
            {"username": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}}
        ]}
    
    users = await db.users.find(query, {"password_hash": 0}).limit(limit).to_list(limit)
    return serialize_doc(users)

# ============================================================================
# GAME STATS ENDPOINTS
# ============================================================================

@api_router.get("/games")
async def get_games():
    """Get all supported games"""
    games = await db.games.find({}).to_list(100)
    return serialize_doc(games)

@api_router.post("/games")
async def create_game(game_data: GameCreate, request: Request):
    """Create a new game (admin only)"""
    await get_admin_user(request, db)
    
    existing = await db.games.find_one({"slug": game_data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Game with this slug already exists")
    
    game_doc = {
        "name": game_data.name,
        "slug": game_data.slug,
        "icon_url": game_data.icon_url,
        "banner_url": game_data.banner_url,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.games.insert_one(game_doc)
    game_doc["_id"] = result.inserted_id
    return serialize_doc(game_doc)

@api_router.post("/users/me/game-stats")
async def add_game_stats(stats_data: AddGameStats, request: Request):
    """Add game stats for current user"""
    user = await get_current_user(request, db)
    
    # Verify game exists
    game = await db.games.find_one({"slug": stats_data.game_slug})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    stat_doc = {
        "game_id": str(game["_id"]),
        "game_slug": stats_data.game_slug,
        "game_name": game["name"],
        "player_id": stats_data.player_id,
        "username": stats_data.username,
        "level": stats_data.level,
        "rank": stats_data.rank,
        "stats": stats_data.stats,
        "updated_at": datetime.now(timezone.utc)
    }
    
    # Update or add game stats
    await db.users.update_one(
        {"_id": ObjectId(user["_id"]), "game_stats.game_slug": stats_data.game_slug},
        {"$set": {"game_stats.$": stat_doc}}
    )
    
    # If not found, push new
    result = await db.users.update_one(
        {"_id": ObjectId(user["_id"]), "game_stats.game_slug": {"$ne": stats_data.game_slug}},
        {"$push": {"game_stats": stat_doc}}
    )
    
    return {"message": "Game stats updated", "stats": stat_doc}

@api_router.get("/users/{user_id}/game-stats")
async def get_user_game_stats(user_id: str):
    """Get user's game stats"""
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)}, {"game_stats": 1})
    except:
        user = await db.users.find_one({"username": user_id.lower()}, {"game_stats": 1})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("game_stats", [])

# ============================================================================
# TOURNAMENT ENDPOINTS
# ============================================================================

@api_router.get("/tournaments")
async def get_tournaments(
    status: Optional[str] = None,
    game_slug: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    """Get tournaments with filters"""
    query = {"is_public": True}
    if status:
        query["status"] = status
    if game_slug:
        query["game_slug"] = game_slug
    
    tournaments = await db.tournaments.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return serialize_doc(tournaments)

@api_router.get("/tournaments/{tournament_id}")
async def get_tournament(tournament_id: str):
    """Get tournament details"""
    tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Get registered teams
    teams = await db.tournament_teams.find({"tournament_id": tournament_id}).to_list(200)
    tournament["teams"] = teams
    
    # Get matches/brackets
    matches = await db.tournament_matches.find({"tournament_id": tournament_id}).sort("round", 1).to_list(500)
    tournament["matches"] = matches
    
    return serialize_doc(tournament)

@api_router.post("/tournaments")
async def create_tournament(tournament_data: TournamentCreate, request: Request):
    """Create a new tournament"""
    user = await get_current_user(request, db)
    
    # Verify game exists
    game = await db.games.find_one({"slug": tournament_data.game_slug})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    tournament_doc = {
        "name": tournament_data.name,
        "description": tournament_data.description,
        "game_slug": tournament_data.game_slug,
        "game_name": game["name"],
        "organizer_id": user["_id"],
        "organizer_name": user["name"],
        "max_teams": tournament_data.max_teams,
        "team_size": tournament_data.team_size,
        "registered_teams": 0,
        "registration_start": tournament_data.registration_start,
        "registration_end": tournament_data.registration_end,
        "start_date": tournament_data.start_date,
        "prize_pool": tournament_data.prize_pool,
        "prize_distribution": tournament_data.prize_distribution or {"1st": 50, "2nd": 30, "3rd": 20},
        "rules": tournament_data.rules,
        "banner_url": tournament_data.banner_url,
        "is_public": tournament_data.is_public,
        "status": "draft",
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.tournaments.insert_one(tournament_doc)
    tournament_doc["_id"] = result.inserted_id
    return serialize_doc(tournament_doc)

@api_router.patch("/tournaments/{tournament_id}")
async def update_tournament(tournament_id: str, update_data: TournamentUpdate, request: Request):
    """Update tournament"""
    user = await get_current_user(request, db)
    
    tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if str(tournament["organizer_id"]) != user["_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_none=True).items()}
    if update_dict:
        await db.tournaments.update_one({"_id": ObjectId(tournament_id)}, {"$set": update_dict})
    
    updated = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
    return serialize_doc(updated)

@api_router.post("/tournaments/{tournament_id}/register")
async def register_for_tournament(tournament_id: str, registration: TournamentRegistration, request: Request):
    """Register a team for tournament"""
    user = await get_current_user(request, db)
    
    tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament["status"] != "registration":
        raise HTTPException(status_code=400, detail="Tournament is not accepting registrations")
    
    if tournament["registered_teams"] >= tournament["max_teams"]:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    # Check if team name is taken
    existing = await db.tournament_teams.find_one({
        "tournament_id": tournament_id,
        "team_name": registration.team_name
    })
    if existing:
        raise HTTPException(status_code=400, detail="Team name already taken")
    
    team_doc = {
        "tournament_id": tournament_id,
        "team_name": registration.team_name,
        "captain_id": user["_id"],
        "captain_name": user["name"],
        "members": registration.team_members,
        "status": "registered",
        "seed": None,
        "registered_at": datetime.now(timezone.utc)
    }
    
    result = await db.tournament_teams.insert_one(team_doc)
    
    # Update tournament count
    await db.tournaments.update_one(
        {"_id": ObjectId(tournament_id)},
        {"$inc": {"registered_teams": 1}}
    )
    
    team_doc["_id"] = result.inserted_id
    return serialize_doc(team_doc)

@api_router.post("/tournaments/{tournament_id}/generate-brackets")
async def generate_brackets(tournament_id: str, request: Request):
    """Generate tournament brackets"""
    user = await get_current_user(request, db)
    
    tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if str(tournament["organizer_id"]) != user["_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get registered teams
    teams = await db.tournament_teams.find({"tournament_id": tournament_id}).to_list(200)
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 teams")
    
    # Simple single elimination bracket generation
    import random
    random.shuffle(teams)
    
    # Calculate number of rounds
    import math
    num_teams = len(teams)
    num_rounds = math.ceil(math.log2(num_teams))
    
    matches = []
    match_num = 1
    
    # First round
    for i in range(0, len(teams), 2):
        match = {
            "tournament_id": tournament_id,
            "match_number": match_num,
            "round": 1,
            "team1_id": str(teams[i]["_id"]) if i < len(teams) else None,
            "team1_name": teams[i]["team_name"] if i < len(teams) else "BYE",
            "team2_id": str(teams[i+1]["_id"]) if i+1 < len(teams) else None,
            "team2_name": teams[i+1]["team_name"] if i+1 < len(teams) else "BYE",
            "winner_id": None,
            "score": None,
            "status": "scheduled",
            "scheduled_time": None,
            "created_at": datetime.now(timezone.utc)
        }
        matches.append(match)
        match_num += 1
    
    # Insert matches
    if matches:
        await db.tournament_matches.delete_many({"tournament_id": tournament_id})
        await db.tournament_matches.insert_many(matches)
    
    # Update tournament status
    await db.tournaments.update_one(
        {"_id": ObjectId(tournament_id)},
        {"$set": {"status": "in_progress"}}
    )
    
    return {"message": "Brackets generated", "matches": len(matches), "rounds": num_rounds}

@api_router.post("/tournaments/{tournament_id}/matches/{match_id}/result")
async def submit_match_result(tournament_id: str, match_id: str, result: MatchResult, request: Request):
    """Submit match result"""
    user = await get_current_user(request, db)
    
    tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if str(tournament["organizer_id"]) != user["_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.tournament_matches.update_one(
        {"_id": ObjectId(match_id)},
        {"$set": {
            "winner_id": result.winner_team_id,
            "score": result.score,
            "status": "completed",
            "notes": result.notes,
            "completed_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Match result submitted"}

# ============================================================================
# CLAN ENDPOINTS
# ============================================================================

@api_router.get("/clans")
async def get_clans(
    game_slug: Optional[str] = None,
    recruiting: Optional[bool] = None,
    q: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    """Get clans with filters"""
    query = {}
    if game_slug:
        query["game_slug"] = game_slug
    if recruiting is not None:
        query["is_recruiting"] = recruiting
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tag": {"$regex": q, "$options": "i"}}
        ]
    
    clans = await db.clans.find(query).sort("member_count", -1).skip(skip).limit(limit).to_list(limit)
    return serialize_doc(clans)

@api_router.get("/clans/{clan_id}")
async def get_clan(clan_id: str):
    """Get clan details"""
    clan = await db.clans.find_one({"_id": ObjectId(clan_id)})
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    
    # Get members
    members = await db.clan_members.find({"clan_id": clan_id}).to_list(100)
    clan["members"] = members
    
    return serialize_doc(clan)

@api_router.post("/clans")
async def create_clan(clan_data: ClanCreate, request: Request):
    """Create a new clan"""
    user = await get_current_user(request, db)
    
    # Check if tag is taken
    existing = await db.clans.find_one({"tag": clan_data.tag.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Clan tag already taken")
    
    # Check if user is already in a clan for this game
    existing_member = await db.clan_members.find_one({
        "user_id": user["_id"],
        "game_slug": clan_data.game_slug
    })
    if existing_member:
        raise HTTPException(status_code=400, detail="You are already in a clan for this game")
    
    clan_doc = {
        "name": clan_data.name,
        "tag": clan_data.tag.upper(),
        "description": clan_data.description,
        "logo_url": clan_data.logo_url,
        "banner_url": clan_data.banner_url,
        "game_slug": clan_data.game_slug,
        "owner_id": user["_id"],
        "owner_name": user["name"],
        "member_count": 1,
        "is_recruiting": clan_data.is_recruiting,
        "requirements": clan_data.requirements,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.clans.insert_one(clan_doc)
    clan_id = str(result.inserted_id)
    
    # Add owner as member
    await db.clan_members.insert_one({
        "clan_id": clan_id,
        "user_id": user["_id"],
        "user_name": user["name"],
        "role": "owner",
        "game_slug": clan_data.game_slug,
        "joined_at": datetime.now(timezone.utc)
    })
    
    clan_doc["_id"] = result.inserted_id
    return serialize_doc(clan_doc)

@api_router.patch("/clans/{clan_id}")
async def update_clan(clan_id: str, update_data: ClanUpdate, request: Request):
    """Update clan"""
    user = await get_current_user(request, db)
    
    clan = await db.clans.find_one({"_id": ObjectId(clan_id)})
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    
    # Check if user is owner or admin
    member = await db.clan_members.find_one({
        "clan_id": clan_id,
        "user_id": user["_id"],
        "role": {"$in": ["owner", "admin"]}
    })
    if not member and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_none=True).items()}
    if update_dict:
        await db.clans.update_one({"_id": ObjectId(clan_id)}, {"$set": update_dict})
    
    updated = await db.clans.find_one({"_id": ObjectId(clan_id)})
    return serialize_doc(updated)

@api_router.post("/clans/{clan_id}/join")
async def join_clan(clan_id: str, request: Request):
    """Request to join a clan"""
    user = await get_current_user(request, db)
    
    clan = await db.clans.find_one({"_id": ObjectId(clan_id)})
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    
    if not clan.get("is_recruiting"):
        raise HTTPException(status_code=400, detail="Clan is not recruiting")
    
    # Check if already a member
    existing = await db.clan_members.find_one({
        "clan_id": clan_id,
        "user_id": user["_id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You are already a member")
    
    # Add as member
    await db.clan_members.insert_one({
        "clan_id": clan_id,
        "user_id": user["_id"],
        "user_name": user["name"],
        "role": "member",
        "game_slug": clan["game_slug"],
        "joined_at": datetime.now(timezone.utc)
    })
    
    # Update member count
    await db.clans.update_one(
        {"_id": ObjectId(clan_id)},
        {"$inc": {"member_count": 1}}
    )
    
    return {"message": "Joined clan successfully"}

@api_router.post("/clans/{clan_id}/leave")
async def leave_clan(clan_id: str, request: Request):
    """Leave a clan"""
    user = await get_current_user(request, db)
    
    member = await db.clan_members.find_one({
        "clan_id": clan_id,
        "user_id": user["_id"]
    })
    if not member:
        raise HTTPException(status_code=400, detail="You are not a member")
    
    if member["role"] == "owner":
        raise HTTPException(status_code=400, detail="Owner cannot leave. Transfer ownership first.")
    
    await db.clan_members.delete_one({"_id": member["_id"]})
    
    # Update member count
    await db.clans.update_one(
        {"_id": ObjectId(clan_id)},
        {"$inc": {"member_count": -1}}
    )
    
    return {"message": "Left clan successfully"}

@api_router.get("/users/me/clans")
async def get_my_clans(request: Request):
    """Get clans the current user is a member of"""
    user = await get_current_user(request, db)
    
    memberships = await db.clan_members.find({"user_id": user["_id"]}).to_list(20)
    clan_ids = [ObjectId(m["clan_id"]) for m in memberships]
    
    clans = await db.clans.find({"_id": {"$in": clan_ids}}).to_list(20)
    return serialize_doc(clans)

# ============================================================================
# COMMUNITY / POSTS ENDPOINTS
# ============================================================================

@api_router.get("/posts")
async def get_posts(
    category: Optional[str] = None,
    author_id: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    """Get community posts"""
    query = {}
    if category:
        query["category"] = category
    if author_id:
        query["author_id"] = author_id
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return serialize_doc(posts)

@api_router.get("/posts/{post_id}")
async def get_post(post_id: str):
    """Get single post with comments"""
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    await db.posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"views": 1}})
    
    # Get comments
    comments = await db.comments.find({"post_id": post_id}).sort("created_at", 1).to_list(500)
    post["comments"] = comments
    
    return serialize_doc(post)

@api_router.post("/posts")
async def create_post(post_data: PostCreate, request: Request):
    """Create a new post"""
    user = await get_current_user(request, db)
    
    post_doc = {
        "title": post_data.title,
        "content": post_data.content,
        "category": post_data.category,
        "tags": post_data.tags,
        "media_urls": post_data.media_urls,
        "author_id": user["_id"],
        "author_name": user["name"],
        "author_avatar": user.get("profile", {}).get("avatar_url"),
        "likes": 0,
        "views": 0,
        "comment_count": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.posts.insert_one(post_doc)
    post_doc["_id"] = result.inserted_id
    return serialize_doc(post_doc)

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, request: Request):
    """Like/unlike a post"""
    user = await get_current_user(request, db)
    
    existing = await db.post_likes.find_one({
        "post_id": post_id,
        "user_id": user["_id"]
    })
    
    if existing:
        await db.post_likes.delete_one({"_id": existing["_id"]})
        await db.posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"likes": -1}})
        return {"liked": False}
    else:
        await db.post_likes.insert_one({
            "post_id": post_id,
            "user_id": user["_id"],
            "created_at": datetime.now(timezone.utc)
        })
        await db.posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"likes": 1}})
        return {"liked": True}

@api_router.post("/posts/{post_id}/comments")
async def add_comment(post_id: str, comment_data: CommentCreate, request: Request):
    """Add a comment to a post"""
    user = await get_current_user(request, db)
    
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment_doc = {
        "post_id": post_id,
        "content": comment_data.content,
        "parent_id": comment_data.parent_id,
        "author_id": user["_id"],
        "author_name": user["name"],
        "author_avatar": user.get("profile", {}).get("avatar_url"),
        "likes": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.comments.insert_one(comment_doc)
    
    # Update comment count
    await db.posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"comment_count": 1}})
    
    comment_doc["_id"] = result.inserted_id
    return serialize_doc(comment_doc)

# ============================================================================
# LEADERBOARD ENDPOINTS
# ============================================================================

@api_router.get("/leaderboards/{game_slug}")
async def get_leaderboard(game_slug: str, metric: str = "wins", limit: int = 100):
    """Get game leaderboard"""
    pipeline = [
        {"$unwind": "$game_stats"},
        {"$match": {"game_stats.game_slug": game_slug}},
        {"$project": {
            "user_id": "$_id",
            "username": "$username",
            "name": "$name",
            "avatar": "$profile.avatar_url",
            "game_stats": 1,
            "value": f"$game_stats.stats.{metric}"
        }},
        {"$match": {"value": {"$exists": True, "$ne": None}}},
        {"$sort": {"value": -1}},
        {"$limit": limit}
    ]
    
    results = await db.users.aggregate(pipeline).to_list(limit)
    
    # Add rank
    for i, entry in enumerate(results):
        entry["rank"] = i + 1
        entry["user_id"] = str(entry.get("_id", entry.get("user_id")))
        entry.pop("_id", None)
    
    return results

# ============================================================================
# SCHEDULE ENDPOINTS
# ============================================================================

@api_router.get("/schedule")
async def get_schedule(
    request: Request,
    clan_id: Optional[str] = None,
    tournament_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get scheduled events"""
    user = await get_current_user(request, db)
    
    query = {"$or": [
        {"participants": user["_id"]},
        {"creator_id": user["_id"]}
    ]}
    
    if clan_id:
        query["clan_id"] = clan_id
    if tournament_id:
        query["tournament_id"] = tournament_id
    
    events = await db.schedule_events.find(query).sort("start_time", 1).to_list(100)
    return serialize_doc(events)

@api_router.post("/schedule")
async def create_schedule_event(event_data: ScheduleEventCreate, request: Request):
    """Create a scheduled event"""
    user = await get_current_user(request, db)
    
    event_doc = {
        "title": event_data.title,
        "description": event_data.description,
        "event_type": event_data.event_type,
        "start_time": event_data.start_time,
        "end_time": event_data.end_time,
        "clan_id": event_data.clan_id,
        "tournament_id": event_data.tournament_id,
        "participants": event_data.participants or [user["_id"]],
        "creator_id": user["_id"],
        "creator_name": user["name"],
        "is_recurring": event_data.is_recurring,
        "recurrence_rule": event_data.recurrence_rule,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.schedule_events.insert_one(event_doc)
    event_doc["_id"] = result.inserted_id
    return serialize_doc(event_doc)

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get platform statistics"""
    await get_admin_user(request, db)
    
    total_users = await db.users.count_documents({})
    total_clans = await db.clans.count_documents({})
    total_tournaments = await db.tournaments.count_documents({})
    active_tournaments = await db.tournaments.count_documents({"status": "in_progress"})
    total_posts = await db.posts.count_documents({})
    
    return {
        "total_users": total_users,
        "total_clans": total_clans,
        "total_tournaments": total_tournaments,
        "active_tournaments": active_tournaments,
        "total_posts": total_posts
    }

@api_router.get("/admin/users")
async def get_all_users(request: Request, limit: int = 100, skip: int = 0):
    """Get all users (admin only)"""
    await get_admin_user(request, db)
    
    users = await db.users.find({}, {"password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    return serialize_doc(users)

# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "GameVerse API v1.0", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router in app
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup events
@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.games.create_index("slug", unique=True)
    await db.clans.create_index("tag", unique=True)
    await db.tournaments.create_index([("status", 1), ("game_slug", 1)])
    await db.posts.create_index([("category", 1), ("created_at", -1)])
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@gameverse.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "username": "admin",
            "name": "Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "profile": {},
            "game_stats": [],
            "achievements": [],
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Admin password updated")
    
    # Seed default games
    default_games = [
        {"name": "Free Fire", "slug": "free-fire", "icon_url": None, "banner_url": None},
        {"name": "PUBG Mobile", "slug": "pubg-mobile", "icon_url": None, "banner_url": None},
        {"name": "Call of Duty Mobile", "slug": "cod-mobile", "icon_url": None, "banner_url": None},
        {"name": "Mobile Legends", "slug": "mobile-legends", "icon_url": None, "banner_url": None},
        {"name": "Valorant", "slug": "valorant", "icon_url": None, "banner_url": None},
        {"name": "Fortnite", "slug": "fortnite", "icon_url": None, "banner_url": None},
    ]
    
    for game in default_games:
        await db.games.update_one(
            {"slug": game["slug"]},
            {"$setOnInsert": {**game, "created_at": datetime.now(timezone.utc)}},
            upsert=True
        )
    
    logger.info("Database initialized")
    
    # Write test credentials
    credentials_content = """# Test Credentials

## Admin Account
- Email: admin@gameverse.com
- Password: Admin@123
- Role: admin

## Auth Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user
- POST /api/auth/refresh - Refresh token
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password with token
"""
    
    try:
        import pathlib
        pathlib.Path("/app/memory").mkdir(parents=True, exist_ok=True)
        with open("/app/memory/test_credentials.md", "w") as f:
            f.write(credentials_content)
    except Exception as e:
        logger.warning(f"Could not write test credentials: {e}")

@app.on_event("shutdown")
async def shutdown():
    client.close()
