"""配方與材料 API 整合測試 (B3)。"""
import pytest

pytestmark = pytest.mark.integration


class TestRecipeList:
    def test_returns_total_and_items(self, client):
        r = client.get("/api/v1/recipes")
        assert r.status_code == 200
        body = r.json()
        assert "total" in body and "items" in body
        assert body["total"] > 0

    @pytest.mark.parametrize("limit", [1, 20, 100, 200, 500])
    def test_accepts_documented_limits(self, client, limit):
        """迴歸：limit 上限曾為 100，但前端 5 處以 limit=200 請求，一律 422。"""
        r = client.get(f"/api/v1/recipes?limit={limit}")
        assert r.status_code == 200, f"limit={limit} 應被接受"
        assert len(r.json()["items"]) <= limit

    @pytest.mark.parametrize("limit", [0, -1, 501, 10000])
    def test_rejects_out_of_range_limits(self, client, limit):
        assert client.get(f"/api/v1/recipes?limit={limit}").status_code == 422

    def test_offset_paginates_without_overlap(self, client):
        first = client.get("/api/v1/recipes?limit=5&offset=0").json()["items"]
        second = client.get("/api/v1/recipes?limit=5&offset=5").json()["items"]
        assert {r["id"] for r in first}.isdisjoint({r["id"] for r in second})

    def test_type_filter(self, client):
        items = client.get("/api/v1/recipes?type=classic&limit=500").json()["items"]
        assert items and all(r["type"] == "classic" for r in items)

    def test_ingredients_carry_display_names(self, client):
        """迴歸：材料只回傳 slug，前端每一列都顯示佔位字串「材料」。"""
        items = client.get("/api/v1/recipes?limit=500").json()["items"]
        bad = [
            (r["id"], ing.get("slug"))
            for r in items for ing in r.get("ingredients", [])
            if not ing.get("name") or not ing.get("nameZh")
        ]
        assert not bad, f"材料缺少顯示名稱：{bad[:10]}"


class TestRecipeDetail:
    def test_lookup_by_id(self, client):
        r = client.get("/api/v1/recipes/classic-negroni")
        assert r.status_code == 200
        assert r.json()["id"] == "classic-negroni"

    def test_unknown_recipe_returns_404(self, client):
        assert client.get("/api/v1/recipes/no-such-recipe").status_code == 404

    def test_detail_ingredients_have_names(self, client):
        for ing in client.get("/api/v1/recipes/classic-negroni").json()["ingredients"]:
            assert ing.get("name") and ing.get("nameZh")
            assert ing["name"] != ing.get("slug"), "name 不應只是 slug"

    def test_classic_endpoint_returns_only_classics(self, client):
        data = client.get("/api/v1/recipes/classic").json()
        assert data and all(r["type"] == "classic" for r in data)


class TestIngredients:
    def test_list(self, client):
        body = client.get("/api/v1/ingredients?limit=500").json()
        assert body["total"] > 0

    def test_detail(self, client):
        r = client.get("/api/v1/ingredients/tanqueray-gin")
        assert r.status_code == 200 and r.json()["id"] == "tanqueray-gin"

    def test_unknown_ingredient_returns_404(self, client):
        assert client.get("/api/v1/ingredients/no-such-ingredient").status_code == 404

    @pytest.mark.parametrize("slug", [
        "buffalo-trace-bourbon", "laphroaig-scotch", "aperture-pisco", "grapefruit-soda",
    ])
    def test_newly_added_ingredients_exist(self, client, slug):
        """迴歸：這 4 種材料被配方引用卻不存在於目錄中。"""
        assert client.get(f"/api/v1/ingredients/{slug}").status_code == 200

    def test_search_requires_query(self, client):
        assert client.get("/api/v1/ingredients/search").status_code == 422

    def test_search_returns_matches(self, client):
        r = client.get("/api/v1/ingredients/search?q=gin")
        assert r.status_code == 200

    def test_categories(self, client):
        assert client.get("/api/v1/ingredients/categories").status_code == 200


class TestSummaryFields:
    """
    列表視圖只顯示名稱、手法與等第，卻傳回含 story、steps、tips 的完整配方，
    51 道即達 121 KB。fields=summary 僅回傳列表所需欄位。
    """

    def test_summary_is_much_smaller(self, client):
        full = client.get("/api/v1/recipes?limit=500&fields=full")
        summary = client.get("/api/v1/recipes?limit=500&fields=summary")
        assert len(summary.content) < len(full.content) * 0.2, "摘要應顯著小於完整內容"

    def test_summary_keeps_fields_the_list_uses(self, client):
        items = client.get("/api/v1/recipes?limit=5&fields=summary").json()["items"]
        for r in items:
            for field in ["id", "slug", "nameZh", "method", "grade", "balanceScore"]:
                assert field in r, f"列表需要 {field}"

    def test_summary_omits_detail_fields(self, client):
        items = client.get("/api/v1/recipes?limit=5&fields=summary").json()["items"]
        for r in items:
            for field in ["story", "steps", "tips", "ingredients"]:
                assert field not in r, f"{field} 在列表中不顯示，不應傳送"

    def test_full_remains_the_default(self, client):
        """未指定時維持完整內容，既有整合不受影響。"""
        items = client.get("/api/v1/recipes?limit=1").json()["items"]
        assert "ingredients" in items[0]

    def test_total_is_unaffected_by_projection(self, client):
        full = client.get("/api/v1/recipes?limit=1&fields=full").json()["total"]
        summary = client.get("/api/v1/recipes?limit=1&fields=summary").json()["total"]
        assert full == summary

    def test_rejects_unknown_projection(self, client):
        assert client.get("/api/v1/recipes?fields=everything").status_code == 422
