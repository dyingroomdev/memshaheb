"""Add blogs table

Revision ID: 0004_blog_posts
Revises: 0003_paintings_and_museum
Create Date: 2024-05-04 04:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0004_blog_posts"
down_revision: Union[str, None] = "0003_paintings_and_museum"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "blogs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("content_md", sa.Text(), nullable=False),
        sa.Column("cover_url", sa.String(length=1024), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String(length=64)), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_blogs_slug"),
    )
    op.create_index("ix_blogs_slug", "blogs", ["slug"], unique=False)
    op.create_index("ix_blogs_published_at", "blogs", ["published_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_blogs_published_at", table_name="blogs")
    op.drop_index("ix_blogs_slug", table_name="blogs")
    op.drop_table("blogs")
