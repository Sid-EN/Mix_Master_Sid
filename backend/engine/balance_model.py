"""
balance_model.py
────────────────
化學平衡模型 (Chemical Balance Model)

核心算法：ABV Sigmoid 動態調整
科學依據：Weber-Fechner Law（人類感知強度與刺激量呈對數關係）

ABV 越高 → 甜味感知被抑制 → 需要更多甜味與酸味以維持平衡感
"""

import math
from dataclasses import dataclass

from ..models.recipe import RecipeGrade


@dataclass
class BalanceParameters:
    """動態平衡參數輸出"""
    abv: float
    sweet_ratio: float       # oz of sweet per 2oz base
    sour_ratio: float        # oz of sour per 2oz base
    dilution_factor: float   # 冰塊稀釋係數
    balance_score: float     # 0-100
    category: str            # 'low' | 'standard' | 'high' | 'overproof'
    notes: str               # 文字說明


def _sigmoid(x: float) -> float:
    """標準 Sigmoid 函數，輸出範圍 [0, 1]"""
    return 1.0 / (1.0 + math.exp(-x))


def calculate_balance_parameters(
    abv: float,
    baseline_abv: float = 40.0,
    base_sweet: float = 0.75,
    base_sour: float = 0.75,
) -> BalanceParameters:
    """
    根據 ABV 動態計算酸甜平衡參數。

    Args:
        abv:          基酒酒精濃度 (0–100)
        baseline_abv: 基準 ABV（40%，對應 Vodka/Gin/Rum 標準強度）
        base_sweet:   基準甜味量 (oz)，預設 ¾ oz
        base_sour:    基準酸味量 (oz)，預設 ¾ oz

    Returns:
        BalanceParameters 含動態比例的平衡參數

    Examples:
        >>> p = calculate_balance_parameters(55.0)
        >>> p.category
        'high'
        >>> p.sweet_ratio  # 約 0.88
    """
    # 計算 ABV 偏差量（以 10% 為一個標準單位）
    deviation = (abv - baseline_abv) / 10.0
    sig = _sigmoid(deviation)

    # Sweet Multiplier（高 ABV 甜度需求更高）
    # ABV 20% → ×0.82；ABV 40% → ×0.97；ABV 60% → ×1.17
    sweet_multiplier = 0.72 + (0.55 * sig)

    # Sour Multiplier（高 ABV 酸度需略增，但幅度小於甜）
    # ABV 20% → ×0.85；ABV 40% → ×0.97；ABV 60% → ×1.10
    sour_multiplier = 0.78 + (0.42 * sig)

    # 稀釋係數：高 ABV 需要更長搖盪/更多冰塊
    dilution_factor = 1.0 + (0.008 * max(0.0, abv - 40.0))

    # 分類
    if abv < 30:
        category = "low"
        notes = "低酒精基酒（如 Wine、Beer）。酸甜可適度減少，避免遮蓋細緻風味。"
    elif abv < 48:
        category = "standard"
        notes = "標準烈酒（Vodka / Gin / Rum 40%）。採用經典黃金比例。"
    elif abv < 58:
        category = "high"
        notes = "高強度烈酒（Mezcal 46–55%）。需增加酸甜對比以平衡酒感。"
    else:
        category = "overproof"
        notes = "過桶/超高強度（Rum 65%+）。酸甜補償最大化，建議加大冰量。"

    balance_score = max(0.0, 100.0 - abs(deviation) * 8.0)

    return BalanceParameters(
        abv=round(abv, 2),
        sweet_ratio=round(base_sweet * sweet_multiplier, 3),
        sour_ratio=round(base_sour * sour_multiplier, 3),
        dilution_factor=round(dilution_factor, 3),
        balance_score=round(balance_score, 1),
        category=category,
        notes=notes,
    )


# ── 單位換算 ────────────────────────────────────────────────
# 配方資料混用多種單位；非容積單位（葉片、整顆、切片）不計入液體體積，
# 否則會嚴重稀釋所有比例（例：10 leaves 薄荷曾被當成 10 oz）。
OZ_TO_ML = 29.5735

VOLUME_OZ = {
    "oz": 1.0, "ml": 1.0 / OZ_TO_ML, "cl": 10.0 / OZ_TO_ML,
    "tsp": 1.0 / 6, "bsp": 1.0 / 8,
    "dash": 1.0 / 32, "dashes": 1.0 / 32,
    "drop": 1.0 / 600, "drops": 1.0 / 600,
    "g": 1.0 / OZ_TO_ML,
}
NON_VOLUME_UNITS = {
    "whole", "leaf", "leaves", "slice", "slices", "sprig", "sprigs",
    "wedge", "wedges", "pinch", "piece", "pieces", "個", "根", "枝", "顆",
}

LIME_PH = 2.2  # 以新鮮萊姆汁作為酸度強度 1.0 的基準


def to_oz(amount: float, unit: str | None) -> float:
    """將配方用量換算為 oz；非容積單位回傳 0。"""
    u = (unit or "oz").strip().lower()
    if u in VOLUME_OZ:
        return amount * VOLUME_OZ[u]
    if u in NON_VOLUME_UNITS or any(n in u for n in NON_VOLUME_UNITS):
        return 0.0
    return 0.0


