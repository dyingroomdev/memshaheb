"""Add manual analytics fields

Revision ID: 0018_analytics_views
Revises: 0017_brand_analytics
Create Date: 2025-03-10 00:00:05
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0018_analytics_views"
down_revision: Union[str, None] = "0017_brand_analytics"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("manual_total_views", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("site_settings", sa.Column("ga_view_sample", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("site_settings", "ga_view_sample")
    op.drop_column("site_settings", "manual_total_views")
