"""Add pages, page_sections, submissions

Revision ID: 0013_pages_and_submissions
Revises: 0012_nav_links
Create Date: 2025-03-10 00:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0013_pages_and_submissions"
down_revision: Union[str, None] = "0012_nav_links"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "pages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_pages_slug", "pages", ["slug"], unique=False)

    op.create_table(
        "page_sections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("page_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("anchor", sa.String(length=120), nullable=True),
        sa.ForeignKeyConstraint(["page_id"], ["pages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_page_sections_page_id", "page_sections", ["page_id"], unique=False)
    op.create_index("ix_page_sections_order", "page_sections", ["order"], unique=False)

    op.create_table(
        "submissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_submissions_email", "submissions", ["email"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_submissions_email", table_name="submissions")
    op.drop_table("submissions")
    op.drop_index("ix_page_sections_order", table_name="page_sections")
    op.drop_index("ix_page_sections_page_id", table_name="page_sections")
    op.drop_table("page_sections")
    op.drop_index("ix_pages_slug", table_name="pages")
    op.drop_table("pages")
