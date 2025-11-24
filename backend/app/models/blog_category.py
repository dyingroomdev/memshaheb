from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BlogCategory(Base):
    __tablename__ = "blog_categories"
    __table_args__ = (UniqueConstraint("slug", name="uq_blog_categories_slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    posts = relationship("BlogPost", back_populates="category")
