from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.painting import PaintingRead


class MuseumRoomBase(BaseModel):
    title: str
    intro: Optional[str] = None
    sort: int = Field(default=0, ge=0)


class MuseumRoomCreate(MuseumRoomBase):
    slug: Optional[str] = None


class MuseumRoomUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    intro: Optional[str] = None
    sort: Optional[int] = Field(default=None, ge=0)


class MuseumRoomRead(MuseumRoomBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MuseumArtifactBase(BaseModel):
    room_id: int
    painting_id: int
    sort: int = Field(default=0, ge=0)
    hotspot: Optional[dict] = None


class MuseumArtifactCreate(MuseumArtifactBase):
    pass


class MuseumArtifactUpdate(BaseModel):
    room_id: Optional[int] = None
    painting_id: Optional[int] = None
    sort: Optional[int] = Field(default=None, ge=0)
    hotspot: Optional[dict] = None


class MuseumArtifactRead(MuseumArtifactBase):
    id: int
    created_at: datetime
    updated_at: datetime
    painting: Optional[PaintingRead] = None

    class Config:
        from_attributes = True
