"""
資料完整性測試 (B1)

資料是本專案的核心，且靜默損壞最難察覺——配方引用了不存在的材料時，
API 仍回 200，畫面只是少了一列。這些測試把資料的隱含契約明確化。
"""

from typing import get_args

from backend.models.recipe import RecipeMethod

REQUIRED_INGREDIENT_FIELDS = [
    "id", "name", "nameZh", "category", "abv", "sugarContent",
    "acidPH", "bitterUnit", "caloriesPer30ml", "flavorVector",
]
REQUIRED_RECIPE_FIELDS = ["id", "nameEn", "nameZh", "method", "ingredients", "steps"]

FLAVOR_VECTOR_LEN = 15
# 由 models.recipe 的權威 Literal 衍生，避免測試與程式碼各持一份清單
VALID_METHODS = set(get_args(RecipeMethod))
VALID_GRADES = {"A", "B", "C", "D"}

# 已知使用的單位；新增單位時須同步更新 balance_model.to_oz
KNOWN_UNITS = {
    "oz", "ml", "cl", "g", "tsp", "bsp", "dash", "dashes", "drop", "drops",
    "whole", "leaves", "leaf", "slices", "slice", "sprig", "sprigs",
    "wedge", "wedges", "pinch", "piece", "pieces",
    "個", "根", "枝", "顆", "個（可選）",
}


class TestIngredients:
    def test_ids_are_unique(self, ingredients):
        ids = [i["id"] for i in ingredients]
        dupes = {x for x in ids if ids.count(x) > 1}
        assert not dupes, f"材料 id 重複：{dupes}"

    def test_required_fields_present(self, ingredients):
        missing = [
            (i.get("id"), f) for i in ingredients
            for f in REQUIRED_INGREDIENT_FIELDS if f not in i
        ]
        assert not missing, f"材料缺少必要欄位：{missing[:10]}"

    def test_flavor_vector_shape(self, ingredients):
        bad = [
            i["id"] for i in ingredients
            if len(i["flavorVector"]) != FLAVOR_VECTOR_LEN
            or not all(isinstance(v, (int, float)) and 0.0 <= v <= 1.0
                       for v in i["flavorVector"])
        ]
        assert not bad, f"flavorVector 長度須為 {FLAVOR_VECTOR_LEN} 且值域 0–1：{bad}"

    def test_numeric_ranges(self, ingredients):
        bad = []
        for i in ingredients:
            if not 0 <= i["abv"] <= 96:
                bad.append((i["id"], "abv", i["abv"]))
            if not 0 <= i["sugarContent"] <= 120:
                bad.append((i["id"], "sugarContent", i["sugarContent"]))
            if not 0 < i["acidPH"] <= 14:
                bad.append((i["id"], "acidPH", i["acidPH"]))
            if i["caloriesPer30ml"] < 0:
                bad.append((i["id"], "calories", i["caloriesPer30ml"]))
        assert not bad, f"數值超出合理範圍：{bad}"

    def test_substitutes_are_known_or_absent(self, ingredients, ingredient_index):
        """替代品若指向本目錄內的 id，該 id 必須存在（允許指向外部品項）。"""
        for i in ingredients:
            for s in i.get("substitutes", []):
                assert isinstance(s, str) and s, f"{i['id']} 的 substitutes 含空值"


class TestRecipes:
    def test_ids_are_unique(self, recipes):
        ids = [r["id"] for r in recipes]
        dupes = {x for x in ids if ids.count(x) > 1}
        assert not dupes, f"配方 id 重複：{dupes}"

    def test_required_fields_present(self, recipes):
        missing = [
            (r.get("id"), f) for r in recipes
            for f in REQUIRED_RECIPE_FIELDS if f not in r
        ]
        assert not missing, f"配方缺少必要欄位：{missing[:10]}"

    def test_every_ingredient_slug_resolves(self, recipes, ingredient_index):
        """迴歸測試：曾有 17 種 slug、32 處參照無法解析。"""
        unresolved = [
            (r["id"], ing.get("slug"))
            for r in recipes
            for ing in r.get("ingredients", [])
            if ing.get("slug") not in ingredient_index
        ]
        assert not unresolved, f"配方引用了不存在的材料：{unresolved}"

    def test_units_are_known(self, recipes):
        """未知單位會被當成 0 容積，靜默扭曲所有平衡計算。"""
        unknown = {
            ing.get("unit") for r in recipes
            for ing in r.get("ingredients", [])
            if ing.get("unit") not in KNOWN_UNITS
        }
        assert not unknown, f"出現未知單位（需同步 balance_model.to_oz）：{unknown}"

    def test_amounts_are_positive(self, recipes):
        bad = [
            (r["id"], ing.get("slug"), ing.get("amount"))
            for r in recipes
            for ing in r.get("ingredients", [])
            if not isinstance(ing.get("amount"), (int, float)) or ing["amount"] <= 0
        ]
        assert not bad, f"材料用量須為正數：{bad}"

    def test_method_is_valid(self, recipes):
        bad = [(r["id"], r.get("method")) for r in recipes
               if r.get("method") not in VALID_METHODS]
        assert not bad, f"未知的調製手法：{bad}"

    def test_balance_score_and_grade_consistent(self, recipes):
        bad = []
        for r in recipes:
            s, g = r.get("balanceScore"), r.get("grade")
            if s is None:
                continue
            if not 0 <= s <= 100:
                bad.append((r["id"], "score 超出 0–100", s))
            if g not in VALID_GRADES:
                bad.append((r["id"], "未知 grade", g))
        assert not bad, bad

    def test_has_steps(self, recipes):
        bad = [r["id"] for r in recipes if not r.get("steps")]
        assert not bad, f"配方缺少製作步驟：{bad}"


class TestPrepRecipes:
    def test_ids_are_unique(self, preps):
        ids = [p["id"] for p in preps]
        dupes = {x for x in ids if ids.count(x) > 1}
        assert not dupes, f"備料配方 id 重複：{dupes}"

    def test_have_ingredients_and_steps(self, preps):
        bad = [p.get("id") for p in preps
               if not p.get("ingredients") or not p.get("steps")]
        assert not bad, f"備料配方缺少材料或步驟：{bad}"

    def test_amounts_positive(self, preps):
        bad = [
            (p["id"], i.get("name"), i.get("amount"))
            for p in preps for i in p.get("ingredients", [])
            if not isinstance(i.get("amount"), (int, float)) or i["amount"] <= 0
        ]
        assert not bad, f"備料用量須為正數：{bad}"
