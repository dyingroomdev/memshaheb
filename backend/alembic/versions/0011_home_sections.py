"""Add home sections for ads and categories

Revision ID: 0011_home_sections
Revises: 0010_blog_categories_and_seo
Create Date: 2025-03-10 00:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0011_home_sections"
down_revision: Union[str, None] = "0010_blog_categories_and_seo"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ensure enum exists without failing if already created
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'home_section_kind') THEN
                CREATE TYPE home_section_kind AS ENUM ('AD', 'CATEGORY');
            END IF;
        END$$;
        """
    )

    home_section_kind = sa.dialects.postgresql.ENUM(
        "AD", "CATEGORY", name="home_section_kind", create_type=False
    )

    op.create_table(
        "home_sections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("kind", home_section_kind, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("subtitle", sa.String(length=512), nullable=True),
        sa.Column("image_url", sa.String(length=1024), nullable=True),
        sa.Column("target_url", sa.String(length=1024), nullable=True),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["blog_categories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_home_sections_sort", "home_sections", ["sort_order"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_home_sections_sort", table_name="home_sections")
    op.drop_table("home_sections")
    op.execute("DROP TYPE IF EXISTS home_section_kind")
