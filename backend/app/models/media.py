from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MediaFile(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    alt: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    meta: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    owner = relationship("User", foreign_keys=[owner_id])
