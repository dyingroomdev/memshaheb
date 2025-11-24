"""Add hero masthead settings

Revision ID: 0015_hero_masthead_settings
Revises: 0014_brand_settings
Create Date: 2025-03-10 00:00:02
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0015_hero_masthead_settings"
down_revision: Union[str, None] = "0014_brand_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("hero_title", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("hero_tagline", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("hero_body", sa.Text(), nullable=True))
    op.add_column("site_settings", sa.Column("hero_primary_label", sa.String(length=120), nullable=True))
    op.add_column("site_settings", sa.Column("hero_primary_href", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("hero_secondary_label", sa.String(length=120), nullable=True))
    op.add_column("site_settings", sa.Column("hero_secondary_href", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("hero_featured_blog_id", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "hero_featured_blog_id")
    op.drop_column("site_settings", "hero_secondary_href")
    op.drop_column("site_settings", "hero_secondary_label")
    op.drop_column("site_settings", "hero_primary_href")
    op.drop_column("site_settings", "hero_primary_label")
    op.drop_column("site_settings", "hero_body")
    op.drop_column("site_settings", "hero_tagline")
    op.drop_column("site_settings", "hero_title")
