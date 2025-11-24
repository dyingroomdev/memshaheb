from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BlogBase(BaseModel):
    title: str
    content_md: str
    cover_url: Optional[str] = None
    tags: Optional[list[str]] = None
    excerpt: Optional[str] = None
    published_at: Optional[datetime] = None
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image_url: Optional[str] = None


class BlogCreate(BlogBase):
    slug: Optional[str] = None


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content_md: Optional[str] = None
    cover_url: Optional[str] = None
    tags: Optional[list[str]] = None
    excerpt: Optional[str] = None
    published_at: Optional[datetime] = Field(default=None)
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image_url: Optional[str] = None


class BlogCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class BlogCategoryCreate(BlogCategoryBase):
    slug: Optional[str] = None


class BlogCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None


class BlogCategoryRead(BlogCategoryBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogRead(BlogBase):
    id: int
    slug: str
    category_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    category: Optional[BlogCategoryRead] = None

    class Config:
        from_attributes = True


class BlogListResponse(BaseModel):
    items: list[BlogRead]
    next_cursor: Optional[str] = None
