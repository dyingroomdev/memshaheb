"""Add blog categories, SEO fields, and author role

Revision ID: 0010_blog_categories_and_seo
Revises: 0009_painting_publish_default
Create Date: 2025-03-10 00:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0010_blog_categories_and_seo"
down_revision: Union[str, None] = "0009_painting_publish_default"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add AUTHOR role to enum
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'AUTHOR'")

    op.create_table(
        "blog_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_blog_categories_slug"),
    )
    op.create_index("ix_blog_categories_slug", "blog_categories", ["slug"], unique=False)

    op.add_column("blogs", sa.Column("category_id", sa.Integer(), nullable=True))
    op.add_column("blogs", sa.Column("author_id", sa.Integer(), nullable=True))
    op.add_column("blogs", sa.Column("meta_title", sa.String(length=255), nullable=True))
    op.add_column("blogs", sa.Column("meta_description", sa.String(length=512), nullable=True))
    op.add_column("blogs", sa.Column("canonical_url", sa.String(length=512), nullable=True))
    op.add_column("blogs", sa.Column("og_image_url", sa.String(length=1024), nullable=True))
    op.create_index("ix_blogs_category_id", "blogs", ["category_id"], unique=False)
    op.create_index("ix_blogs_author_id", "blogs", ["author_id"], unique=False)
    op.create_foreign_key("fk_blogs_category_id", "blogs", "blog_categories", ["category_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_blogs_author_id", "blogs", "users", ["author_id"], ["id"], ondelete="SET NULL")
    op.execute(
        """
        UPDATE blogs
        SET meta_title = title,
            meta_description = COALESCE(excerpt, substring(content_md from 1 for 240)),
            og_image_url = cover_url,
            author_id = COALESCE(author_id, created_by_id)
        """
    )


def downgrade() -> None:
    op.drop_constraint("fk_blogs_author_id", "blogs", type_="foreignkey")
    op.drop_constraint("fk_blogs_category_id", "blogs", type_="foreignkey")
    op.drop_index("ix_blogs_author_id", table_name="blogs")
    op.drop_index("ix_blogs_category_id", table_name="blogs")
    op.drop_column("blogs", "og_image_url")
    op.drop_column("blogs", "canonical_url")
    op.drop_column("blogs", "meta_description")
    op.drop_column("blogs", "meta_title")
    op.drop_column("blogs", "author_id")
    op.drop_column("blogs", "category_id")
    op.drop_index("ix_blog_categories_slug", table_name="blog_categories")
    op.drop_table("blog_categories")
    # Note: cannot fully revert ENUM value removal safely in PostgreSQL
