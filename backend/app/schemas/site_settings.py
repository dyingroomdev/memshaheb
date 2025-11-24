from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class SiteSettingsRead(BaseModel):
    id: int
    social_links: Optional[dict[str, Any]]
    theme: Optional[dict[str, Any]]
    nav_links: Optional[list[dict[str, Any]]]
    site_title: Optional[str]
    site_tagline: Optional[str]
    seo_description: Optional[str]
    logo_url: Optional[str]
    favicon_url: Optional[str]
    seo_image_url: Optional[str]
    hero_title: Optional[str]
    hero_tagline: Optional[str]
    hero_body: Optional[str]
    hero_primary_label: Optional[str]
    hero_primary_href: Optional[str]
    hero_secondary_label: Optional[str]
    hero_secondary_href: Optional[str]
    hero_featured_blog_id: Optional[int]
    contact_phone: Optional[str]
    contact_email: Optional[str]
    google_analytics_id: Optional[str]
    google_site_verification: Optional[str]
    bing_site_verification: Optional[str]
    manual_total_views: int
    ga_view_sample: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    social_links: Optional[dict[str, Any]] = None
    theme: Optional[dict[str, Any]] = None
    nav_links: Optional[list[dict[str, Any]]] = None
    site_title: Optional[str] = None
    site_tagline: Optional[str] = None
    seo_description: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    seo_image_url: Optional[str] = None
    hero_title: Optional[str] = None
    hero_tagline: Optional[str] = None
    hero_body: Optional[str] = None
    hero_primary_label: Optional[str] = None
    hero_primary_href: Optional[str] = None
    hero_secondary_label: Optional[str] = None
    hero_secondary_href: Optional[str] = None
    hero_featured_blog_id: Optional[int] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    google_analytics_id: Optional[str] = None
    google_site_verification: Optional[str] = None
    bing_site_verification: Optional[str] = None
    manual_total_views: Optional[int] = None
    ga_view_sample: Optional[int] = None
