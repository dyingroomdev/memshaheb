"""Add structured fields to philosophy"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0008_philosophy_structured"
down_revision: Union[str, None] = "0007_biography_name"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'philosophy' AND column_name = 'vision_rich_text'
            ) THEN
                ALTER TABLE philosophy RENAME COLUMN vision_rich_text TO content;
            ELSIF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'philosophy' AND column_name = 'content'
            ) THEN
                ALTER TABLE philosophy ADD COLUMN content TEXT;
            END IF;
        END$$
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'philosophy' AND column_name = 'manifesto_rich_text'
            ) THEN
                ALTER TABLE philosophy RENAME COLUMN manifesto_rich_text TO legacy_manifesto;
            ELSIF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'philosophy' AND column_name = 'legacy_manifesto'
            ) THEN
                ALTER TABLE philosophy ADD COLUMN legacy_manifesto TEXT;
            END IF;
        END$$
        """
    )

    op.execute(
        "ALTER TABLE philosophy ADD COLUMN IF NOT EXISTS title VARCHAR(255)"
    )
    op.execute(
        "ALTER TABLE philosophy ADD COLUMN IF NOT EXISTS subtitle TEXT"
    )
    op.execute(
        "ALTER TABLE philosophy ADD COLUMN IF NOT EXISTS manifesto_blocks JSONB DEFAULT '[]'::jsonb"
    )

    op.execute(
        "UPDATE philosophy SET title = COALESCE(title, 'Readable & Reflective')"
    )
    op.execute(
        "UPDATE philosophy SET subtitle = COALESCE(subtitle, 'A contemplative manifesto for night-first creativity—made skimmable for busy scrolls and expansive for deep reading.')"
    )
    op.execute(
        "UPDATE philosophy SET manifesto_blocks = '[]'::jsonb WHERE manifesto_blocks IS NULL"
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'philosophy' AND column_name = 'manifesto_blocks'
            ) THEN
                ALTER TABLE philosophy ALTER COLUMN manifesto_blocks DROP DEFAULT;
            END IF;
        END$$
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'philosophy' AND column_name = 'legacy_manifesto'
            ) THEN
                ALTER TABLE philosophy RENAME COLUMN legacy_manifesto TO manifesto_rich_text;
            END IF;
        END$$
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'philosophy' AND column_name = 'content'
            ) THEN
                ALTER TABLE philosophy RENAME COLUMN content TO vision_rich_text;
            END IF;
        END$$
        """
    )
    op.execute("ALTER TABLE philosophy DROP COLUMN IF EXISTS manifesto_blocks")
    op.execute("ALTER TABLE philosophy DROP COLUMN IF EXISTS subtitle")
    op.execute("ALTER TABLE philosophy DROP COLUMN IF EXISTS title")
