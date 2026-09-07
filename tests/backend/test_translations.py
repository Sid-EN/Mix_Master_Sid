"""
配方內容的英文版本（新功能 1）

翻譯與配方本體分開存放，因此最容易出的錯是「兩邊對不上」——
新增配方卻忘了翻譯、或改了 id 讓翻譯變成孤兒。
這兩種情況都不會有任何錯誤，只會讓英文介面悄悄退回中文。
"""
import pytest

from backend.api.routes_recipes import TRANSLATABLE_FIELDS
from backend.data_store import cocktails, recipe_translations


@pytest.fixture(scope="module")
def entries():
    return {k: v for k, v in recipe_translations().items() if not k.startswith("_")}


class TestCoverage:
    def test_every_recipe_has_a_translation(self, entries):
        missing = sorted({r["id"] for r in cocktails()} - set(entries))
        assert missing == [], f"缺少英文內容的配方：{missing}"

    def test_no_orphan_translations(self, entries):
        """翻譯的鍵必須對應到實際存在的配方，否則只是無人使用的死資料。"""
        orphans = sorted(set(entries) - {r["id"] for r in cocktails()})
        assert orphans == [], f"找不到對應配方的翻譯：{orphans}"

    def test_every_translatable_field_is_present(self, entries):
        incomplete = {
            key: [f for f in TRANSLATABLE_FIELDS if not entry.get("en", {}).get(f)]
            for key, entry in entries.items()
        }
        incomplete = {k: v for k, v in incomplete.items() if v}
        assert incomplete == {}, f"欄位不完整：{incomplete}"

    def test_step_counts_match_the_original(self, entries):
        """步驟數不同代表漏譯或多譯了某個步驟。"""
        by_id = {r["id"]: r for r in cocktails()}
        mismatched = {
            key: (len(by_id[key]["steps"]), len(entry["en"]["steps"]))
            for key, entry in entries.items()
            if key in by_id and len(by_id[key]["steps"]) != len(entry["en"]["steps"])
        }
        assert mismatched == {}, f"步驟數不符（中文, 英文）：{mismatched}"

    def test_translations_are_not_still_chinese(self, entries):
        """避免把中文原文原樣貼進英文欄位。"""
        def has_cjk(text: str) -> bool:
            return any("一" <= ch <= "鿿" for ch in text)

        offenders = []
        for key, entry in entries.items():
            for field in TRANSLATABLE_FIELDS:
                value = entry["en"][field]
                texts = value if isinstance(value, list) else [value]
                if any(has_cjk(t) for t in texts):
                    offenders.append(f"{key}.{field}")
        assert offenders == [], f"英文欄位仍含中文：{offenders}"


class TestApi:
    def test_detail_includes_english_fields(self, client):
        body = client.get("/api/v1/recipes/classic-daiquiri").json()
        for field in TRANSLATABLE_FIELDS:
            assert f"{field}En" in body, field

    def test_english_is_added_not_substituted(self, client):
        """中文原文必須保留：未切換語言的使用者仍要讀得到。"""
        body = client.get("/api/v1/recipes/classic-daiquiri").json()
        assert body["steps"][0] != body["stepsEn"][0]
        assert any("一" <= ch <= "鿿" for ch in body["steps"][0])

    def test_classic_list_includes_translations(self, client):
        items = client.get("/api/v1/recipes/classic").json()
        assert all("stepsEn" in item for item in items)
