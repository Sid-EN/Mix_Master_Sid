"""
個人化推薦測試 (G)

以收藏合成口味輪廓再推薦相近配方。重點在於：
無收藏時不硬湊個人化結果、已收藏的不再推薦、評分高低影響權重。
"""
import pytest

from backend.engine.recommender import build_taste_profile, recipe_vector, recommend


def account(client, email="alice@example.com"):
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "a-good-password"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


class TestRecipeVector:
    def test_synthesises_vector_for_known_recipe(self):
        from backend.data_store import cocktails
        negroni = next(r for r in cocktails() if r["id"] == "classic-negroni")
        vec = recipe_vector(negroni)
        assert vec is not None and len(vec) == 15

    def test_returns_none_when_no_resolvable_ingredients(self):
        assert recipe_vector({"ingredients": [{"slug": "nope", "amount": 1}]}) is None

    def test_returns_none_for_empty_recipe(self):
        assert recipe_vector({"ingredients": []}) is None


class TestTasteProfile:
    def test_no_favorites_yields_no_profile(self):
        profile, count = build_taste_profile({})
        assert profile is None and count == 0

    def test_ignores_unknown_slugs(self):
        profile, count = build_taste_profile({"not-a-recipe": {"rating": 5}})
        assert profile is None and count == 0

    def test_builds_from_known_favorites(self):
        profile, count = build_taste_profile({"classic-daiquiri": {"rating": 5}})
        assert profile is not None and count == 1
        assert len(profile) == 15

    def test_rating_affects_weight(self):
        """低分收藏代表不喜歡，不應與高分等量拉高偏好輪廓。"""
        high = build_taste_profile({"classic-daiquiri": {"rating": 5},
                                    "classic-negroni": {"rating": 1}})[0]
        low = build_taste_profile({"classic-daiquiri": {"rating": 1},
                                   "classic-negroni": {"rating": 5}})[0]
        assert high != low

    def test_unrated_favorite_still_counts(self):
        profile, count = build_taste_profile({"classic-daiquiri": {}})
        assert profile is not None and count == 1


class TestRecommend:
    def test_falls_back_to_popular_without_favorites(self):
        """無從推論偏好時應明確標示依據，而非佯裝個人化。"""
        r = recommend()
        assert r["basis"] == "popular"
        assert r["favoritesUsed"] == 0
        assert len(r["items"]) > 0

    def test_uses_favorites_when_available(self):
        r = recommend(favorites={"classic-daiquiri": {"rating": 5}})
        assert r["basis"] == "favorites" and r["favoritesUsed"] == 1
        assert all(i["similarity"] is not None for i in r["items"])

    def test_excludes_already_favorited(self):
        r = recommend(favorites={"classic-daiquiri": {"rating": 5},
                                 "classic-negroni": {"rating": 4}}, limit=50)
        slugs = {i["slug"] for i in r["items"]}
        assert "classic-daiquiri" not in slugs and "classic-negroni" not in slugs

    def test_respects_limit(self):
        assert len(recommend(limit=3)["items"]) == 3

    def test_results_sorted_by_score(self):
        scores = [i["score"] for i in recommend(favorites={"classic-daiquiri": {"rating": 5}})["items"]]
        assert scores == sorted(scores, reverse=True)

    def test_owned_ingredients_reported(self):
        r = recommend(owned=["tanqueray-gin", "campari", "sweet-vermouth"], limit=50)
        assert any(i["makeableRatio"] > 0 for i in r["items"])

    def test_similar_recipes_rank_higher(self):
        """收藏酸味調酒後，酸味類配方應排在烈酒基調之前。"""
        r = recommend(favorites={"classic-daiquiri": {"rating": 5},
                                 "whiskey-sour": {"rating": 5}}, limit=50)
        ranks = {i["slug"]: n for n, i in enumerate(r["items"])}
        assert ranks.get("mai-tai", 999) < ranks.get("manhattan", 999)

    def test_profile_flavors_are_named(self):
        r = recommend(favorites={"classic-daiquiri": {"rating": 5}})
        assert isinstance(r["profileFlavors"], list)


class TestEndpoint:
    def test_available_without_login(self, auth_client):
        r = auth_client.get("/api/v1/engine/recommendations")
        assert r.status_code == 200 and r.json()["basis"] == "popular"

    def test_uses_synced_favorites(self, auth_client):
        headers = account(auth_client)
        auth_client.put("/api/v1/sync/favorites",
                        json={"value": {"classic-daiquiri": {"rating": 5}}}, headers=headers)
        body = auth_client.get("/api/v1/engine/recommendations", headers=headers).json()
        assert body["basis"] == "favorites" and body["favoritesUsed"] == 1

    def test_uses_synced_bar(self, auth_client):
        headers = account(auth_client)
        auth_client.put("/api/v1/sync/my-bar",
                        json={"value": ["tanqueray-gin", "campari", "sweet-vermouth"]},
                        headers=headers)
        items = auth_client.get("/api/v1/engine/recommendations?limit=20",
                                headers=headers).json()["items"]
        assert any(i["makeableRatio"] > 0 for i in items)

    def test_invalid_token_falls_back_to_popular(self, auth_client):
        """權杖無效不應讓端點失敗，退回未登入行為即可。"""
        r = auth_client.get("/api/v1/engine/recommendations",
                            headers={"Authorization": "Bearer not-a-token"})
        assert r.status_code == 200 and r.json()["basis"] == "popular"

    @pytest.mark.parametrize("limit", [0, 21, -1])
    def test_rejects_out_of_range_limit(self, auth_client, limit):
        assert auth_client.get(f"/api/v1/engine/recommendations?limit={limit}").status_code == 422

    def test_malformed_sync_data_does_not_break(self, auth_client):
        """同步資料若形狀異常，推薦仍應可用。"""
        headers = account(auth_client)
        auth_client.put("/api/v1/sync/favorites", json={"value": []}, headers=headers)
        assert auth_client.get("/api/v1/engine/recommendations", headers=headers).status_code == 200
