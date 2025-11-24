from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl, field_validator

from app.models.home_section import HomeSectionKind


class HomeSectionBase(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    target_url: Optional[str] = None
    category_id: Optional[int] = None
    sort_order: int = 1
    enabled: bool = True
    kind: HomeSectionKind

    @field_validator("target_url")
    @classmethod
    def validate_target_url(cls, v):
        if v is None or v == "":
            return v
        # Basic validation
        _ = HttpUrl(url=v)
        return v


class HomeSectionCreate(HomeSectionBase):
    pass


class HomeSectionUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    target_url: Optional[str] = None
    category_id: Optional[int] = None
    sort_order: Optional[int] = None
    enabled: Optional[bool] = None
    kind: Optional[HomeSectionKind] = None


class HomeSectionRead(HomeSectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
