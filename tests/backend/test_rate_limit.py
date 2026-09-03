"""
速率限制測試 (D4)

其餘測試會在數秒內送出數百次請求，因此全域關閉限流；此處以獨立的應用
實例開啟限流，確保這項保護真的會擋——「已接上」與「實際會擋」是兩回事。

注意 slowapi 有兩條回應路徑：
  - 全域預設限制由 SlowAPIMiddleware 攔截，回傳 {"error": ...}
  - 端點裝飾器會拋出 RateLimitExceeded，由本專案的處理器回傳 {"detail": ...}
"""
import importlib
import sys

import pytest
from fastapi.testclient import TestClient


def _rebuild(monkeypatch, **env):
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    import backend.config as config
    config.get_settings.cache_clear()
    import backend.api.routes_engine as routes_engine
    import backend.main as main
    importlib.reload(routes_engine)
    importlib.reload(main)
    return main


@pytest.fixture
def limited_client(monkeypatch):
    """全域限制設為 3/minute。"""
    main = _rebuild(monkeypatch, RATE_LIMIT_ENABLED="true", RATE_LIMIT_DEFAULT="3/minute")
    with TestClient(main.app) as c:
        yield c
    monkeypatch.undo()
    _rebuild(monkeypatch)


@pytest.fixture
def engine_limited_client(monkeypatch):
    """引擎端點限制設為 2/minute，全域維持寬鬆。"""
    main = _rebuild(monkeypatch, RATE_LIMIT_ENABLED="true",
                    RATE_LIMIT_DEFAULT="1000/minute", RATE_LIMIT_ENGINE="2/minute")
    with TestClient(main.app) as c:
        yield c
    monkeypatch.undo()
    _rebuild(monkeypatch)


class TestGlobalLimit:
    def test_requests_within_limit_succeed(self, limited_client):
        for i in range(3):
            assert limited_client.get("/health").status_code == 200, f"第 {i + 1} 次應通過"

    def test_exceeding_limit_returns_429(self, limited_client):
        for _ in range(3):
            limited_client.get("/health")
        assert limited_client.get("/health").status_code == 429

    def test_rejection_explains_the_limit(self, limited_client):
        for _ in range(4):
            r = limited_client.get("/health")
        assert r.status_code == 429
        assert "Rate limit exceeded" in r.json()["error"]

    def test_rate_limit_headers_are_exposed(self, limited_client):
        r = limited_client.get("/health")
        assert any(h.lower().startswith("x-ratelimit") for h in r.headers), \
            "應回傳 X-RateLimit-* 供客戶端自行節流"


class TestEngineLimit:
    """生成配方的運算成本高，限制應比全域更嚴格。"""

    def test_engine_has_stricter_limit_than_global(self, engine_limited_client):
        c = engine_limited_client
        slugs = [i["id"] for i in c.get("/api/v1/ingredients?limit=500").json()["items"]][:8]
        payload = {"availableIngredients": slugs, "userLevel": 2}

        assert c.post("/api/v1/engine/generate", json=payload).status_code == 200
        assert c.post("/api/v1/engine/generate", json=payload).status_code == 200
        r = c.post("/api/v1/engine/generate", json=payload)
        assert r.status_code == 429, "第 3 次生成應被擋下"
        assert "請求過於頻繁" in r.json()["detail"]

    def test_cheap_endpoints_unaffected_by_engine_limit(self, engine_limited_client):
        for _ in range(10):
            assert engine_limited_client.get("/health").status_code == 200


class TestDisabledByDefault:
    def test_test_suite_is_not_throttled(self, client):
        """預設設定下大量請求不應被擋，否則整個測試套件會不穩定。"""
        for _ in range(50):
            assert client.get("/health").status_code == 200
