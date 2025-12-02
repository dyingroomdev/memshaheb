import unicodedata
import re
from typing import Iterable


def _normalize_text(value: str) -> str:
    # NFC keeps Bangla and other scripts composed so diacritics stay attached.
    return unicodedata.normalize("NFC", value)


def slugify(value: str) -> str:
    """
    Generate a URL slug while allowing Unicode letters and diacritics (e.g., Bangla).
    Keeps letters/numbers/marks, spaces, and hyphens; strips punctuation/symbols.
    """
    value = _normalize_text(value.strip())
    cleaned = []
    for ch in value:
        cat = unicodedata.category(ch)
        if ch in {" ", "-", "_"}:
            cleaned.append(" ")
            continue
        if cat.startswith(("L", "N", "M")):  # Letters, Numbers, Marks (diacritics)
            cleaned.append(ch)
    collapsed = " ".join("".join(cleaned).split())
    slug = re.sub(r"\s+", "-", collapsed, flags=re.UNICODE)
    slug = re.sub(r"-{2,}", "-", slug)
    return slug.strip("-")


def unique_slug(base: str, existing_slugs: Iterable[str]) -> str:
    slug = slugify(base) or "item"
    existing = set(existing_slugs)
    if slug not in existing:
        return slug
    index = 2
    while True:
        candidate = f"{slug}-{index}"
        if candidate not in existing:
            return candidate
        index += 1
