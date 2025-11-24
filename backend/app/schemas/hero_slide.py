from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class HeroSlideBase(BaseModel):
    image_url: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    cta_label: Optional[str] = None
    cta_href: Optional[str] = None


class HeroSlideCreate(HeroSlideBase):
    sort: Optional[int] = Field(default=None, ge=0)


class HeroSlideRead(HeroSlideBase):
    id: int
    sort: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HeroSlideUpdate(BaseModel):
    image_url: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    cta_label: Optional[str] = None
    cta_href: Optional[str] = None
    sort: Optional[int] = Field(default=None, ge=0)


class HeroSlideListResponse(BaseModel):
    items: list[HeroSlideRead]
    total: int
    page: int
    page_size: int
