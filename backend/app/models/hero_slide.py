from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HeroSlide(Base):
    __tablename__ = "hero_slides"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    image_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    subtitle: Mapped[str | None] = mapped_column(Text())
    cta_label: Mapped[str | None] = mapped_column(String(255))
    cta_href: Mapped[str | None] = mapped_column(String(512))
    sort: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    updated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
