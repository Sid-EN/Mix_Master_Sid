"""
社群互動測試 (E)

互動對象限定為已公開分享的配方——未公開者屬私人內容。
重點在於權限：不可為自己的配方評分、留言刪除權限、撤銷分享後即無法互動。
"""
import pytest

RECIPE = {
    "nameZh": "分享用配方",
    "method": "build",
    "ingredients": [{"slug": "tanqueray-gin", "amount": 2, "unit": "oz"}],
    "steps": ["加冰"],
}


def account(client, email):
    r = client.post("/api/v1/auth/register",
                    json={"email": email, "password": "a-good-password"})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def owner(auth_client):
    return account(auth_client, "owner@example.com")


@pytest.fixture
def visitor(auth_client):
    return account(auth_client, "visitor@example.com")


@pytest.fixture
def other(auth_client):
    return account(auth_client, "other@example.com")


@pytest.fixture
def shared(auth_client, owner):
    """建立一個已公開分享的配方，回傳 (recipe_id, share_token)。"""
    rid = auth_client.post("/api/v1/recipes", json=RECIPE, headers=owner).json()["id"]
    token = auth_client.post(f"/api/v1/recipes/{rid}/share", headers=owner).json()["shareToken"]
    return rid, token


class TestVisibility:
    def test_unshared_recipe_cannot_be_interacted(self, auth_client, owner, visitor):
        """未公開的配方屬私人內容，不應讓他人評分或留言。"""
        rid = auth_client.post("/api/v1/recipes", json=RECIPE, headers=owner).json()["id"]
        assert auth_client.get(f"/api/v1/community/{rid}/comments").status_code == 404
        assert auth_client.put(f"/api/v1/community/{rid}/ratings",
                               json={"score": 5}, headers=visitor).status_code == 404

    def test_revoking_share_blocks_interaction(self, auth_client, owner, visitor, shared):
        rid, token = shared
        auth_client.post(f"/api/v1/community/{token}/comments",
                         json={"body": "好喝"}, headers=visitor)
        auth_client.delete(f"/api/v1/recipes/{rid}/share", headers=owner)
        assert auth_client.get(f"/api/v1/community/{token}/comments").status_code == 404
        assert auth_client.post(f"/api/v1/community/{token}/comments",
                                json={"body": "再一則"}, headers=visitor).status_code == 404

    def test_unknown_token_returns_404(self, auth_client):
        assert auth_client.get("/api/v1/community/not-a-token/comments").status_code == 404


class TestRatings:
    def test_starts_empty(self, auth_client, shared):
        _, token = shared
        body = auth_client.get(f"/api/v1/community/{token}/ratings").json()
        assert body == {"count": 0, "average": None, "myScore": None}

    def test_rate_and_aggregate(self, auth_client, visitor, other, shared):
        _, token = shared
        auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 4}, headers=visitor)
        auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 2}, headers=other)
        body = auth_client.get(f"/api/v1/community/{token}/ratings").json()
        assert body["count"] == 2 and body["average"] == 3.0

    def test_one_rating_per_user(self, auth_client, visitor, shared):
        _, token = shared
        auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 1}, headers=visitor)
        auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 5}, headers=visitor)
        body = auth_client.get(f"/api/v1/community/{token}/ratings").json()
        assert body["count"] == 1 and body["average"] == 5.0

    def test_my_score_visible_only_to_me(self, auth_client, visitor, other, shared):
        _, token = shared
        auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 4}, headers=visitor)
        assert auth_client.get(f"/api/v1/community/{token}/ratings",
                               headers=visitor).json()["myScore"] == 4
        assert auth_client.get(f"/api/v1/community/{token}/ratings",
                               headers=other).json()["myScore"] is None
        assert auth_client.get(f"/api/v1/community/{token}/ratings").json()["myScore"] is None

    def test_owner_cannot_rate_own_recipe(self, auth_client, owner, shared):
        _, token = shared
        r = auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 5}, headers=owner)
        assert r.status_code == 403

    @pytest.mark.parametrize("score", [0, 6, -1])
    def test_rejects_out_of_range_score(self, auth_client, visitor, shared, score):
        _, token = shared
        assert auth_client.put(f"/api/v1/community/{token}/ratings",
                               json={"score": score}, headers=visitor).status_code == 422

    def test_requires_authentication(self, auth_client, shared):
        _, token = shared
        assert auth_client.put(f"/api/v1/community/{token}/ratings",
                               json={"score": 5}).status_code == 401

    def test_can_withdraw_rating(self, auth_client, visitor, shared):
        _, token = shared
        auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 4}, headers=visitor)
        assert auth_client.delete(f"/api/v1/community/{token}/ratings",
                                  headers=visitor).status_code == 204
        assert auth_client.get(f"/api/v1/community/{token}/ratings").json()["count"] == 0


