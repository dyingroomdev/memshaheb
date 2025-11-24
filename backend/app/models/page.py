from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Page(Base):
    __tablename__ = "pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    sections = relationship("PageSection", back_populates="page", cascade="all, delete-orphan", order_by="PageSection.order")


class PageSection(Base):
    __tablename__ = "page_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    page_id: Mapped[int] = mapped_column(Integer, ForeignKey("pages.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text(), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    anchor: Mapped[str | None] = mapped_column(String(120))

    page = relationship(Page, back_populates="sections")
