"""
recommender.py — 依使用者行為的個人化推薦

以使用者收藏過的配方合成「口味輪廓」，再據以推薦風味相近的配方。
與既有的替代品推薦不同：後者比較單一材料，此處比較整杯配方的風味向量。

使用者尚無收藏時無從推論偏好，此時回傳評分最高的經典配方作為起點，
而非硬湊出個人化結果。
"""
from ..data_store import cocktails, ingredient_index
from .balance_model import to_oz
from .flavor_wheel import FLAVOR_DIMS, cosine_similarity, synthesize_flavor_profile

# 評分 1–5 對應的權重：低分收藏代表不喜歡，不應拉高偏好輪廓
_RATING_WEIGHT = {1: 0.2, 2: 0.5, 3: 1.0, 4: 1.5, 5: 2.0}
_DEFAULT_WEIGHT = 1.0


def recipe_vector(recipe: dict) -> list[float] | None:
    """合成一道配方的 15 維風味向量；材料全數無法解析時回傳 None。"""
    index = ingredient_index()
    items = [
        (index[i["slug"]], to_oz(i.get("amount", 0), i.get("unit")))
        for i in recipe.get("ingredients", [])
        if i.get("slug") in index
    ]
    items = [(ing, amt) for ing, amt in items if amt > 0]
    if not items:
        return None
    return synthesize_flavor_profile(items)["vector"]


def build_taste_profile(favorites: dict) -> tuple[list[float] | None, int]:
    """
    由收藏合成口味輪廓，回傳 (向量, 採計的配方數)。

    favorites 形狀為 {slug: {"rating": int, ...}}，與前端 localStorage 一致。
    評分越高權重越大；未評分者以中等權重計入。
    """
    by_slug = {r.get("slug") or r.get("id"): r for r in cocktails()}
    total = [0.0] * len(FLAVOR_DIMS)
    weight_sum = 0.0
    counted = 0

    for slug, meta in (favorites or {}).items():
        recipe = by_slug.get(slug)
        if recipe is None:
            continue
        vec = recipe_vector(recipe)
        if vec is None:
            continue
        rating = (meta or {}).get("rating") if isinstance(meta, dict) else None
        weight = _RATING_WEIGHT.get(rating, _DEFAULT_WEIGHT) if isinstance(rating, int) \
            else _DEFAULT_WEIGHT
        for i, v in enumerate(vec):
            total[i] += v * weight
        weight_sum += weight
        counted += 1

    if counted == 0 or weight_sum == 0:
        return None, 0
    return [v / weight_sum for v in total], counted


def _makeable_ratio(recipe: dict, owned: set[str]) -> float:
    slugs = [i.get("slug") for i in recipe.get("ingredients", []) if i.get("slug")]
    if not slugs:
        return 0.0
    return sum(1 for s in slugs if s in owned) / len(slugs)


def _top_flavors(vec: list[float], n: int = 3) -> list[str]:
    ranked = sorted(range(len(vec)), key=lambda i: vec[i], reverse=True)
    return [FLAVOR_DIMS[i] for i in ranked[:n] if vec[i] > 0.15]


def recommend(
    favorites: dict | None = None,
    owned: list[str] | None = None,
    limit: int = 6,
) -> dict:
    """
    產生個人化推薦。

    Args:
        favorites: 使用者收藏 {slug: {rating, ...}}
        owned:     我的酒櫃材料 id 清單
        limit:     回傳筆數

    Returns:
        {"basis": "favorites" | "popular", "profile": [...], "items": [...]}
    """
    owned_set = set(owned or [])
    profile, counted = build_taste_profile(favorites or {})
    favorited = set((favorites or {}).keys())

    candidates = []
    for recipe in cocktails():
        slug = recipe.get("slug") or recipe.get("id")
        if slug in favorited:
            continue          # 已收藏的不再推薦

        if profile is None:
            # 尚無收藏可供推論，改以資料集既有的評分排序
            score = (recipe.get("balanceScore") or 0) / 100.0
            similarity = None
        else:
            vec = recipe_vector(recipe)
            if vec is None:
                continue
            similarity = cosine_similarity(profile, vec)
            score = similarity

        ratio = _makeable_ratio(recipe, owned_set) if owned_set else 0.0
        # 手邊材料齊全的配方略為加分，但不喧賓奪主——推薦的核心仍是口味相近
        final = score + ratio * 0.15

        candidates.append({
            "slug": slug,
            "nameZh": recipe.get("nameZh", ""),
            "nameEn": recipe.get("nameEn", ""),
            "method": recipe.get("method", ""),
            "balanceScore": recipe.get("balanceScore"),
            "grade": recipe.get("grade"),
            "similarity": round(similarity, 4) if similarity is not None else None,
            "makeableRatio": round(ratio, 2),
            "score": round(final, 4),
        })

    candidates.sort(key=lambda c: c["score"], reverse=True)
    return {
        "basis": "favorites" if profile is not None else "popular",
        "favoritesUsed": counted,
        "profileFlavors": _top_flavors(profile) if profile else [],
        "items": candidates[:limit],
    }
