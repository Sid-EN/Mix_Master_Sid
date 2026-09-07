"""
統一搜尋測試

涵蓋容錯比對（打錯字仍找得到）與相關性排序（名稱命中優先），
以及排序穩定性——結果不應取決於資料檔的排列順序。
"""
import pytest

from backend.engine.fuzzy import (
    Candidate,
    bounded_levenshtein,
    max_typos,
    normalise,
    query_terms,
    tokenise,
)


def search(client, q, **params):
    r = client.get("/api/v1/search", params={"q": q, **params})
    assert r.status_code == 200
    return r.json()


def names(body):
    return [i.get("nameEn") or i.get("nameZh") for i in body["items"]]


class TestLevenshtein:
    @pytest.mark.parametrize("a,b,expected", [
        ("daiquiri", "daiquiri", 0),
        ("daiquiri", "daquiri", 1),      # 少一個字母
        ("negroni", "negrone", 1),       # 打錯一個字母
        ("mojito", "mojtio", 2),         # 相鄰字母顛倒（兩次替換）
        ("", "abc", 3),
    ])
    def test_distance(self, a, b, expected):
        assert bounded_levenshtein(a, b, 5) == expected

    def test_gives_up_past_the_limit(self):
        """超過上限時只需知道「太遠」，不必算出精確值。"""
        assert bounded_levenshtein("daiquiri", "manhattan", 2) == 3

    def test_limit_zero_still_detects_equality(self):
        assert bounded_levenshtein("gin", "gin", 0) == 0
        assert bounded_levenshtein("gin", "sin", 0) == 1


class TestTypoBudget:
    def test_short_terms_get_no_budget(self):
        """三字詞若容錯，gin／sin／tin 會互相命中，搜尋等同無效。"""
        assert max_typos("gin") == 0
        assert max_typos("rum") == 0

    def test_longer_terms_get_more_budget(self):
        assert max_typos("negroni") == 2
        assert max_typos("sour") == 1


class TestTokenise:
    def test_strips_punctuation_and_case(self):
        assert tokenise("Gin & Tonic!") == ["gin", "tonic"]

    def test_cjk_stays_together(self):
        assert tokenise("經典黛綺麗") == ["經典黛綺麗"]

    def test_normalise_collapses_whitespace(self):
        assert normalise("  Old   Fashioned \n") == "old fashioned"


class TestRelevanceScoring:
    def test_name_beats_description(self):
        name_hit = Candidate({"name": ["Daiquiri"], "description": ["something else"]})
        desc_hit = Candidate({"name": ["Manhattan"], "description": ["like a daiquiri"]})
        terms = query_terms("daiquiri")
        assert name_hit.score(terms) > desc_hit.score(terms)

    def test_exact_beats_fuzzy(self):
        exact = Candidate({"name": ["Negroni"]})
        typo = Candidate({"name": ["Negrone"]})
        terms = query_terms("negroni")
        assert exact.score(terms) > typo.score(terms) > 0

    def test_every_term_must_match(self):
        """AND 語意：多打一個不相干的詞應該收斂而非擴大結果。"""
        c = Candidate({"name": ["Gin Tonic"]})
        assert c.score(query_terms("gin tonic")) > 0
        assert c.score(query_terms("gin whisky")) == 0

    def test_phrase_hit_outranks_scattered_terms(self):
        phrase = Candidate({"name": ["Old Fashioned"]})
        scattered = Candidate({"name": ["Fashioned Old Timer"]})
        terms, p = query_terms("old fashioned"), normalise("old fashioned")
        assert phrase.score(terms, p) > scattered.score(terms, p)

    def test_empty_query_scores_nothing(self):
        assert Candidate({"name": ["Daiquiri"]}).score([]) == 0.0


