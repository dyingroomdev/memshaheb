from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PageBase(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    is_active: bool = True


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class PageRead(PageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PageSectionBase(BaseModel):
    title: str
    content: str
    order: int = Field(default=1)
    anchor: Optional[str] = None


class PageSectionCreate(PageSectionBase):
    page_id: int


class PageSectionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None
    anchor: Optional[str] = None


class PageSectionRead(PageSectionBase):
    id: int

    class Config:
        from_attributes = True


class PageWithSections(PageRead):
    sections: list[PageSectionRead] = []
