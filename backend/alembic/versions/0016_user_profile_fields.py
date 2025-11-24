"""Add user profile fields

Revision ID: 0016_user_profile_fields
Revises: 0015_hero_masthead_settings
Create Date: 2025-03-10 00:00:03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0016_user_profile_fields"
down_revision: Union[str, None] = "0015_hero_masthead_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("bio", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "bio")
