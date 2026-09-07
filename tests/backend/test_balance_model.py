"""
平衡模型單元測試 (B2)

這些是先前 A4 缺陷（49% 經典配方被評 0 分）當初就該擋下的測試。
關鍵是不能只測「函式有回傳值」，而要對照資料集與病態輸入驗證行為。
"""
import json
import os

import pytest

from backend.engine.balance_model import (
    acid_strength,
    calculate_overall_balance_score,
    classify_family,
    flavor_totals,
    to_oz,
)

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))), "backend", "data")


class TestUnitConversion:
    @pytest.mark.parametrize("amount,unit,expected", [
        (1.0, "oz", 1.0),
        (29.5735, "ml", 1.0),
        (2.0, "dashes", 0.0625),
        (2.0, "dash", 0.0625),
        (1.0, None, 1.0),
        (1.0, "OZ", 1.0),
    ])
    def test_volume_units(self, amount, unit, expected):
        assert to_oz(amount, unit) == pytest.approx(expected, rel=1e-3)

    @pytest.mark.parametrize("unit", ["leaves", "whole", "slices", "sprig", "顆", "個"])
    def test_non_volume_units_contribute_nothing(self, unit):
        """迴歸：10 leaves 薄荷曾被當成 10 oz，把薄荷茱莉普的比例全數稀釋。"""
        assert to_oz(10, unit) == 0.0

    def test_unknown_unit_is_not_treated_as_ounces(self):
        assert to_oz(10, "definitely-not-a-unit") == 0.0


class TestAcidStrength:
    def test_lime_is_reference_strength(self):
        assert acid_strength(2.2) == pytest.approx(1.0)

    def test_neutral_has_no_acidity(self):
        assert acid_strength(7.0) == 0.0
        assert acid_strength(None) == 0.0

    def test_ph_is_logarithmic_not_linear(self):
        """迴歸：通寧水(pH 3.0)曾被當成與萊姆汁(pH 2.2)同級的酸味來源。"""
        assert acid_strength(3.0) < 0.25 * acid_strength(2.2)

    def test_monotonic_decreasing(self):
        vals = [acid_strength(p) for p in (2.2, 2.6, 3.0, 3.5, 4.0)]
        assert vals == sorted(vals, reverse=True)


class TestFlavorTotals:
    def test_sugar_from_mixers_is_counted(self):
        """迴歸：甜度曾只認 syrup/liqueur 類別，含糖的通寧水與果汁被當成 0 甜。"""
        tonic = {"category": "mixer", "sugarContent": 6, "acidPH": 3.0, "abv": 0, "bitterUnit": 30}
        acid, sweet, bitter, punch = flavor_totals([(tonic, 4.0, "oz")])
        assert sweet > 0

    def test_empty_recipe_is_all_zero(self):
        assert flavor_totals([]) == (0.0, 0.0, 0.0, 0.0)

    def test_totals_are_normalised_fractions(self):
        gin = {"category": "base_spirit", "sugarContent": 0, "acidPH": 7.0, "abv": 40, "bitterUnit": 0}
        acid, sweet, bitter, punch = flavor_totals([(gin, 2.0, "oz")])
        assert punch == pytest.approx(0.40, rel=1e-6)

    def test_non_volume_ingredient_does_not_dilute(self):
        gin = {"category": "base_spirit", "sugarContent": 0, "acidPH": 7.0, "abv": 40, "bitterUnit": 0}
        mint = {"category": "fresh", "sugarContent": 0, "acidPH": 6.0, "abv": 0, "bitterUnit": 0}
        only_gin = flavor_totals([(gin, 2.0, "oz")])
        with_mint = flavor_totals([(gin, 2.0, "oz"), (mint, 10, "leaves")])
        assert with_mint == pytest.approx(only_gin)


class TestClassifyFamily:
    def test_no_acid_is_spirit_forward(self):
        assert classify_family(0.0, 0.07, 0.35, 0.40) == "spirit_forward"

    def test_low_punch_with_acid_is_highball(self):
        assert classify_family(0.09, 0.08, 0.06, 0.12) == "highball"

    def test_acid_with_full_punch_is_sour(self):
        assert classify_family(0.14, 0.10, 0.08, 0.24) == "sour"


