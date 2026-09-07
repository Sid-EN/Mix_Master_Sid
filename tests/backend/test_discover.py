"""
公開配方目錄與追蹤創作者（新功能 7、9）

兩個貫穿全篇的重點：
1. 公開目錄（is_public）與權杖分享（share_token）必須是兩件事——
   否則使用者以為只是把連結傳給朋友，作品卻被整站列出。
2. 任何公開端點都不得洩漏電子郵件。
"""
import pytest


def account(client, email):
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "a-good-password"})
    assert r.status_code == 201
    body = r.json()
    return {"Authorization": f"Bearer {body['access_token']}"}


def me(client, headers) -> int:
    return client.get("/api/v1/auth/me", headers=headers).json()["id"]


def make_recipe(client, headers, name="測試配方"):
    r = client.post("/api/v1/recipes", headers=headers, json={
        "nameZh": name,
        "ingredients": [{"slug": "tanqueray-gin", "amount": 2, "unit": "oz"}],
    })
    assert r.status_code == 201, r.text
    return r.json()["slug"]


@pytest.fixture
def alice(auth_client):
    return account(auth_client, "alice-discover@example.com")


@pytest.fixture
def bob(auth_client):
    return account(auth_client, "bob-discover@example.com")


class TestPublish:
    def test_requires_authentication(self, auth_client):
        assert auth_client.post("/api/v1/discover/recipes/x/publish").status_code == 401

    def test_owner_can_publish(self, auth_client, alice):
        slug = make_recipe(auth_client, alice)
        r = auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        assert r.status_code == 200
        assert r.json()["isPublic"] is True

    def test_publishing_creates_a_share_link(self, auth_client, alice):
        """目錄上的配方必須點得進去，否則列表只是死的。"""
        slug = make_recipe(auth_client, alice)
        token = auth_client.post(f"/api/v1/discover/recipes/{slug}/publish",
                                 headers=alice).json()["shareToken"]
        assert token
        assert auth_client.get(f"/api/v1/recipes/shared/{token}").status_code == 200

    def test_others_cannot_publish(self, auth_client, alice, bob):
        slug = make_recipe(auth_client, alice)
        assert auth_client.post(f"/api/v1/discover/recipes/{slug}/publish",
                                headers=bob).status_code == 404

    def test_publishing_twice_is_harmless(self, auth_client, alice):
        slug = make_recipe(auth_client, alice)
        first = auth_client.post(f"/api/v1/discover/recipes/{slug}/publish",
                                 headers=alice).json()
        second = auth_client.post(f"/api/v1/discover/recipes/{slug}/publish",
                                  headers=alice).json()
        # 重複發布不應更動發布時間或換掉連結
        assert first["publishedAt"] == second["publishedAt"]
        assert first["shareToken"] == second["shareToken"]

    def test_unpublish_removes_from_catalogue(self, auth_client, alice):
        slug = make_recipe(auth_client, alice)
        auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        assert auth_client.delete(f"/api/v1/discover/recipes/{slug}/publish",
                                  headers=alice).status_code == 204
        listed = auth_client.get("/api/v1/discover/recipes").json()
        assert slug not in [i["slug"] for i in listed["items"]]

    def test_unpublish_keeps_the_share_link_working(self, auth_client, alice):
        """下架是「不要再被所有人找到」，不是「讓已傳出去的連結失效」。"""
        slug = make_recipe(auth_client, alice)
        token = auth_client.post(f"/api/v1/discover/recipes/{slug}/publish",
                                 headers=alice).json()["shareToken"]
        auth_client.delete(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        assert auth_client.get(f"/api/v1/recipes/shared/{token}").status_code == 200


class TestCatalogue:
    def test_browsable_without_login(self, auth_client, alice):
        slug = make_recipe(auth_client, alice, "公開的酒")
        auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        r = auth_client.get("/api/v1/discover/recipes")
        assert r.status_code == 200
        assert slug in [i["slug"] for i in r.json()["items"]]

    def test_token_shared_recipes_are_not_listed(self, auth_client, alice):
        """只產生分享連結不等於公開；這是兩者最重要的差別。"""
        slug = make_recipe(auth_client, alice)
        auth_client.post(f"/api/v1/recipes/{slug}/share", headers=alice)
        listed = auth_client.get("/api/v1/discover/recipes").json()
        assert slug not in [i["slug"] for i in listed["items"]]

    def test_private_recipes_are_not_listed(self, auth_client, alice):
        slug = make_recipe(auth_client, alice)
        listed = auth_client.get("/api/v1/discover/recipes").json()
        assert slug not in [i["slug"] for i in listed["items"]]

    def test_author_email_is_never_exposed(self, auth_client, alice):
        slug = make_recipe(auth_client, alice)
        auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        body = auth_client.get("/api/v1/discover/recipes").text
        assert "alice-discover@example.com" not in body

    def test_can_filter_by_author(self, auth_client, alice, bob):
        a = make_recipe(auth_client, alice, "A 的酒")
        b = make_recipe(auth_client, bob, "B 的酒")
        for slug, headers in ((a, alice), (b, bob)):
            auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=headers)

        alice_id = me(auth_client, alice)
        items = auth_client.get("/api/v1/discover/recipes",
                                params={"author": alice_id}).json()["items"]
        assert [i["slug"] for i in items] == [a]

    def test_can_search_by_name(self, auth_client, alice):
        target = make_recipe(auth_client, alice, "獨特的名字")
        other = make_recipe(auth_client, alice, "另一杯")
        for slug in (target, other):
            auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        items = auth_client.get("/api/v1/discover/recipes",
                                params={"q": "獨特"}).json()["items"]
        assert [i["slug"] for i in items] == [target]

    def test_rejects_unknown_sort(self, auth_client):
        assert auth_client.get("/api/v1/discover/recipes",
                               params={"sort": "nope"}).status_code == 422

    def test_unrated_recipes_rank_last_not_as_zero(self, auth_client, alice, bob):
        """沒人評分與評分很低是兩回事，不能混為一談。"""
        rated = make_recipe(auth_client, alice, "有評分")
        unrated = make_recipe(auth_client, alice, "無評分")
        token = ""
        for slug in (rated, unrated):
            body = auth_client.post(f"/api/v1/discover/recipes/{slug}/publish",
                                    headers=alice).json()
            if slug == rated:
                token = body["shareToken"]
        auth_client.put(f"/api/v1/community/{token}/ratings",
                         json={"score": 1}, headers=bob)

        items = auth_client.get("/api/v1/discover/recipes",
                                params={"sort": "rating"}).json()["items"]
        order = [i["slug"] for i in items]
        assert order.index(rated) < order.index(unrated)

    def test_pagination_reports_total_not_page_size(self, auth_client, alice):
        for i in range(3):
            slug = make_recipe(auth_client, alice, f"配方 {i}")
            auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        body = auth_client.get("/api/v1/discover/recipes", params={"limit": 1}).json()
        assert len(body["items"]) == 1
        assert body["total"] >= 3