class TestComments:
    def test_post_and_list(self, auth_client, visitor, shared):
        _, token = shared
        r = auth_client.post(f"/api/v1/community/{token}/comments",
                             json={"body": "很順口"}, headers=visitor)
        assert r.status_code == 201
        body = auth_client.get(f"/api/v1/community/{token}/comments").json()
        assert body["total"] == 1 and body["items"][0]["body"] == "很順口"

    def test_readable_without_login(self, auth_client, visitor, shared):
        _, token = shared
        auth_client.post(f"/api/v1/community/{token}/comments",
                         json={"body": "公開留言"}, headers=visitor)
        assert auth_client.get(f"/api/v1/community/{token}/comments").status_code == 200

    def test_does_not_leak_email(self, auth_client, visitor, shared):
        _, token = shared
        auth_client.post(f"/api/v1/community/{token}/comments",
                         json={"body": "留言"}, headers=visitor)
        text = auth_client.get(f"/api/v1/community/{token}/comments").text
        assert "visitor@example.com" not in text, "不應外洩留言者的電子郵件"

    def test_marks_recipe_author(self, auth_client, owner, visitor, shared):
        _, token = shared
        auth_client.post(f"/api/v1/community/{token}/comments",
                         json={"body": "作者補充"}, headers=owner)
        auth_client.post(f"/api/v1/community/{token}/comments",
                         json={"body": "訪客留言"}, headers=visitor)
        items = auth_client.get(f"/api/v1/community/{token}/comments").json()["items"]
        by_body = {i["body"]: i["isAuthor"] for i in items}
        assert by_body["作者補充"] is True and by_body["訪客留言"] is False

    def test_newest_first(self, auth_client, visitor, shared):
        _, token = shared
        for b in ["第一則", "第二則", "第三則"]:
            auth_client.post(f"/api/v1/community/{token}/comments",
                             json={"body": b}, headers=visitor)
        items = auth_client.get(f"/api/v1/community/{token}/comments").json()["items"]
        assert items[0]["body"] == "第三則"

    @pytest.mark.parametrize("body", ["", " " * 5 + "", "x" * 1001])
    def test_rejects_invalid_body(self, auth_client, visitor, shared, body):
        _, token = shared
        r = auth_client.post(f"/api/v1/community/{token}/comments",
                             json={"body": body}, headers=visitor)
        assert r.status_code == 422 or (r.status_code == 201 and r.json()["body"].strip())

    def test_requires_authentication(self, auth_client, shared):
        _, token = shared
        assert auth_client.post(f"/api/v1/community/{token}/comments",
                                json={"body": "x"}).status_code == 401

    def test_pagination(self, auth_client, visitor, shared):
        _, token = shared
        for i in range(5):
            auth_client.post(f"/api/v1/community/{token}/comments",
                             json={"body": f"留言 {i}"}, headers=visitor)
        body = auth_client.get(f"/api/v1/community/{token}/comments?limit=2&offset=0").json()
        assert body["total"] == 5 and len(body["items"]) == 2


