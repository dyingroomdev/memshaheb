from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    display_name: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdateAdmin(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    password: Optional[str] = None


class UserProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str
