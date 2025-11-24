import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.blog_category import BlogCategory


class HomeSectionKind(str, enum.Enum):
    AD = "AD"
    CATEGORY = "CATEGORY"


class HomeSection(Base):
    __tablename__ = "home_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[HomeSectionKind] = mapped_column(Enum(HomeSectionKind, name="home_section_kind"), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    subtitle: Mapped[str | None] = mapped_column(String(512))
    image_url: Mapped[str | None] = mapped_column(String(1024))
    target_url: Mapped[str | None] = mapped_column(String(1024))
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("blog_categories.id", ondelete="SET NULL"))
    sort_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    category = relationship(BlogCategory)