def acid_strength(ph: float | None) -> float:
    """
    由 pH 推得相對酸度強度 (0–1)。

    pH 是對數尺度，直接線性使用會嚴重高估弱酸——通寧水 (pH 3.0) 會被
    當成與萊姆汁 (pH 2.2) 同級。改以氫離子濃度比值計算才符合實際味覺。
    """
    if ph is None or ph >= 4.5:
        return 0.0
    return min(1.0, 10 ** (LIME_PH - ph))


def flavor_totals(items) -> tuple[float, float, float, float]:
    """
    由 (材料 dict, 用量, 單位) 序列計算正規化的四項風味總量。

    以實際糖度／酸度／苦度／酒精含量加權，而非僅依類別歸屬——
    通寧水含糖卻不屬於 syrup 類別，果汁含糖也一樣。

    Returns:
        (acid, sweet, bitter, punch)，皆為相對總容積的比例 (0–1)
    """
    acid = sweet = bitter = punch = total = 0.0
    for ingredient, amount, unit in items:
        vol = to_oz(amount, unit)
        total += vol
        if not ingredient:
            continue
        acid += vol * acid_strength(ingredient.get("acidPH"))
        sweet += vol * (ingredient.get("sugarContent") or 0) / 100.0
        bitter += vol * (ingredient.get("bitterUnit") or 0) / 100.0
        punch += vol * (ingredient.get("abv") or 0) / 100.0
    total = total or 1.0
    return acid / total, sweet / total, bitter / total, punch / total


# ── 平衡評分 ────────────────────────────────────────────────
# 三大調酒家族的可接受區間，取自 51 道經典配方的實測分布。
# 區間內不扣分，超出者依區間寬度正規化後扣分。
_BANDS = {
    "spirit_forward": {"punch": (0.22, 0.40), "sweet": (0.05, 0.16), "bitter": (0.00, 0.40)},
    "highball":       {"ratio": (0.26, 2.64), "punch": (0.09, 0.17), "sweet": (0.04, 0.17)},
    "sour":           {"ratio": (0.80, 4.89), "punch": (0.19, 0.32), "sweet": (0.05, 0.22)},
}
_WEIGHTS = {
    "spirit_forward": {"punch": 60.0, "sweet": 30.0, "bitter": 22.0},
    "highball":       {"ratio": 26.0, "punch": 55.0, "sweet": 30.0},
    "sour":           {"ratio": 26.0, "punch": 55.0, "sweet": 30.0},
}
_INTERIOR_SPREAD = 12.0   # 區間內仍給予細部梯度，避免所有配方同分
_MAX_EXCURSION = 2.5
_EPS = 1e-6


def classify_family(acid: float, sweet: float, bitter: float, punch: float) -> str:
    """
    判定調酒家族。

    無酸味者屬烈酒基調（Negroni／Manhattan／Old Fashioned）；
    酒感偏低者屬長飲（Gin & Tonic／Moscow Mule）；其餘為酸味短飲。
    """
    if acid < 0.02:
        return "spirit_forward"
    return "highball" if punch < 0.18 else "sour"


def _excursion(v: float, lo: float, hi: float) -> float:
    if v < lo:
        return (lo - v) / max(hi - lo, 1e-3)
    if v > hi:
        return (v - hi) / max(hi - lo, 1e-3)
    return 0.0


def _interior(v: float, lo: float, hi: float) -> float:
    mid = (lo + hi) / 2
    return min(1.0, abs(v - mid) / max((hi - lo) / 2, 1e-3))


def calculate_overall_balance_score(
    acid_total: float,
    sweet_total: float,
    bitter_total: float,
    punch_total: float,
) -> tuple[float, RecipeGrade]:
    """
    計算配方的整體平衡分數。

    先判定家族，再以該家族的可接受區間評分——不同家族的平衡標準本就不同，
    以單一酸糖比評斷會把整個烈酒基調家族誤判為不及格。

    Args:
        acid_total:   酸度總量（相對總容積，0–1）
        sweet_total:  糖度總量（相對總容積，0–1）
        bitter_total: 苦度總量（相對總容積，0–1）
        punch_total:  酒精總量（相對總容積，0–1）

    Returns:
        (score: float, grade: str) — score 0–100，grade A/B/C/D
    """
    if acid_total + sweet_total + bitter_total + punch_total <= _EPS:
        return 0.0, "D"

    family = classify_family(acid_total, sweet_total, bitter_total, punch_total)
    bands, weights = _BANDS[family], _WEIGHTS[family]
    values = {
        "ratio": acid_total / max(sweet_total, 0.01),
        "punch": punch_total,
        "sweet": sweet_total,
        "bitter": bitter_total,
    }

    penalty = 0.0
    interior = []
    for key, (lo, hi) in bands.items():
        v = values[key]
        penalty += min(_excursion(v, lo, hi), _MAX_EXCURSION) * weights[key]
        interior.append(_interior(v, lo, hi))
    penalty += (sum(interior) / len(interior)) * _INTERIOR_SPREAD

    score = max(0.0, min(100.0, 100.0 - penalty))

    grade: RecipeGrade
    if score >= 90:
        grade = "A"
    elif score >= 75:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "D"

    return round(score, 1), grade
