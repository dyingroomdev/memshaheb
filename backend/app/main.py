from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.routers import auth, health, users, media
from app.api.routers import biography, blog_categories, blogs, hero_slides, philosophy, paintings, site_settings, home_sections
from app.api.routers import pages, submissions, analytics
from app.api.routers.commerce import products as commerce_products
from app.api.routers.integrations import woocommerce
from app.api.routers.museum import artifacts, rooms
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.rate_limit import limiter
from app.middleware.request_id import RequestIDMiddleware


configure_logging()

tags_metadata = [
    {"name": "health", "description": "Service health and readiness probes."},
    {"name": "auth", "description": "Authentication and authorization endpoints."},
    {"name": "users", "description": "User management and RBAC tools."},
    {"name": "hero-slides", "description": "Homepage hero slide management."},
    {"name": "biography", "description": "Artist biography content."},
    {"name": "philosophy", "description": "Philosophy and manifesto content."},
    {"name": "media", "description": "Media uploads and asset library."},
    {"name": "site-settings", "description": "Global site configuration and social links."},
    {"name": "blogs", "description": "Blog publishing workflows."},
    {"name": "blog-categories", "description": "Blog categories for magazine taxonomy."},
    {"name": "home-sections", "description": "Homepage configurable sections (ads, categories)."},
    {"name": "paintings", "description": "Paintings catalog and metadata."},
    {"name": "museum-rooms", "description": "Virtual museum room management."},
    {"name": "museum-artifacts", "description": "Virtual museum artifacts."},
    {"name": "commerce", "description": "Commerce catalog and product syncs."},
    {"name": "integrations:woocommerce", "description": "WooCommerce integration and webhooks."},
]

app = FastAPI(title="Memshaheb Magazine API", version="0.1.0", openapi_tags=tags_metadata)

app.add_middleware(RequestIDMiddleware)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(media.router)
app.include_router(hero_slides.router)
app.include_router(biography.router)
app.include_router(philosophy.router)
app.include_router(site_settings.router)
app.include_router(blog_categories.router)
app.include_router(home_sections.router)
app.include_router(blogs.router)
app.include_router(pages.router)
app.include_router(submissions.router)
app.include_router(analytics.router)
app.include_router(paintings.router)
app.include_router(rooms.router)
app.include_router(artifacts.router)
app.include_router(commerce_products.router)
app.include_router(woocommerce.router)

app.mount(
    "/media",
    StaticFiles(directory=settings.MEDIA_LOCAL_ROOT, check_dir=False),
    name="media",
)
