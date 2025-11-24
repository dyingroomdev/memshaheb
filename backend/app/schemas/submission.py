from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class SubmissionBase(BaseModel):
    name: str
    email: EmailStr
    title: str
    content: str


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(pending|reviewed|accepted|rejected)$")


class SubmissionRead(SubmissionBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
