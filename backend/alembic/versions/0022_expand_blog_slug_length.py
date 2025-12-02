"""Expand blog slug length for long Unicode titles

Revision ID: 0022_expand_blog_slug_length
Revises: 0021_clear_nuf_text
Create Date: 2025-12-02 09:45:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0022_expand_blog_slug_length"
down_revision: Union[str, None] = "0021_clear_nuf_text"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("blogs", "slug", existing_type=sa.String(length=255), type_=sa.String(length=512), nullable=False)


def downgrade() -> None:
    op.alter_column("blogs", "slug", existing_type=sa.String(length=512), type_=sa.String(length=255), nullable=False)
