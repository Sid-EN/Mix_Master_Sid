"""
flavor_engine.py
────────────────
智慧風味平衡引擎主體 (Smart Flavor Engine — Orchestration Layer)

整合：
  - balance_model.py    ABV 動態調整
  - flavor_wheel.py     風味向量合成 + 替代品尋找
  - name_generator.py   配方自動命名

流程：
  [Input] available_ingredients
      ↓ 分類識別
      ↓ ABV 動態調整
      ↓ 風味向量合成
      ↓ 平衡分數計算
      ↓ 配方命名
  [Output] RecipeResult
"""

from __future__ import annotations

from dataclasses import dataclass, field

from ..engine.balance_model import (
    BalanceParameters,
    calculate_balance_parameters,
    calculate_overall_balance_score,
    flavor_totals,
)
from ..engine.flavor_wheel import (
    FlavorMatch,
    find_substitutes,
    synthesize_flavor_profile,
)
from ..engine.name_generator import generate_recipe_name

from ..data_store import ingredients as _load_ingredients, reload_all


def _reload_ingredients() -> list[dict]:
    """強制重新載入材料資料庫（開發時用）"""
    reload_all()
    return _load_ingredients()


# 杯型推薦映射
METHOD_TO_GLASS: dict[str, list[str]] = {
    "shake": ["coupe", "martini_glass", "rocks_glass"],
    "stir":  ["martini_glass", "coupe", "nick_and_nora"],
    "build": ["highball", "rocks_glass", "collins"],
}

CATEGORY_ROLE: dict[str, str] = {
    "base_spirit":    "base",
    "liqueur":        "modifier",
    "fortified_wine": "modifier",
    "juice":          "sour",
    "syrup":          "sweet",
    "bitter":         "accent",
    "mixer":          "lengthener",
    "fresh":          "accent_or_sour",
    "dairy":          "texture",
    "egg":            "texture",
    "wine":           "modifier",
    "beer":           "lengthener",
}


@dataclass
class RecipeIngredient:
    """配方中的材料項目"""
    ingredient: dict
    amount: float
    unit: str = "oz"
    role: str = "modifier"


@dataclass
class RecipeResult:
    """配方生成結果"""
    name_en: str
    name_zh: str
    method: str                              # shake | stir | build
    glass_type: str
    balance_score: float
    grade: str                               # A | B | C | D
    ingredients: list[RecipeIngredient]
    steps: list[str]
    garnish: str
    flavor_profile: dict
    balance_params: BalanceParameters | None = None
    alternatives: list[dict] = field(default_factory=list)
    insights: dict = field(default_factory=dict)


