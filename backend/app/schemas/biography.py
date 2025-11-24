from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TimelineItem(BaseModel):
    time_label: str
    title: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class BiographyRead(BaseModel):
    id: int
    name: Optional[str] = None
    tagline: Optional[str] = None
    quote: Optional[str] = None
    quote_attribution: Optional[str] = None
    rich_text: Optional[str] = None
    portrait_url: Optional[str] = None
    instagram_handle: Optional[str] = None
    timeline: list[TimelineItem] = Field(default_factory=list)
    updated_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BiographyUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    quote: Optional[str] = None
    quote_attribution: Optional[str] = None
    rich_text: Optional[str] = None
    portrait_url: Optional[str] = None
    instagram_handle: Optional[str] = None
    timeline: Optional[list[TimelineItem]] = None
