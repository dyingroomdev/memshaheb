from datetime import datetime

from sqlalchemy import DateTime, Integer, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    social_links: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    theme: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    nav_links: Mapped[list | None] = mapped_column(JSONB, default=list)
    site_title: Mapped[str | None] = mapped_column(nullable=True)
    site_tagline: Mapped[str | None] = mapped_column(nullable=True)
    seo_description: Mapped[str | None] = mapped_column(nullable=True)
    logo_url: Mapped[str | None] = mapped_column(nullable=True)
    favicon_url: Mapped[str | None] = mapped_column(nullable=True)
    seo_image_url: Mapped[str | None] = mapped_column(nullable=True)
    hero_title: Mapped[str | None] = mapped_column(nullable=True)
    hero_tagline: Mapped[str | None] = mapped_column(nullable=True)
    hero_body: Mapped[str | None] = mapped_column(nullable=True)
    hero_primary_label: Mapped[str | None] = mapped_column(nullable=True)
    hero_primary_href: Mapped[str | None] = mapped_column(nullable=True)
    hero_secondary_label: Mapped[str | None] = mapped_column(nullable=True)
    hero_secondary_href: Mapped[str | None] = mapped_column(nullable=True)
    hero_featured_blog_id: Mapped[int | None] = mapped_column(nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(nullable=True)
    contact_email: Mapped[str | None] = mapped_column(nullable=True)
    google_analytics_id: Mapped[str | None] = mapped_column(nullable=True)
    google_site_verification: Mapped[str | None] = mapped_column(nullable=True)
    bing_site_verification: Mapped[str | None] = mapped_column(nullable=True)
    manual_total_views: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")
    ga_view_sample: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
