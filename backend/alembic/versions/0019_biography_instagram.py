"""Add instagram handle to biography

Revision ID: 0019_biography_instagram
Revises: 0018_analytics_views
Create Date: 2025-03-10 00:00:06
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0019_biography_instagram"
down_revision: Union[str, None] = "0018_analytics_views"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("biography", sa.Column("instagram_handle", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("biography", "instagram_handle")
