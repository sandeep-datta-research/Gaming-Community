from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ============================================================================
# ENUMS
# ============================================================================

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class TournamentStatus(str, Enum):
    DRAFT = "draft"
    REGISTRATION = "registration"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MatchStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ClanRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"

# ============================================================================
# USER MODELS
# ============================================================================

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    username: str = Field(..., min_length=3, max_length=20)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    country: Optional[str] = None
    social_links: Optional[dict] = None
    streaming_links: Optional[dict] = None  # twitch, youtube, etc.

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    profile: Optional[UserProfile] = None

# ============================================================================
# GAME STATS MODELS
# ============================================================================

class GameCreate(BaseModel):
    name: str
    slug: str  # e.g., "free-fire", "pubg-mobile"
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None

class PlayerGameStats(BaseModel):
    game_id: str
    player_id: str  # In-game player ID
    username: str  # In-game username
    level: Optional[int] = None
    rank: Optional[str] = None
    stats: dict = {}  # Flexible stats like kills, wins, KD ratio, etc.

class AddGameStats(BaseModel):
    game_slug: str
    player_id: str
    username: str
    level: Optional[int] = None
    rank: Optional[str] = None
    stats: dict = {}

# ============================================================================
# TOURNAMENT MODELS
# ============================================================================

class TournamentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    game_slug: str
    max_teams: int = Field(..., ge=2, le=128)
    team_size: int = Field(..., ge=1, le=10)
    registration_start: datetime
    registration_end: datetime
    start_date: datetime
    prize_pool: Optional[float] = 0
    prize_distribution: Optional[dict] = None  # {"1st": 50, "2nd": 30, "3rd": 20}
    rules: Optional[str] = None
    banner_url: Optional[str] = None
    is_public: bool = True

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_teams: Optional[int] = None
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    start_date: Optional[datetime] = None
    prize_pool: Optional[float] = None
    prize_distribution: Optional[dict] = None
    rules: Optional[str] = None
    banner_url: Optional[str] = None
    status: Optional[TournamentStatus] = None

class TournamentRegistration(BaseModel):
    team_name: str
    team_members: List[str]  # List of user IDs

class MatchResult(BaseModel):
    match_id: str
    winner_team_id: str
    score: Optional[dict] = None  # {"team1": 3, "team2": 1}
    notes: Optional[str] = None

# ============================================================================
# CLAN MODELS
# ============================================================================

class ClanCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    tag: str = Field(..., min_length=2, max_length=6)  # Clan tag like [ABC]
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    game_slug: str  # Primary game
    is_recruiting: bool = True
    requirements: Optional[str] = None

class ClanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_recruiting: Optional[bool] = None
    requirements: Optional[str] = None

class ClanInvite(BaseModel):
    user_id: str
    message: Optional[str] = None

class ClanJoinRequest(BaseModel):
    clan_id: str
    message: Optional[str] = None

# ============================================================================
# COMMUNITY MODELS
# ============================================================================

class PostCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str
    category: str = "general"  # general, clips, guides, news, etc.
    tags: List[str] = []
    media_urls: List[str] = []

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[str] = None  # For nested comments

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    recipient_id: Optional[str] = None  # For DMs
    channel_id: Optional[str] = None  # For clan/community channels

# ============================================================================
# SCHEDULE MODELS
# ============================================================================

class ScheduleEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str  # match, practice, meeting, etc.
    start_time: datetime
    end_time: Optional[datetime] = None
    clan_id: Optional[str] = None
    tournament_id: Optional[str] = None
    participants: List[str] = []
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None  # e.g., "WEEKLY"

# ============================================================================
# LEADERBOARD MODELS
# ============================================================================

class LeaderboardEntry(BaseModel):
    user_id: str
    game_slug: str
    metric: str  # "wins", "kills", "kd_ratio", etc.
    value: float
    rank: int
