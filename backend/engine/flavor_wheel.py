"""
flavor_wheel.py
───────────────
風味輪相似度演算法 (Flavor Wheel Similarity Engine)

核心策略：
  combined_score = 0.6 × cosine_similarity
                 + 0.4 × complementary_score

15 維風味向量空間：
  [citrus, tropical, berry, stone_fruit, herbal, floral, spicy,
   earthy, smoky, nutty, vanilla, caramel, bitter, umami, oak]
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    pass

# 風味維度索引（對應 TypeScript FlavorVector）
FLAVOR_DIMS = [
    "citrus",      # 0
    "tropical",    # 1
    "berry",       # 2
    "stone_fruit", # 3
    "herbal",      # 4
    "floral",      # 5
    "spicy",       # 6
    "earthy",      # 7
    "smoky",       # 8
    "nutty",       # 9
    "vanilla",     # 10
    "caramel",     # 11
    "bitter",      # 12
    "umami",       # 13
    "oak",         # 14
]

# 互補風味對（index → list of complementary indices）
# 依據調酒學理論：相對風味相遇可產生協同效果
COMPLEMENTARY_PAIRS: dict[int, list[int]] = {
    0:  [4, 5],    # citrus    → herbal, floral
    1:  [8, 6],    # tropical  → smoky, spicy
    2:  [9, 10],   # berry     → nutty, vanilla
    3:  [5, 11],   # stone_fruit → floral, caramel
    4:  [0, 3],    # herbal    → citrus, stone_fruit
    5:  [0, 2],    # floral    → citrus, berry
    6:  [1, 11],   # spicy     → tropical, caramel
    8:  [1, 2],    # smoky     → tropical, berry
    9:  [2, 10],   # nutty     → berry, vanilla
    10: [12, 8],   # vanilla   → bitter, smoky
    11: [0, 12],   # caramel   → citrus, bitter
    12: [10, 14],  # bitter    → vanilla, oak
    14: [12, 13],  # oak       → bitter, umami
}


@dataclass
class FlavorMatch:
    """風味匹配結果"""
    ingredient_id: str
    ingredient_name: str
    similarity_score: float      # 0–1 餘弦相似度
    complementary_score: float   # 0–1 互補分數
    combined_score: float        # 最終加權分數
    match_reason: str            # 說明匹配原因


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """計算兩個風味向量的餘弦相似度 (0–1)"""
    a = np.array(vec_a, dtype=float)
    b = np.array(vec_b, dtype=float)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def complementary_score(
    target: list[float],
    candidate: list[float],
) -> float:
    """
    計算候選材料對目標風味的互補分數。

    找出 target 的主導維度，檢查 candidate 是否有對應的互補維度。
    """
    t = np.array(target, dtype=float)
    c = np.array(candidate, dtype=float)

    # 取目標向量中最強的前 3 個維度
    dominant = np.argsort(t)[-3:].tolist()

    score = 0.0
    for dim in dominant:
        if dim in COMPLEMENTARY_PAIRS:
            for comp_dim in COMPLEMENTARY_PAIRS[dim]:
                if c[comp_dim] > 0.4:
                    score += c[comp_dim] * (1.0 / len(COMPLEMENTARY_PAIRS[dim]))

    return round(min(1.0, score), 4)


def combined_match_score(
    target: list[float],
    candidate: list[float],
    w_sim: float = 0.6,
    w_comp: float = 0.4,
) -> float:
    """
    最終匹配分數 = 0.6 × cosine + 0.4 × complementary
    """
    sim = cosine_similarity(target, candidate)
    comp = complementary_score(target, candidate)
    return round(w_sim * sim + w_comp * comp, 4)


# 可互相替代的類別群組。跨群組替代（例如以果汁取代利口酒）幾乎不可行，
# 因此給予重罰而非直接排除——同群組內仍以風味相似度決定排序。
_SUBSTITUTABLE_GROUPS = [
    {"base_spirit"},
    {"liqueur", "fortified_wine"},
    {"syrup"},
    {"juice", "fresh"},
    {"mixer"},
    {"bitter"},
    {"wine", "fortified_wine"},
    {"dairy", "egg"},
]


def _category_affinity(a: str | None, b: str | None) -> float:
    """類別相容度：相同為 1.0，同群組 0.85，其餘 0.45。"""
    if a == b:
        return 1.0
    for group in _SUBSTITUTABLE_GROUPS:
        if a in group and b in group:
            return 0.85
    return 0.45


def find_substitutes(
    missing_vector: list[float],
    available_ingredients: list[dict],
    same_category_only: bool = False,
    target_category: str | None = None,
    top_n: int = 3,
    min_score: float = 0.5,
) -> list[FlavorMatch]:
    """
    為缺失材料尋找最佳替代品。

    排序依據為「風味相似度 × 類別相容度」。

    先前的公式為 0.6×相似度 + 0.4×互補度，但互補度衡量的是「兩者搭配
    起來協調」，與「可互相取代」恰好相反：金巴利→艾普羅（相似度 0.96，
    教科書級替代）得 0.58，君度→萊姆汁卻得 0.91。互補度仍保留於回傳
    結果供參考，但不再參與排序。

    Args:
        missing_vector:         缺失材料的 15 維風味向量
        available_ingredients:  可用材料字典列表（含 flavorVector 欄位）
        same_category_only:     是否只在相同類別中搜尋
        target_category:        缺失材料的類別，用於計算相容度
        top_n:                  返回前 N 個結果
        min_score:              低於此分數不回傳，避免給出無用建議

    Returns:
        按 combined_score 排序的 FlavorMatch 列表
    """
    matches: list[FlavorMatch] = []

    for ing in available_ingredients:
        if same_category_only and target_category:
            if ing.get("category") != target_category:
                continue

        cand_vec = ing.get("flavorVector", [0.0] * 15)
        if len(cand_vec) != 15:
            continue

        sim = cosine_similarity(missing_vector, cand_vec)
        comp = complementary_score(missing_vector, cand_vec)
        affinity = _category_affinity(target_category, ing.get("category"))
        total = round(sim * affinity, 4)

        if total < min_score:
            continue

        reason_parts = []
        if sim > 0.85:
            reason_parts.append("風味輪廓高度相似")
        elif sim > 0.6:
            reason_parts.append("風味輪廓中度相似")
        if affinity == 1.0:
            reason_parts.append("同類別材料")
        elif affinity < 0.85:
            reason_parts.append("跨類別替代，風味會有落差")
        reason = "；".join(reason_parts) if reason_parts else "基礎替代方案"

        matches.append(FlavorMatch(
            ingredient_id=ing["id"],
            ingredient_name=ing.get("nameZh", ing.get("name", "")),
            similarity_score=round(sim, 4),
            complementary_score=round(comp, 4),
            combined_score=total,
            match_reason=reason,
        ))

    return sorted(matches, key=lambda x: x.combined_score, reverse=True)[:top_n]


def synthesize_flavor_profile(
    ingredients_with_amounts: list[tuple[dict, float]],
) -> dict:
    """
    合成配方的整體風味輪廓（加權平均）。

    Args:
        ingredients_with_amounts: [(ingredient_dict, amount_oz), ...]

    Returns:
        {
          "vector": list[float],       # 合成後的 15 維向量
          "primaryFlavors": list[str], # 前 3 主導風味名稱
          "description": str,          # 自然語言描述
        }
    """
    if not ingredients_with_amounts:
        return {"vector": [0.0] * 15, "primaryFlavors": [], "description": "無法分析"}

    total_amount = sum(amt for _, amt in ingredients_with_amounts)
    if total_amount == 0:
        return {"vector": [0.0] * 15, "primaryFlavors": [], "description": "無法分析"}

    weighted = np.zeros(15, dtype=float)
    for ing, amt in ingredients_with_amounts:
        vec = np.array(ing.get("flavorVector", [0.0] * 15), dtype=float)
        if len(vec) == 15:
            weighted += vec * (amt / total_amount)

    # 正規化至 0–1
    max_val = weighted.max()
    if max_val > 0:
        weighted = weighted / max_val

    top_indices = np.argsort(weighted)[-3:][::-1].tolist()
    primary_flavors = [FLAVOR_DIMS[i] for i in top_indices if weighted[i] > 0.3]

    description = _generate_flavor_description(primary_flavors, weighted.tolist())

    return {
        "vector": [round(float(v), 4) for v in weighted],
        "primaryFlavors": primary_flavors,
        "description": description,
    }


def _generate_flavor_description(
    primary_flavors: list[str],
    vector: list[float],
) -> str:
    """根據主導風味生成自然語言描述"""
    zh_map = {
        "citrus": "清爽柑橘",
        "tropical": "熱帶果香",
        "berry": "莓果甜香",
        "stone_fruit": "核果風味",
        "herbal": "清新草本",
        "floral": "優雅花香",
        "spicy": "辛香刺激",
        "earthy": "大地根莖",
        "smoky": "迷人煙燻",
        "nutty": "醇厚堅果",
        "vanilla": "溫暖香草",
        "caramel": "焦糖甘甜",
        "bitter": "複雜苦韻",
        "umami": "深沉鮮味",
        "oak": "橡木木質",
    }

    if not primary_flavors:
        return "風味均衡，口感中性。"

    parts = [zh_map.get(f, f) for f in primary_flavors[:3]]

    if len(parts) == 1:
        return f"以{parts[0]}為主導，風味清晰直接。"
    elif len(parts) == 2:
        return f"{parts[0]}與{parts[1]}相互交融，層次豐富。"
    else:
        return f"以{parts[0]}打頭陣，{parts[1]}提供厚度，{parts[2]}收尾增添複雜感。"
