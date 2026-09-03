"""
替代品推薦測試 (D3)

替代品排序原本為 0.6×相似度 + 0.4×互補度，但互補度衡量「兩者搭配協調」，
與「可互相取代」恰好相反，導致正確替代反而排在荒謬建議之後。
"""
import pytest

from backend.engine.flavor_engine import FlavorEngine
from backend.engine.flavor_wheel import _category_affinity


@pytest.fixture(scope="module")
def engine():
    return FlavorEngine()


BAR = [
    "tanqueray-gin", "sweet-vermouth", "aperol", "fresh-lime-juice",
    "simple-syrup", "bacardi-rum", "grand-marnier", "club-soda",
]


class TestCategoryAffinity:
    def test_same_category_is_full_score(self):
        assert _category_affinity("liqueur", "liqueur") == 1.0

    def test_related_categories_score_high(self):
        assert _category_affinity("juice", "fresh") == 0.85

    def test_unrelated_categories_are_penalised(self):
        assert _category_affinity("liqueur", "juice") < 0.5


class TestSubstituteQuality:
    def test_campari_is_replaced_by_aperol(self, engine):
        """教科書級替代：兩者皆為苦橙利口酒。"""
        r = engine.find_substitutes("campari", BAR, top_n=3)
        assert r, "應找得到替代品"
        assert r[0].ingredient_id == "aperol"
        assert r[0].combined_score > 0.9

    def test_orange_liqueur_replaced_by_orange_liqueur(self, engine):
        """迴歸：君度曾被建議以新鮮萊姆汁替代（互補度高但無法取代）。"""
        r = engine.find_substitutes("triple-sec", BAR, top_n=3)
        assert r[0].ingredient_id == "grand-marnier"
        assert all(m.ingredient_id != "fresh-lime-juice" for m in r), \
            "果汁不應成為利口酒的替代品"

    def test_declines_when_nothing_suitable(self, engine):
        """迴歸：薄荷葉曾被建議以琴酒替代、蘇打水以艾普羅替代（相似度僅 12%）。"""
        assert engine.find_substitutes("fresh-mint", BAR, top_n=3) == []
        assert engine.find_substitutes("club-soda", BAR, top_n=3) == []

    def test_never_returns_below_threshold(self, engine):
        for missing in ["campari", "triple-sec", "maraschino", "benedictine"]:
            for m in engine.find_substitutes(missing, BAR, top_n=5):
                assert m.combined_score >= 0.5

    def test_results_are_sorted_by_score(self, engine):
        r = engine.find_substitutes("triple-sec", BAR, top_n=5)
        scores = [m.combined_score for m in r]
        assert scores == sorted(scores, reverse=True)

    def test_respects_top_n(self, engine):
        assert len(engine.find_substitutes("campari", BAR, top_n=1)) <= 1

    def test_unknown_ingredient_raises(self, engine):
        with pytest.raises(ValueError):
            engine.find_substitutes("not-a-real-ingredient", BAR)

    def test_empty_bar_yields_nothing(self, engine):
        assert engine.find_substitutes("campari", []) == []
