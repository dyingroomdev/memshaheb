import base64
import io
from typing import Optional

import httpx
from PIL import Image, ImageFilter


def _fetch_image_bytes(url: str) -> Optional[bytes]:
    try:
        response = httpx.get(url, timeout=10)
        response.raise_for_status()
        return response.content
    except httpx.HTTPError:
        return None


def generate_lqip(image_url: str, size: tuple[int, int] = (20, 20)) -> Optional[str]:
    image_bytes = _fetch_image_bytes(image_url)
    if image_bytes is None:
        return None

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img = img.convert("RGB")
            img.thumbnail(size, Image.LANCZOS)
            img = img.filter(ImageFilter.GaussianBlur(radius=1))
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=30)
            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    except Exception:
        return None
