from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Add to existing models

class BotCredential(BaseModel):
    id: str
    email: EmailStr
    password: str  # Will be encrypted in DB
    uid: Optional[str] = None
    level: Optional[int] = None
    region: str = "IN"
    status: str = "active"  # active, inactive, banned
    current_guild: Optional[str] = None
    last_login: Optional[str] = None
    created_at: str

class BotCredentialCreate(BaseModel):
    email: EmailStr
    password: str
    region: str = "IN"

class BotCredentialUpdate(BaseModel):
    status: Optional[str] = None
    current_guild: Optional[str] = None
