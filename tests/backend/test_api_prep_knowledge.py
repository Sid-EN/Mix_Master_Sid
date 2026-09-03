"""備料與知識庫 API 整合測試 (B3)。"""
import pytest

pytestmark = pytest.mark.integration


class TestPrep:
    def test_list_returns_items(self, client):
        body = client.get("/api/v1/prep?limit=100").json()
        items = body["items"] if isinstance(body, dict) else body
        assert items

    @pytest.mark.parametrize("limit", [1, 20, 100])
    def test_accepts_limits(self, client, limit):
        assert client.get(f"/api/v1/prep?limit={limit}").status_code == 200

    @pytest.mark.parametrize("limit", [0, 101])
    def test_rejects_out_of_range_limits(self, client, limit):
        assert client.get(f"/api/v1/prep?limit={limit}").status_code == 422

    def test_detail(self, client):
        r = client.get("/api/v1/prep/simple-syrup")
        assert r.status_code == 200
        assert r.json()["id"] == "simple-syrup"

    def test_unknown_prep_returns_404(self, client):
        assert client.get("/api/v1/prep/no-such-prep").status_code == 404

    def test_categories(self, client):
        assert client.get("/api/v1/prep/categories").status_code == 200

    def test_search_requires_query(self, client):
        assert client.get("/api/v1/prep/search").status_code == 422

    @pytest.mark.parametrize("q", ["syrup", "糖漿", "ginger"])
    def test_search(self, client, q):
        assert client.get(f"/api/v1/prep/search?q={q}").status_code == 200

    def test_every_prep_detail_is_reachable(self, client):
        body = client.get("/api/v1/prep?limit=100").json()
        items = body["items"] if isinstance(body, dict) else body
        for p in items:
            pid = p.get("id") or p.get("slug")
            assert client.get(f"/api/v1/prep/{pid}").status_code == 200, pid


class TestKnowledge:
    @pytest.mark.parametrize("kind", ["spirits", "wine"])
    def test_root_returns_sections(self, client, kind):
        r = client.get(f"/api/v1/knowledge/{kind}")
        assert r.status_code == 200
        assert isinstance(r.json(), dict) and r.json()

    @pytest.mark.parametrize("kind", ["spirits", "wine"])
    def test_every_section_is_reachable(self, client, kind):
        """章節鍵是由資料驅動的，逐一驗證避免資料改名後靜默 404。"""
        sections = client.get(f"/api/v1/knowledge/{kind}").json()
        for key in sections:
            r = client.get(f"/api/v1/knowledge/{kind}/{key}")
            assert r.status_code == 200, f"{kind}/{key} 應可存取"

    @pytest.mark.parametrize("kind", ["spirits", "wine"])
    def test_unknown_section_returns_404(self, client, kind):
        assert client.get(f"/api/v1/knowledge/{kind}/nope").status_code == 404


class TestAcademy:
    def test_curriculum(self, client):
        assert client.get("/api/v1/academy/curriculum").status_code == 200

    def test_articles(self, client):
        assert client.get("/api/v1/academy/articles").status_code == 200


class TestAppLevel:
    def test_health(self, client):
        assert client.get("/health").status_code == 200

    def test_root(self, client):
        assert client.get("/").status_code == 200

    def test_openapi_schema_is_valid(self, client):
        spec = client.get("/openapi.json").json()
        assert spec["paths"]
