from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def reset_dependencies():
    # Ensure dependency overrides are cleared after each test.
    original_overrides = app.dependency_overrides.copy()
    yield
    app.dependency_overrides = original_overrides


@pytest.fixture
def fake_site_settings_session():
    from app.models.site_settings import SiteSettings

    class _Query:
        def __init__(self, result):
            self._result = result

        def order_by(self, *args, **kwargs):
            return self

        def first(self):
            return self._result

    class _Session:
        def __init__(self):
            self._settings = SiteSettings(id=1, social_links={"twitter": "https://twitter.com/example"}, theme={"mode": "dark"})

        def query(self, model):
            assert model is SiteSettings
            return _Query(self._settings)

        def add(self, instance):
            self._settings = instance

        def commit(self):
            return None

        def refresh(self, instance):
            return None

    def _override():
        yield _Session()

    return _override
