from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, String, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Philosophy(Base):
    __tablename__ = "philosophy"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str | None] = mapped_column(String(255))
    subtitle: Mapped[str | None] = mapped_column(Text())
    content: Mapped[str | None] = mapped_column(Text())
    manifesto_blocks: Mapped[list[dict] | None] = mapped_column(JSON)
    legacy_manifesto: Mapped[str | None] = mapped_column(Text())
    updated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    updated_by = relationship("User", foreign_keys=[updated_by_id])