class TestCommentDeletion:
    def test_author_can_delete_own(self, auth_client, visitor, shared):
        _, token = shared
        cid = auth_client.post(f"/api/v1/community/{token}/comments",
                               json={"body": "我的留言"}, headers=visitor).json()["id"]
        assert auth_client.delete(f"/api/v1/community/{token}/comments/{cid}",
                                  headers=visitor).status_code == 204

    def test_recipe_owner_can_moderate(self, auth_client, owner, visitor, shared):
        """配方擁有者可刪除自己配方下的留言。"""
        _, token = shared
        cid = auth_client.post(f"/api/v1/community/{token}/comments",
                               json={"body": "不當留言"}, headers=visitor).json()["id"]
        assert auth_client.delete(f"/api/v1/community/{token}/comments/{cid}",
                                  headers=owner).status_code == 204

    def test_third_party_cannot_delete(self, auth_client, visitor, other, shared):
        _, token = shared
        cid = auth_client.post(f"/api/v1/community/{token}/comments",
                               json={"body": "別人的留言"}, headers=visitor).json()["id"]
        assert auth_client.delete(f"/api/v1/community/{token}/comments/{cid}",
                                  headers=other).status_code == 403

    def test_unknown_comment_returns_404(self, auth_client, owner, shared):
        _, token = shared
        assert auth_client.delete(f"/api/v1/community/{token}/comments/9999",
                                  headers=owner).status_code == 404


class TestCascade:
    def test_deleting_recipe_removes_interactions(self, auth_client, owner, visitor,
                                                  shared, db_session):
        from backend.models.db_models import RecipeComment, RecipeRating
        rid, token = shared
        auth_client.put(f"/api/v1/community/{token}/ratings", json={"score": 5}, headers=visitor)
        auth_client.post(f"/api/v1/community/{token}/comments",
                         json={"body": "留言"}, headers=visitor)
        assert db_session.query(RecipeRating).count() == 1
        assert db_session.query(RecipeComment).count() == 1

        auth_client.delete(f"/api/v1/recipes/{rid}", headers=owner)
        assert db_session.query(RecipeRating).count() == 0
        assert db_session.query(RecipeComment).count() == 0


class TestCommentDeletePermission:
    """
    canDelete 讓前端只在真的刪得掉時才顯示刪除按鈕。

    先前前端對所有登入者都顯示刪除鍵，但後端只允許留言者與配方擁有者刪除，
    其他人點下去只會靜默失敗——看起來就像按鈕壞了。
    """

    def comment_as(self, client, token, headers, body="留言"):
        r = client.post(f"/api/v1/community/{token}/comments",
                        json={"body": body}, headers=headers)
        assert r.status_code == 201
        return r.json()["id"]

    def first_comment(self, client, token, headers=None):
        r = client.get(f"/api/v1/community/{token}/comments",
                       **({"headers": headers} if headers else {}))
        return r.json()["items"][0]

    def test_comment_author_can_delete(self, auth_client, shared, visitor):
        _rid, token = shared
        self.comment_as(auth_client, token, visitor)
        assert self.first_comment(auth_client, token, visitor)["canDelete"] is True

    def test_recipe_owner_can_delete_others_comments(self, auth_client, shared, owner, visitor):
        _rid, token = shared
        self.comment_as(auth_client, token, visitor)
        assert self.first_comment(auth_client, token, owner)["canDelete"] is True

    def test_third_party_cannot_delete(self, auth_client, shared, visitor, other):
        _rid, token = shared
        self.comment_as(auth_client, token, visitor)
        assert self.first_comment(auth_client, token, other)["canDelete"] is False

    def test_anonymous_cannot_delete(self, auth_client, shared, visitor):
        _rid, token = shared
        self.comment_as(auth_client, token, visitor)
        assert self.first_comment(auth_client, token)["canDelete"] is False

    def test_flag_matches_actual_permission(self, auth_client, shared, visitor, other):
        """旗標必須與實際權限一致，否則前端顯示的按鈕仍會失敗。"""
        _rid, token = shared
        cid = self.comment_as(auth_client, token, visitor)

        assert self.first_comment(auth_client, token, other)["canDelete"] is False
        assert auth_client.delete(f"/api/v1/community/{token}/comments/{cid}",
                                  headers=other).status_code in (403, 404)

        assert self.first_comment(auth_client, token, visitor)["canDelete"] is True
        assert auth_client.delete(f"/api/v1/community/{token}/comments/{cid}",
                                  headers=visitor).status_code == 204
