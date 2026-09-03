"""引擎、批次、搜尋與知識庫 API 整合測試 (B3)。"""
import pytest

pytestmark = pytest.mark.integration


@pytest.fixture(scope="module")
def slugs(client):
    return [i["id"] for i in client.get("/api/v1/ingredients?limit=500").json()["items"]]


class TestEngineGenerate:
    def test_generates_recipe(self, client, slugs):
        r = client.post("/api/v1/engine/generate",
                        json={"availableIngredients": slugs[:8], "userLevel": 2})
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert body["recipe"]["nameEn"]

    def test_requires_ingredients(self, client):
        assert client.post("/api/v1/engine/generate", json={}).status_code == 422

    def test_score_within_bounds_and_grade_agrees(self, client, slugs):
        import random
        random.seed(3)
        for _ in range(10):
            sample = random.sample(slugs, 8)
            rec = client.post("/api/v1/engine/generate",
                              json={"availableIngredients": sample, "userLevel": 3}).json()["recipe"]
            score, grade = rec["balanceScore"], rec["grade"]
            assert 0 <= score <= 100
            expected = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 60 else "D"
            assert grade == expected

    def test_spirit_based_input_is_not_all_zero(self, client, slugs):
        """迴歸：生成配方曾有約三分之一得 0 分 D 級。"""
        import random
        random.seed(11)
        spirits = [s for s in slugs if "gin" in s or "rum" in s or "whisk" in s or "tequila" in s]
        scores = []
        for _ in range(10):
            sample = random.sample(spirits, min(3, len(spirits))) + random.sample(slugs, 5)
            rec = client.post("/api/v1/engine/generate",
                              json={"availableIngredients": sample, "userLevel": 3}).json()["recipe"]
            scores.append(rec["balanceScore"])
        assert sum(1 for s in scores if s == 0.0) <= 2, f"過多 0 分結果：{scores}"

    def test_unknown_ingredients_are_rejected_cleanly(self, client):
        r = client.post("/api/v1/engine/generate",
                        json={"availableIngredients": ["not-a-real-ingredient"], "userLevel": 1})
        assert r.status_code in (200, 400, 422)


class TestEngineSubstitute:
    def test_returns_suggestions(self, client, slugs):
        r = client.post("/api/v1/engine/substitute",
                        json={"missingSlug": slugs[0], "availableSlugs": slugs[1:8], "topN": 3})
        assert r.status_code == 200
        assert len(r.json()["suggestions"]) <= 3

    def test_flavor_wheel(self, client):
        assert client.get("/api/v1/engine/flavor-wheel").status_code == 200


class TestBatch:
    def test_scales_linearly(self, client):
        one = client.post("/api/v1/batch/calculate",
                          json={"recipeId": "classic-negroni", "multiplier": 1}).json()
        ten = client.post("/api/v1/batch/calculate",
                          json={"recipeId": "classic-negroni", "multiplier": 10}).json()
        for a, b in zip(one["ingredients"], ten["ingredients"], strict=False):
            assert b["scaledAmount"] == pytest.approx(a["scaledAmount"] * 10, rel=1e-6)

    def test_ingredient_names_are_resolved(self, client):
        """迴歸：批次結果曾顯示原始 slug（tanqueray-gin）且 nameZh 為空。"""
        body = client.post("/api/v1/batch/calculate",
                           json={"recipeId": "classic-negroni", "multiplier": 4}).json()
        for ing in body["ingredients"]:
            assert ing["nameZh"], "缺少中文名稱"
            assert ing["name"] != ing.get("slug"), "name 不應只是 slug"

    def test_unknown_recipe_returns_404(self, client):
        r = client.post("/api/v1/batch/calculate",
                        json={"recipeId": "nope", "multiplier": 2})
        assert r.status_code == 404

    @pytest.mark.parametrize("multiplier", [0.4, 0, -1, 101])
    def test_rejects_out_of_range_multiplier(self, client, multiplier):
        r = client.post("/api/v1/batch/calculate",
                        json={"recipeId": "classic-negroni", "multiplier": multiplier})
        assert r.status_code == 422

    def test_prep_batch(self, client):
        r = client.post("/api/v1/batch/calculate-prep",
                        json={"prepId": "simple-syrup", "multiplier": 4})
        assert r.status_code == 200
        assert r.json()["ingredients"]


class TestSearchAndKnowledge:
    def test_search_requires_query(self, client):
        assert client.get("/api/v1/search").status_code == 422

    @pytest.mark.parametrize("q", ["gin", "syrup", "daiquiri", "苦"])
    def test_search_returns_200(self, client, q):
        assert client.get(f"/api/v1/search?q={q}").status_code == 200

    def test_tags_and_hashtags(self, client):
        assert client.get("/api/v1/search/tags").status_code == 200
        assert client.get("/api/v1/search/hashtags").status_code == 200

    @pytest.mark.parametrize("path", [
        "/api/v1/knowledge/spirits", "/api/v1/knowledge/wine",
        "/api/v1/academy/curriculum", "/api/v1/academy/articles",
        "/api/v1/prep", "/api/v1/prep/categories", "/health",
    ])
    def test_endpoint_available(self, client, path):
        assert client.get(path).status_code == 200

    def test_unknown_knowledge_section_returns_404(self, client):
        assert client.get("/api/v1/knowledge/wine/not-a-section").status_code == 404
