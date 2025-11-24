from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class MediaFileRead(BaseModel):
    id: int
    filename: str
    file_url: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    created_at: datetime


class MediaRead(BaseModel):
    id: int
    url: str
    alt: Optional[str] = None
    meta: Optional[dict[str, Any]] = None
    owner_id: Optional[int] = None
    created_at: datetime


class MediaUploadResponse(MediaRead):
    signed_url: Optional[str] = None
