from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PaintingBase(BaseModel):
    title: str
    description: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=0)
    medium: Optional[str] = None
    dimensions: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None
    wc_product_id: Optional[int] = None
    is_featured: bool = False
    published_at: Optional[datetime] = None


class PaintingCreate(PaintingBase):
    slug: Optional[str] = None


class PaintingUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=0)
    medium: Optional[str] = None
    dimensions: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None
    wc_product_id: Optional[int] = None
    is_featured: Optional[bool] = None
    published_at: Optional[datetime] = Field(default=None)


class PaintingRead(PaintingBase):
    id: int
    slug: str
    lqip_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaintingListResponse(BaseModel):
    items: list[PaintingRead]
    next_cursor: Optional[str] = None