class TestBalanceScore:
    def test_empty_input_scores_zero(self):
        assert calculate_overall_balance_score(0, 0, 0, 0) == (0.0, "D")

    def test_spirit_forward_is_not_penalised_for_lacking_acid(self):
        """迴歸：Negroni／Manhattan／Old Fashioned 全家族曾一律得 0 分 D 級。"""
        score, grade = calculate_overall_balance_score(0.0, 0.07, 0.35, 0.40)
        assert score >= 75 and grade in ("A", "B")

    @pytest.mark.parametrize("acid,sweet,bitter,punch,label", [
        (0.00, 0.70, 0.00, 0.00, "純糖漿無酒精"),
        (0.90, 0.005, 0.00, 0.05, "極酸無糖"),
        (0.02, 0.60, 0.00, 0.05, "極甜"),
        (0.05, 0.02, 0.00, 0.90, "酒精過量"),
        (0.00, 0.005, 0.02, 0.45, "純烈酒無修飾"),
    ])
    def test_unbalanced_mixtures_score_poorly(self, acid, sweet, bitter, punch, label):
        score, _ = calculate_overall_balance_score(acid, sweet, bitter, punch)
        assert score < 75, f"{label} 不應獲得及格分數，實得 {score}"

    def test_score_and_grade_agree(self):
        for args in [(0.14, 0.10, 0.08, 0.24), (0.0, 0.07, 0.35, 0.40), (0.9, 0.0, 0.0, 0.05)]:
            score, grade = calculate_overall_balance_score(*args)
            expected = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 60 else "D"
            assert grade == expected

    def test_score_always_within_bounds(self):
        import random
        random.seed(0)
        for _ in range(500):
            args = [random.uniform(0, 1) for _ in range(4)]
            score, grade = calculate_overall_balance_score(*args)
            assert 0.0 <= score <= 100.0
            assert grade in {"A", "B", "C", "D"}


class TestAgainstCuratedDataset:
    """模型必須與資料集自身的人工評分一致——這是 A4 的核心驗收條件。"""

    @staticmethod
    def _scored():
        ing = {i["id"]: i for i in json.load(open(os.path.join(DATA, "ingredients.json"), encoding="utf-8"))}
        recipes = json.load(open(os.path.join(DATA, "classic_recipes.json"), encoding="utf-8"))
        out = []
        for r in recipes:
            if r.get("balanceScore") is None:
                continue
            items = [(ing.get(i.get("slug")), i.get("amount", 0), i.get("unit"))
                     for i in r.get("ingredients", [])]
            score, grade = calculate_overall_balance_score(*flavor_totals(items))
            out.append((r["id"], r["balanceScore"], score))
        return out

    def test_no_classic_recipe_scores_zero(self):
        zeros = [i for i, _, s in self._scored() if s == 0.0]
        assert not zeros, f"經典配方不應得 0 分：{zeros}"

    def test_every_classic_recipe_passes(self):
        """資料集中每道經典配方的人工評級皆為 A 或 B，模型應同樣視為及格。"""
        failing = [(i, h, s) for i, h, s in self._scored() if s < 75]
        assert not failing, f"經典配方低於 75 分：{failing}"

    def test_mean_absolute_error_is_small(self):
        rows = self._scored()
        mae = sum(abs(h - s) for _, h, s in rows) / len(rows)
        assert mae < 10.0, f"與人工評分的平均誤差過大：{mae:.1f} 分"


class TestUnitParityFixture:
    """
    對照 tests/fixtures/unit_parity.json。

    前端 lib/units.ts 是同一套換算表的另一份實作（購物清單與派對規劃
    在瀏覽器端計算用量）。基準值由此處產生，因此這裡鎖的是
    「後端換算不得無意間改變」，前端那側才是真正的一致性檢查。
    刻意調整換算時重跑 scripts/gen_unit_parity.py 並檢視 diff。
    """

    @pytest.fixture(scope="class")
    def fixture(self):
        import json
        import os
        path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                            "fixtures", "unit_parity.json")
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def test_oz_to_ml_matches(self, fixture):
        from backend.engine.balance_model import OZ_TO_ML
        assert OZ_TO_ML == pytest.approx(fixture["ozToMl"])

    def test_volume_conversions_match(self, fixture):
        from backend.engine.balance_model import OZ_TO_ML, to_oz
        for case in fixture["volumes"]:
            actual = to_oz(case["amount"], case["unit"]) * OZ_TO_ML
            assert actual == pytest.approx(case["ml"]), case

    def test_non_volume_units_stay_non_volume(self, fixture):
        from backend.engine.balance_model import to_oz
        for unit in fixture["nonVolume"]:
            assert to_oz(1, unit) == 0.0, unit