class TestSearchEndpoint:
    def test_exact_name_is_found(self, client):
        assert "Classic Daiquiri" in names(search(client, "daiquiri"))

    def test_typo_still_finds_the_recipe(self, client):
        """舊的子字串搜尋在此完全沒有結果；容錯搜尋應該找得到。"""
        found = names(search(client, "daquiri"))
        assert "Classic Daiquiri" in found

    def test_typo_can_be_turned_off(self, client):
        """fuzzy=false 保留舊行為，供需要精確比對的呼叫端使用。"""
        assert search(client, "daquiri", fuzzy="false")["total"] == 0
        assert search(client, "daiquiri", fuzzy="false")["total"] > 0

    def test_results_are_ranked_by_relevance(self, client):
        """名稱就叫 Daiquiri 的配方必須排第一，而不是碰巧提到它的。"""
        assert names(search(client, "daiquiri"))[0] == "Classic Daiquiri"

    def test_scores_are_returned_and_descending(self, client):
        items = search(client, "rum")["items"]
        scores = [i["score"] for i in items]
        assert scores == sorted(scores, reverse=True)
        assert all(s > 0 for s in scores)

    def test_ingredient_search_works(self, client):
        body = search(client, "lime juice")
        assert body["total"] > 0

    def test_chinese_query_works(self, client):
        assert search(client, "黛綺麗")["total"] > 0

    def test_unrelated_query_returns_nothing(self, client):
        assert search(client, "zzzzqqqq")["total"] == 0

    def test_short_query_does_not_match_everything(self, client):
        """三字查詢不容錯，否則 gin／sin／tin 互相命中會讓搜尋失去意義。"""
        gin = search(client, "gin", limit=100)
        assert gin["total"] > 0
        # 只用 rum 而不含 gin 的配方不該出現在 gin 的搜尋結果中
        for item in gin["items"]:
            haystack = " ".join([
                item.get("nameEn", ""), item.get("nameZh", ""),
                " ".join(item.get("tags", [])),
                " ".join(i.get("slug", "") for i in item.get("ingredients", [])),
                item.get("description", ""),
            ]).lower()
            assert "gin" in haystack

    def test_method_filter_still_applies(self, client):
        body = search(client, "rum", method="shake")
        for item in body["items"]:
            if item["source"] == "cocktail":
                assert item["method"] == "shake"

    def test_type_filter_still_applies(self, client):
        for item in search(client, "syrup", type="prep")["items"]:
            assert item["source"] == "prep"

    def test_pagination_does_not_lose_or_repeat_items(self, client):
        full = names(search(client, "rum", limit=100))
        page1 = names(search(client, "rum", limit=2, offset=0))
        page2 = names(search(client, "rum", limit=2, offset=2))
        assert page1 + page2 == full[:4]

    def test_total_counts_all_matches_not_just_the_page(self, client):
        body = search(client, "rum", limit=1)
        assert len(body["items"]) == 1
        assert body["total"] >= 1

    def test_ordering_is_stable_across_calls(self, client):
        assert names(search(client, "sour")) == names(search(client, "sour"))

    def test_blank_query_is_rejected(self, client):
        assert client.get("/api/v1/search", params={"q": ""}).status_code == 422

    def test_punctuation_only_query_returns_nothing(self, client):
        assert search(client, "!!!")["total"] == 0


class TestParityFixture:
    """
    對照 tests/fixtures/fuzzy_parity.json。

    該檔由後端產生（scripts/gen_fuzzy_parity.py），前端 lib/fuzzy.ts 也對照
    同一份檔案。因此這裡鎖住的是「後端行為不得無意間改變」，前端那側才是
    真正的兩實作一致性檢查。刻意改規則時重跑腳本並在 diff 中檢視差異。
    """

    @pytest.fixture(scope="class")
    def fixture(self):
        import json
        import os
        path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                            "fixtures", "fuzzy_parity.json")
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def test_distances_match(self, fixture):
        for case in fixture["distances"]:
            actual = bounded_levenshtein(case["a"], case["b"], case["limit"])
            assert actual == case["expected"], case

    def test_typo_budget_matches(self, fixture):
        for case in fixture["maxTypos"]:
            assert max_typos(case["term"]) == case["expected"], case

    def test_tokenise_matches(self, fixture):
        for case in fixture["tokenise"]:
            assert normalise(case["text"]) == case["normalised"], case
            assert tokenise(case["text"]) == case["tokens"], case

    def test_scores_match(self, fixture):
        candidates = [Candidate(f) for f in fixture["candidates"]]
        for case in fixture["scores"]:
            terms = query_terms(case["query"])
            phrase = normalise(case["query"])
            actual = candidates[case["candidate"]].score(terms, phrase)
            assert round(actual, 10) == case["score"], case