class FlavorEngine:
    """
    智慧風味平衡引擎

    Usage:
        engine = FlavorEngine()
        result = engine.generate(
            available_slugs=["tanqueray-gin", "fresh-lime-juice", "simple-syrup"]
        )
    """

    def __init__(self):
        self._db = _load_ingredients()
        self._db_map = {ing["id"]: ing for ing in self._db}

    def generate(
        self,
        available_slugs: list[str],
        preferences: dict | None = None,
        user_level: int = 1,
    ) -> RecipeResult:
        """
        核心配方生成入口。

        Args:
            available_slugs: 使用者擁有的材料 slug 列表
            preferences:     使用者偏好（style, glass, maxIngredients）
            user_level:      使用者等級 1–5，影響配方複雜度

        Returns:
            RecipeResult
        """
        prefs = preferences or {}

        # Step 1：識別材料
        ingredients = self._resolve_ingredients(available_slugs)
        if not ingredients:
            raise ValueError("找不到任何有效材料，請確認 slug 是否正確。")

        # Step 2：依角色分類
        base = [i for i in ingredients if i["category"] == "base_spirit"]
        sours = [i for i in ingredients if i["category"] in ("juice",) and
                 (i.get("acidPH") or 7) < 4.5]
        sweets = [i for i in ingredients if i["category"] in ("syrup", "liqueur")]

        # Step 3：ABV 動態調整
        base_abv = base[0]["abv"] if base else 0.0
        balance_params = calculate_balance_parameters(base_abv) if base else None

        # Step 4：計算各材料用量
        recipe_ings = self._calculate_amounts(
            base, sours, sweets, ingredients, balance_params, prefs
        )

        # Step 5：決定調製手法
        method = self._determine_method(ingredients, prefs)

        # Step 6：合成風味輪廓
        flavor_profile = synthesize_flavor_profile(
            [(ri.ingredient, ri.amount) for ri in recipe_ings]
        )

        # Step 7：計算平衡分數
        # 以實際糖度／酸度／苦度加權並正確換算單位（2 dashes 苦精不等於 2 oz）
        acid_t, sweet_t, bitter_t, punch_t = flavor_totals(
            [(ri.ingredient, ri.amount, ri.unit) for ri in recipe_ings]
        )
        score, grade = calculate_overall_balance_score(acid_t, sweet_t, bitter_t, punch_t)

        # Step 8：命名
        names = generate_recipe_name(
            flavor_profile.get("primaryFlavors", []),
            score,
        )

        # Step 9：生成步驟說明
        steps = self._generate_steps(method, recipe_ings, ingredients)

        # Step 10：裝飾建議
        garnish = self._suggest_garnish(flavor_profile.get("primaryFlavors", []))

        # Step 11：替代品建議
        alternatives = self._suggest_alternatives(
            available_slugs, ingredients, balance_params
        )

        return RecipeResult(
            name_en=names["en"],
            name_zh=names["zh"],
            method=method,
            glass_type=METHOD_TO_GLASS[method][0],
            balance_score=score,
            grade=grade,
            ingredients=recipe_ings,
            steps=steps,
            garnish=garnish,
            flavor_profile=flavor_profile,
            balance_params=balance_params,
            alternatives=alternatives,
            insights={
                "balanceAnalysis": self._balance_analysis(score, grade, balance_params),
                "tipsForImprovement": self._improvement_tips(score, acid_t, sweet_t),
            },
        )

    def find_substitutes(
        self,
        missing_slug: str,
        available_slugs: list[str],
        top_n: int = 3,
    ) -> list[FlavorMatch]:
        """為缺失材料尋找替代品"""
        missing = self._db_map.get(missing_slug)
        if not missing:
            raise ValueError(f"找不到材料：{missing_slug}")

        available = [self._db_map[s] for s in available_slugs if s in self._db_map]
        return find_substitutes(
            missing["flavorVector"],
            available,
            target_category=missing.get("category"),
            top_n=top_n,
        )

    # ─────────────────────────── Private helpers ────────────────────────────

    def _resolve_ingredients(self, slugs: list[str]) -> list[dict]:
        return [self._db_map[s] for s in slugs if s in self._db_map]

    def _calculate_amounts(
        self,
        base: list[dict],
        sours: list[dict],
        sweets: list[dict],
        all_ings: list[dict],
        params: BalanceParameters | None,
        prefs: dict,
    ) -> list[RecipeIngredient]:
        items: list[RecipeIngredient] = []

        if base:
            items.append(RecipeIngredient(base[0], 2.0, "oz", "base"))

        sweet_amt = params.sweet_ratio if params else 0.75
        sour_amt = params.sour_ratio if params else 0.75

        if sours:
            items.append(RecipeIngredient(sours[0], round(sour_amt, 2), "oz", "sour"))
        if sweets:
            items.append(RecipeIngredient(sweets[0], round(sweet_amt, 2), "oz", "sweet"))

        # 其餘材料（accents / bitters）
        used = {i["id"] for i in base + sours + sweets}
        for ing in all_ings:
            if ing["id"] not in used:
                if ing["category"] == "bitter":
                    items.append(RecipeIngredient(ing, 2, "dashes", "accent"))
                elif ing["category"] == "mixer":
                    items.append(RecipeIngredient(ing, 3.0, "oz", "lengthener"))

        return items

    def _determine_method(self, ingredients: list[dict], prefs: dict) -> str:
        has_citrus = any((i.get("acidPH") or 7) < 4.5 for i in ingredients)
        has_dairy = any(i["category"] in ("dairy", "egg") for i in ingredients)

        if has_citrus or has_dairy:
            return "shake"

        has_aromatic_modifier = any(
            i["category"] in ("fortified_wine", "liqueur") for i in ingredients
        )
        if has_aromatic_modifier and not has_citrus:
            return "stir"

        return "build"

    def _generate_steps(
        self,
        method: str,
        recipe_ings: list[RecipeIngredient],
        all_ings: list[dict],
    ) -> list[str]:
        ing_list = "、".join(
            f"{ri.amount} {ri.unit} {ri.ingredient.get('nameZh', ri.ingredient['name'])}"
            for ri in recipe_ings
        )

        if method == "shake":
            return [
                "在 Shaker 中加入足量冰塊。",
                f"量入所有材料：{ing_list}。",
                "用力搖盪 12–15 秒，直到 Shaker 外壁結霜。",
                "用 Hawthorne Strainer 濾冰，倒入冷藏好的杯中。",
                "按建議裝飾後上桌。",
            ]
        elif method == "stir":
            return [
                "在 Mixing Glass 中加入大量冰塊。",
                f"量入所有材料：{ing_list}。",
                "以 Bar Spoon 緩慢攪拌 30–45 秒，直到充分冷卻稀釋。",
                "用 Julep Strainer 濾冰，倒入冷藏好的杯中。",
                "按建議裝飾後上桌。",
            ]
        else:
            return [
                "在杯中放入 1–2 個大冰塊。",
                f"依序量入：{ing_list}。",
                "用 Bar Spoon 輕柔攪拌 2–3 秒混合。",
                "按建議裝飾後上桌。",
            ]

    def _suggest_garnish(self, primary_flavors: list[str]) -> str:
        garnish_map = {
            "citrus": "萊姆輪切 (Lime Wheel) 或檸檬皮捲 (Lemon Twist)",
            "herbal": "新鮮草本枝（迷迭香 / 百里香 / 薄荷）",
            "tropical": "菠蘿旗幟 (Pineapple Flag) 或食用花",
            "berry": "新鮮莓果串 + 糖霜杯口",
            "smoky": "燒烤橙皮 (Flamed Orange Peel)",
            "floral": "可食用花卉（紫羅蘭 / 玫瑰花瓣）",
            "caramel": "肉桂棒 + 橙皮捲",
            "vanilla": "香草莢 + 磨碎肉荳蔻",
        }
        for f in primary_flavors:
            if f in garnish_map:
                return garnish_map[f]
        return "柑橘輪切 (Citrus Wheel)"

    def _suggest_alternatives(
        self,
        available_slugs: list[str],
        ingredients: list[dict],
        params: BalanceParameters | None,
    ) -> list[dict]:
        # 簡易替代建議：若缺少酸味成分
        has_sour = any((i.get("acidPH") or 7) < 4.5 for i in ingredients)
        suggestions = []
        if not has_sour:
            suggestions.append({
                "issue": "缺少酸味來源",
                "suggestion": "添加 ¾ oz 新鮮萊姆汁或檸檬汁以平衡甜度與酒感",
                "replaceSlugs": ["fresh-lime-juice", "fresh-lemon-juice"],
            })
        return suggestions

    def _balance_analysis(
        self, score: float, grade: str, params: BalanceParameters | None
    ) -> str:
        grade_desc = {
            "A": "平衡極佳，酸甜比接近黃金比例，酒感層次分明。",
            "B": "整體平衡良好，有輕微偏差但仍在舒適範圍內。",
            "C": "平衡尚可，建議微調酸甜比以提升口感協調度。",
            "D": "風味失衡，強烈建議重新調整比例或更換材料。",
        }
        base = grade_desc.get(grade, "")
        if params:
            base += f"（ABV {params.abv}%，{params.notes}）"
        return base

    def _improvement_tips(
        self, score: float, acid: float, sweet: float
    ) -> str | None:
        if score >= 90:
            return None
        if sweet > 0 and acid / sweet > 1.3:
            return "配方偏酸，建議增加 ¼ oz 糖漿或使用果汁稀釋。"
        if sweet > 0 and acid / sweet < 0.7:
            return "配方偏甜，建議增加 ¼ oz 柑橘汁或加入 1–2 dashes 苦精。"
        return "嘗試微調材料用量以找到個人最佳平衡點。"
