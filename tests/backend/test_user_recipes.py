"""
使用者自建配方測試 (D1)

資料模型早已預留 type="user"，但先前只有讀取端點。
測試以獨立的暫存儲存檔執行，避免污染實際資料。
"""
import json

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("MIXMASTER_USER_RECIPES", str(tmp_path / "user_recipes.json"))
    monkeypatch.setenv("RATE_LIMIT_ENABLED", "false")
    from backend.main import app
    with TestClient(app) as c:
        yield c


VALID = {
    "nameZh": "測試特調",
    "nameEn": "Test Highball",
    "method": "build",
    "glassType": "highball",
    "ingredients": [
        {"slug": "tanqueray-gin", "amount": 2, "unit": "oz"},
        {"slug": "fresh-lime-juice", "amount": 0.75, "unit": "oz"},
        {"slug": "simple-syrup", "amount": 0.5, "unit": "oz"},
    ],
    "steps": ["加冰", "攪拌"],
    "tags": ["自創"],
}


class TestCreate:
    def test_creates_and_returns_201(self, client):
        r = client.post("/api/v1/recipes", json=VALID)
        assert r.status_code == 201
        body = r.json()
        assert body["type"] == "user"
        assert body["nameZh"] == "測試特調"
        assert body["id"]

    def test_engine_scores_user_recipe(self, client):
        """使用者配方應與經典配方採同一套評分模型。"""
        body = client.post("/api/v1/recipes", json=VALID).json()
        assert 0 <= body["balanceScore"] <= 100
        assert body["grade"] in {"A", "B", "C", "D"}

    def test_score_is_not_client_controlled(self, client):
        """前端指定的分數不應被採信。"""
        r = client.post("/api/v1/recipes", json={**VALID, "balanceScore": 100, "grade": "A"})
        body = r.json()
        recomputed = client.get(f"/api/v1/recipes/{body['id']}").json()
        assert recomputed["balanceScore"] == body["balanceScore"]

    def test_ingredient_names_are_resolved(self, client):
        body = client.post("/api/v1/recipes", json=VALID).json()
        for ing in body["ingredients"]:
            assert ing["nameZh"]

    def test_rejects_unknown_ingredient(self, client):
        r = client.post("/api/v1/recipes",
                        json={**VALID, "ingredients": [{"slug": "not-real", "amount": 1}]})
        assert r.status_code == 422
        assert "材料不存在" in r.json()["detail"]

    def test_rejects_unknown_method(self, client):
        assert client.post("/api/v1/recipes", json={**VALID, "method": "microwave"}).status_code == 422

    def test_rejects_empty_ingredients(self, client):
        assert client.post("/api/v1/recipes", json={**VALID, "ingredients": []}).status_code == 422

    def test_rejects_missing_name(self, client):
        payload = {k: v for k, v in VALID.items() if k != "nameZh"}
        assert client.post("/api/v1/recipes", json=payload).status_code == 422

    def test_rejects_non_positive_amount(self, client):
        r = client.post("/api/v1/recipes",
                        json={**VALID, "ingredients": [{"slug": "tanqueray-gin", "amount": 0}]})
        assert r.status_code == 422

    def test_duplicate_slug_conflicts(self, client):
        client.post("/api/v1/recipes", json={**VALID, "slug": "my-drink"})
        r = client.post("/api/v1/recipes", json={**VALID, "slug": "my-drink"})
        assert r.status_code == 409


class TestReadBack:
    def test_appears_in_list(self, client):
        created = client.post("/api/v1/recipes", json=VALID).json()
        ids = [r["id"] for r in client.get("/api/v1/recipes?limit=500").json()["items"]]
        assert created["id"] in ids

    def test_filterable_by_type(self, client):
        client.post("/api/v1/recipes", json=VALID)
        items = client.get("/api/v1/recipes?type=user&limit=500").json()["items"]
        assert items and all(r["type"] == "user" for r in items)

    def test_classics_still_listed(self, client):
        client.post("/api/v1/recipes", json=VALID)
        items = client.get("/api/v1/recipes?type=classic&limit=500").json()["items"]
        assert len(items) == 51

    def test_detail_endpoint(self, client):
        created = client.post("/api/v1/recipes", json=VALID).json()
        assert client.get(f"/api/v1/recipes/{created['id']}").status_code == 200


class TestUpdateDelete:
    def test_update(self, client):
        created = client.post("/api/v1/recipes", json=VALID).json()
        r = client.put(f"/api/v1/recipes/{created['id']}", json={**VALID, "nameZh": "改過的名字"})
        assert r.status_code == 200
        assert r.json()["nameZh"] == "改過的名字"
        assert r.json()["id"] == created["id"]

    def test_delete(self, client):
        created = client.post("/api/v1/recipes", json=VALID).json()
        assert client.delete(f"/api/v1/recipes/{created['id']}").status_code == 204
        assert client.get(f"/api/v1/recipes/{created['id']}").status_code == 404

    def test_update_unknown_returns_404(self, client):
        assert client.put("/api/v1/recipes/nope", json=VALID).status_code == 404

    def test_delete_unknown_returns_404(self, client):
        assert client.delete("/api/v1/recipes/nope").status_code == 404

    def test_classic_recipes_are_protected(self, client):
        """經典配方屬唯讀資產，不可經由使用者端點修改或刪除。"""
        assert client.put("/api/v1/recipes/classic-negroni", json=VALID).status_code == 403
        assert client.delete("/api/v1/recipes/classic-negroni").status_code == 403


class TestPersistence:
    def test_survives_new_client(self, client, tmp_path):
        created = client.post("/api/v1/recipes", json=VALID).json()
        saved = json.load(open(tmp_path / "user_recipes.json", encoding="utf-8"))
        assert [r["id"] for r in saved] == [created["id"]]

    def test_corrupt_store_does_not_break_api(self, client, tmp_path):
        (tmp_path / "user_recipes.json").write_text("{ not json", encoding="utf-8")
        assert client.get("/api/v1/recipes?limit=500").status_code == 200
