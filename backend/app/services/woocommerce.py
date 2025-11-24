import base64
import hashlib
import hmac
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional
from urllib.parse import urljoin

import httpx

from app.core.config import settings
from app.models.painting import Painting
from app.models.wc_link import WCLink, WCProductKind, WCSyncState


class WooCommerceConfigurationError(RuntimeError):
    pass


class WooCommerceAPIError(RuntimeError):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(f"WooCommerce API error {status_code}: {detail}")
        self.status_code = status_code
        self.detail = detail


@dataclass(slots=True)
class SyncResult:
    wc_product_id: Optional[int]
    sync_state: WCSyncState
    payload: Dict[str, Any]


def _ensure_configured() -> None:
    if not (settings.WC_STORE_URL and settings.WC_CONSUMER_KEY and settings.WC_CONSUMER_SECRET):
        raise WooCommerceConfigurationError("WooCommerce integration is not configured.")


def _request(
    method: str,
    path: str,
    *,
    params: Optional[dict[str, Any]] = None,
    json: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    _ensure_configured()
    base_url = settings.WC_STORE_URL.rstrip("/") + "/wp-json/wc/" + settings.WC_API_VERSION.strip("/")
    url = urljoin(base_url + "/", path.lstrip("/"))
    auth = (settings.WC_CONSUMER_KEY, settings.WC_CONSUMER_SECRET)

    backoff = settings.WC_RETRY_BACKOFF_SECONDS
    max_attempts = max(settings.WC_MAX_RETRIES, 1)
    last_error: Optional[httpx.Response] = None

    for attempt in range(1, max_attempts + 1):
        try:
            response = httpx.request(method, url, params=params, json=json, auth=auth, timeout=20)
        except httpx.HTTPError as exc:
            if attempt == max_attempts:
                raise WooCommerceAPIError(-1, str(exc)) from exc
            time.sleep(backoff * attempt)
            continue

        if response.status_code >= 500:
            last_error = response
            if attempt == max_attempts:
                raise WooCommerceAPIError(response.status_code, response.text)
            time.sleep(backoff * attempt)
            continue

        if response.status_code >= 400:
            raise WooCommerceAPIError(response.status_code, response.text)

        return response.json()

    # Should never reach here
    if last_error is not None:
        raise WooCommerceAPIError(last_error.status_code, last_error.text)
    raise WooCommerceAPIError(-1, "Unknown error")


def _build_payload_for_painting(painting: Painting) -> dict[str, Any]:
    status = "publish" if painting.published_at else "draft"
    description = painting.description or ""
    short_description = description[:250] if description else ""
    payload: dict[str, Any] = {
        "name": painting.title,
        "type": "simple",
        "status": status,
        "description": description,
        "short_description": short_description,
        "images": [{"src": painting.image_url}] if painting.image_url else [],
        "meta_data": [
            {"key": "medium", "value": painting.medium or ""},
            {"key": "dimensions", "value": painting.dimensions or ""},
            {"key": "year", "value": painting.year or ""},
        ],
    }
    return payload


def sync_painting(painting: Painting, link: WCLink | None = None) -> SyncResult:
    payload = _build_payload_for_painting(painting)
    if link and link.wc_product_id:
        path = f"products/{link.wc_product_id}"
        result = _request("PUT", path, json=payload)
        wc_product_id = result.get("id", link.wc_product_id)
    elif painting.wc_product_id:
        path = f"products/{painting.wc_product_id}"
        result = _request("PUT", path, json=payload)
        wc_product_id = result.get("id", painting.wc_product_id)
    else:
        result = _request("POST", "products", json=payload)
        wc_product_id = result.get("id")

    return SyncResult(wc_product_id=wc_product_id, sync_state=WCSyncState.SYNCED, payload=payload)


def verify_webhook_signature(raw_body: bytes, signature: str | None) -> bool:
    if not settings.WC_WEBHOOK_SECRET:
        return False
    if not signature:
        return False
    digest = hmac.new(
        settings.WC_WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)
