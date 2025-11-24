"""Extend biography with structured fields"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0007_biography_name"
down_revision: Union[str, None] = "0006_site_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE biography ADD COLUMN IF NOT EXISTS name VARCHAR(255)")
    op.execute("ALTER TABLE biography ADD COLUMN IF NOT EXISTS tagline VARCHAR(512)")
    op.execute("ALTER TABLE biography ADD COLUMN IF NOT EXISTS quote TEXT")
    op.execute("ALTER TABLE biography ADD COLUMN IF NOT EXISTS quote_attribution VARCHAR(255)")
    op.execute(
        "ALTER TABLE biography ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb"
    )
    op.execute("UPDATE biography SET name = COALESCE(name, 'Nuf')")
    op.execute("UPDATE biography SET timeline = '[]'::jsonb WHERE timeline IS NULL")


def downgrade() -> None:
    op.execute("ALTER TABLE biography DROP COLUMN IF EXISTS timeline")
    op.execute("ALTER TABLE biography DROP COLUMN IF EXISTS quote_attribution")
    op.execute("ALTER TABLE biography DROP COLUMN IF EXISTS quote")
    op.execute("ALTER TABLE biography DROP COLUMN IF EXISTS tagline")
    op.execute("ALTER TABLE biography DROP COLUMN IF EXISTS name")
