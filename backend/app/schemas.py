from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# --- Auth ---
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6)
    referral_code: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Client ---
class ClientOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    bonus_balance: int
    loyalty_tier: str
    cashback_percent: float
    referral_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class BonusEventOut(BaseModel):
    id: int
    amount: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReferralStats(BaseModel):
    referral_code: str
    referral_link: str
    invited_count: int
    rewarded_count: int
    total_earned: int


# --- Products ---
class ProductOut(BaseModel):
    id: int
    title: str
    description: str
    price: float
    collection: Optional[str]
    image_url: Optional[str]
    in_stock: bool
    avg_rating: float
    reviews_count: int

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    title: str
    description: str = ""
    price: float
    collection: Optional[str] = None
    image_url: Optional[str] = None
    in_stock: bool = True


# --- Orders ---
class OrderCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
    comment: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    status: str
    comment: Optional[str]
    created_at: datetime
    product: ProductOut

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


# --- Reviews ---
class ReviewOut(BaseModel):
    id: int
    client_id: int
    product_id: int
    rating: int
    text: str
    photo_url: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
