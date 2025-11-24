"""Add analytics and webmaster keys

Revision ID: 0017_brand_analytics
Revises: 0016_user_profile_fields
Create Date: 2025-03-10 00:00:04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0017_brand_analytics"
down_revision: Union[str, None] = "0016_user_profile_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("google_analytics_id", sa.String(length=64), nullable=True))
    op.add_column("site_settings", sa.Column("google_site_verification", sa.String(length=255), nullable=True))
    op.add_column("site_settings", sa.Column("bing_site_verification", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "bing_site_verification")
    op.drop_column("site_settings", "google_site_verification")
    op.drop_column("site_settings", "google_analytics_id")
