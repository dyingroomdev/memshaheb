from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MuseumArtifact(Base):
    __tablename__ = "museum_artifacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("museum_rooms.id", ondelete="CASCADE"), nullable=False)
    painting_id: Mapped[int] = mapped_column(ForeignKey("paintings.id", ondelete="CASCADE"), nullable=False)
    sort: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hotspot: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    room = relationship("MuseumRoom", backref="artifacts")
    painting = relationship("Painting", backref="artifacts")
