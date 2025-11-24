import re
from typing import Iterable


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"\s+", "-", value)
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
