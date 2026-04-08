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


def calculate_overall_balance_score(
    acid_total: float,
    sweet_total: float,
    bitter_total: float,
    punch_total: float,
) -> tuple[float, str]:
    """
    計算一個配方的整體平衡分數。

    Args:
        acid_total:   配方中所有酸味成分的正規化總量 (0–1)
        sweet_total:  配方中所有甜味成分的正規化總量 (0–1)
        bitter_total: 配方中所有苦味成分的正規化總量 (0–1)
        punch_total:  配方中酒感的正規化總量 (0–1)

    Returns:
        (score: float, grade: str) — score 0–100，grade A/B/C/D
    """
    if sweet_total == 0 or acid_total == 0:
        return 0.0, "D"

    acid_sweet = acid_total / sweet_total  # 理想接近 1.0
    punch_acid = punch_total / max(acid_total, 0.01)  # 理想接近 2.5

    acid_sweet_dev = abs(acid_sweet - 1.0)
    punch_acid_dev = abs(punch_acid - 2.5) / 2.5

    score = 100.0 - (acid_sweet_dev * 40.0) - (punch_acid_dev * 30.0)
    score = max(0.0, min(100.0, score))

    if score >= 90:
        grade = "A"
    elif score >= 75:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "D"

    return round(score, 1), grade
