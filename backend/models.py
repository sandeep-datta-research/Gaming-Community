from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class SessionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class TransactionType(str, Enum):
    CREDIT_PURCHASE = "credit_purchase"
    CREDIT_USAGE = "credit_usage"
    REFUND = "refund"
    ADMIN_CREDIT = "admin_credit"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

# User Models
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    role: UserRole = UserRole.USER
    credits: int = 0
    totalGloryEarned: int = 0
    createdAt: datetime

    class Config:
        from_attributes = True

class UserInDB(User):
    password: str

# Bot Session Models
class BotSessionCreate(BaseModel):
    clanId: str
    region: str
    botCount: int = Field(default=4, ge=4, le=20)

class BotSession(BaseModel):
    id: str
    userId: str
    clanId: str
    region: str
    botCount: int
    status: SessionStatus
    gloryEarned: int = 0
    gloryPerHour: int
    startTime: datetime
    endTime: Optional[datetime] = None
    estimatedCompletion: Optional[datetime] = None
    createdAt: datetime

# Transaction Models
class TransactionCreate(BaseModel):
    planId: str
    transactionId: str
    upiId: str = "9366183700@fam"

class Transaction(BaseModel):
    id: str
    userId: str
    type: TransactionType
    amount: Optional[float] = None
    credits: int
    status: TransactionStatus
    paymentMethod: Optional[str] = None
    upiId: Optional[str] = None
    upiTransactionId: Optional[str] = None
    sessionId: Optional[str] = None
    timestamp: datetime

# Admin Models
class AdminCreditGrant(BaseModel):
    userId: str
    credits: int
    reason: Optional[str] = None

class PaymentVerification(BaseModel):
    transactionId: str
    status: str  # 'approve' or 'reject'

# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