class TestCreators:
    def test_only_lists_users_with_public_recipes(self, auth_client, alice, bob):
        make_recipe(auth_client, bob)          # 未公開
        slug = make_recipe(auth_client, alice)
        auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)

        ids = [i["id"] for i in auth_client.get("/api/v1/discover/creators").json()["items"]]
        assert me(auth_client, alice) in ids
        assert me(auth_client, bob) not in ids

    def test_creator_list_has_no_email(self, auth_client, alice):
        slug = make_recipe(auth_client, alice)
        auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=alice)
        assert "alice-discover@example.com" not in auth_client.get(
            "/api/v1/discover/creators").text

    def test_creator_profile_counts_public_recipes_only(self, auth_client, alice):
        public = make_recipe(auth_client, alice, "公開")
        make_recipe(auth_client, alice, "私人")
        auth_client.post(f"/api/v1/discover/recipes/{public}/publish", headers=alice)
        body = auth_client.get(f"/api/v1/discover/creators/{me(auth_client, alice)}").json()
        assert body["recipeCount"] == 1

    def test_unknown_creator_returns_404(self, auth_client):
        assert auth_client.get("/api/v1/discover/creators/999999").status_code == 404


class TestFollowing:
    def test_requires_authentication(self, auth_client):
        assert auth_client.post("/api/v1/discover/creators/1/follow").status_code == 401

    def test_follow_and_unfollow(self, auth_client, alice, bob):
        bob_id = me(auth_client, bob)
        assert auth_client.post(f"/api/v1/discover/creators/{bob_id}/follow",
                                headers=alice).status_code == 204
        assert auth_client.get(f"/api/v1/discover/creators/{bob_id}",
                               headers=alice).json()["isFollowing"] is True
        assert auth_client.delete(f"/api/v1/discover/creators/{bob_id}/follow",
                                  headers=alice).status_code == 204
        assert auth_client.get(f"/api/v1/discover/creators/{bob_id}",
                               headers=alice).json()["isFollowing"] is False

    def test_cannot_follow_self(self, auth_client, alice):
        assert auth_client.post(f"/api/v1/discover/creators/{me(auth_client, alice)}/follow",
                                headers=alice).status_code == 422

    def test_following_twice_is_idempotent(self, auth_client, alice, bob):
        bob_id = me(auth_client, bob)
        auth_client.post(f"/api/v1/discover/creators/{bob_id}/follow", headers=alice)
        auth_client.post(f"/api/v1/discover/creators/{bob_id}/follow", headers=alice)
        assert auth_client.get("/api/v1/discover/following",
                               headers=alice).json()["total"] == 1

    def test_unfollowing_someone_not_followed_is_harmless(self, auth_client, alice, bob):
        assert auth_client.delete(f"/api/v1/discover/creators/{me(auth_client, bob)}/follow",
                                  headers=alice).status_code == 204

    def test_following_unknown_user_returns_404(self, auth_client, alice):
        assert auth_client.post("/api/v1/discover/creators/999999/follow",
                                headers=alice).status_code == 404

    def test_following_list_is_private_to_the_follower(self, auth_client, alice, bob):
        auth_client.post(f"/api/v1/discover/creators/{me(auth_client, bob)}/follow",
                         headers=alice)
        # bob 看不到 alice 追蹤了誰
        assert auth_client.get("/api/v1/discover/following", headers=bob).json()["total"] == 0

    def test_deleting_an_account_removes_its_follows(self, auth_client, alice, bob,
                                                     db_session):
        from backend.models.db_models import Follow, User
        auth_client.post(f"/api/v1/discover/creators/{me(auth_client, bob)}/follow",
                         headers=alice)
        db_session.query(User).delete()
        db_session.commit()
        assert db_session.query(Follow).count() == 0


