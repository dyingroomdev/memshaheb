from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Painting(Base):
    __tablename__ = "paintings"
    __table_args__ = (UniqueConstraint("slug", name="uq_paintings_slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text())
    year: Mapped[int | None] = mapped_column(Integer)
    medium: Mapped[str | None] = mapped_column(String(255))
    dimensions: Mapped[str | None] = mapped_column(String(255))
    image_url: Mapped[str | None] = mapped_column(String(1024))
    lqip_data: Mapped[str | None] = mapped_column(Text())
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(String(64)))
    wc_product_id: Mapped[int | None] = mapped_column(Integer)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    updated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
