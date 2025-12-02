import re
from typing import Iterable


def slugify(value: str) -> str:
    """
    Generate a URL slug while allowing Unicode letters (e.g., Bangla).
    Keeps alphanumerics, letters from any script, spaces, and hyphens.
    """
    value = value.strip()
    # Normalize separators to spaces so we can collapse them later
    value = value.replace("_", " ")
    # Drop characters that are not word characters, whitespace, or hyphen
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE)
    # Collapse whitespace to single hyphen
    value = re.sub(r"\s+", "-", value, flags=re.UNICODE)
    # Collapse multiple hyphens
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-")


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
