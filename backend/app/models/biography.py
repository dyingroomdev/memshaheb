from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, Text, String, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Biography(Base):
    __tablename__ = "biography"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str | None] = mapped_column(String(255))
    tagline: Mapped[str | None] = mapped_column(String(512))
    quote: Mapped[str | None] = mapped_column(Text())
    quote_attribution: Mapped[str | None] = mapped_column(String(255))
    rich_text: Mapped[str | None] = mapped_column(Text())
    portrait_url: Mapped[str | None] = mapped_column(Text())
    instagram_handle: Mapped[str | None] = mapped_column(String(255))
    timeline: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON)
    updated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    updated_by = relationship("User", foreign_keys=[updated_by_id])
