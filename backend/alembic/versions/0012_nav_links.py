"""Add nav_links to site_settings

Revision ID: 0012_nav_links
Revises: 0011_home_sections
Create Date: 2025-03-10 00:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0012_nav_links"
down_revision: Union[str, None] = "0011_home_sections"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("site_settings", sa.Column("nav_links", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    # ensure default empty object to avoid null issues
    op.execute("UPDATE site_settings SET nav_links = '{}' WHERE nav_links IS NULL")


def downgrade() -> None:
    op.drop_column("site_settings", "nav_links")
