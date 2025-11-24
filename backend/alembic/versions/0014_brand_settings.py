"""Add brand settings fields

Revision ID: 0014_brand_settings
Revises: 0013_pages_and_submissions
Create Date: 2025-03-10 00:00:01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0014_brand_settings"
down_revision: Union[str, None] = "0013_pages_and_submissions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("site_title", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("site_tagline", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("seo_description", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("logo_url", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("favicon_url", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("seo_image_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "seo_image_url")
    op.drop_column("site_settings", "favicon_url")
    op.drop_column("site_settings", "logo_url")
    op.drop_column("site_settings", "seo_description")
    op.drop_column("site_settings", "site_tagline")
    op.drop_column("site_settings", "site_title")
