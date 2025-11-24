import json

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


def test_health_endpoint_returns_ok(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert settings.REQUEST_ID_HEADER in response.headers


def test_site_settings_get_uses_override(client: TestClient, fake_site_settings_session):
    from app.api.deps import get_db_session

    app.dependency_overrides[get_db_session] = fake_site_settings_session
    response = client.get("/site/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["social_links"]["twitter"] == "https://twitter.com/example"
    assert data["theme"]["mode"] == "dark"


def test_site_settings_patch_requires_auth(client: TestClient):
    response = client.patch("/site/settings", json={"theme": {"mode": "light"}})
    assert response.status_code == 401


def test_auth_login_requires_body(client: TestClient):
    response = client.post("/auth/login")
    assert response.status_code == 422


def test_users_create_requires_auth(client: TestClient):
    response = client.post("/users", json={})
    assert response.status_code == 401


def test_hero_slides_requires_auth(client: TestClient):
    response = client.get("/hero-slides")
    assert response.status_code == 401


def test_biography_requires_auth(client: TestClient):
    response = client.get("/biography")
    assert response.status_code == 401


def test_philosophy_requires_auth(client: TestClient):
    response = client.get("/philosophy")
    assert response.status_code == 401


def test_blogs_requires_auth(client: TestClient):
    response = client.get("/blogs")
    assert response.status_code == 401


def test_paintings_requires_auth(client: TestClient):
    response = client.get("/paintings")
    assert response.status_code == 401


def test_museum_rooms_requires_auth(client: TestClient):
    response = client.get("/museum/rooms")
    assert response.status_code == 401


def test_museum_artifacts_requires_auth(client: TestClient):
    response = client.get("/museum/artifacts")
    assert response.status_code == 401


def test_commerce_products_requires_auth(client: TestClient):
    response = client.get("/commerce/products")
    assert response.status_code == 401


def test_media_upload_requires_auth(client: TestClient):
    response = client.post("/media")
    assert response.status_code == 401


def test_wc_product_webhook_requires_secret(client: TestClient):
    payload = {"id": 123}
    body = json.dumps(payload)
    # signature absent -> should fail
    response = client.post(
        "/integrations/wc/webhooks/product",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 503


def test_wc_order_webhook_requires_secret(client: TestClient):
    payload = {"id": 456}
    body = json.dumps(payload)
    response = client.post(
        "/integrations/wc/webhooks/order",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 503