class TestFeed:
    def test_requires_authentication(self, auth_client):
        assert auth_client.get("/api/v1/discover/feed").status_code == 401

    def test_shows_followed_creators_public_recipes(self, auth_client, alice, bob):
        slug = make_recipe(auth_client, bob, "Bob 的公開作品")
        auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=bob)
        auth_client.post(f"/api/v1/discover/creators/{me(auth_client, bob)}/follow",
                         headers=alice)

        items = auth_client.get("/api/v1/discover/feed", headers=alice).json()["items"]
        assert [i["slug"] for i in items] == [slug]

    def test_excludes_unfollowed_creators(self, auth_client, alice, bob):
        """動態牆混入沒追蹤的人，追蹤這個動作就失去意義。"""
        slug = make_recipe(auth_client, bob)
        auth_client.post(f"/api/v1/discover/recipes/{slug}/publish", headers=bob)
        assert auth_client.get("/api/v1/discover/feed", headers=alice).json()["total"] == 0

    def test_excludes_unpublished_recipes_of_followed_creators(self, auth_client, alice, bob):
        make_recipe(auth_client, bob)          # 未公開
        auth_client.post(f"/api/v1/discover/creators/{me(auth_client, bob)}/follow",
                         headers=alice)
        assert auth_client.get("/api/v1/discover/feed", headers=alice).json()["total"] == 0

    def test_empty_when_following_nobody(self, auth_client, alice):
        body = auth_client.get("/api/v1/discover/feed", headers=alice).json()
        assert body["items"] == [] and body["followingCount"] == 0
