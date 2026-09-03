"""routes_search.py — 跨庫統一搜尋路由 (Unified Search Routes)"""
from fastapi import APIRouter, HTTPException, Query

from ..data_store import cocktails as _load_cocktails, preps as _load_prep

router = APIRouter(prefix="/search", tags=["Search 🔍"])


def _searchable_cocktail(r: dict) -> str:
    parts = [
        r.get("nameEn", ""),
        r.get("nameZh", ""),
        r.get("description", ""),
        r.get("descriptionZh", ""),
        " ".join(r.get("tags", [])),
    ]
    for ing in r.get("ingredients", []):
        parts.append(ing.get("slug", ""))
        parts.append(ing.get("name", ""))
        parts.append(ing.get("nameEn", ""))
    return " ".join(filter(None, parts)).lower()


def _searchable_prep(r: dict) -> str:
    parts = [
        r.get("nameEn", ""),
        r.get("nameZh", ""),
        r.get("description", ""),
        r.get("descriptionZh", ""),
        " ".join(r.get("tags", [])),
        " ".join(r.get("hashtags", [])),
    ]
    for ing in r.get("ingredients", []):
        parts.append(ing.get("name", ""))
        parts.append(ing.get("nameEn", ""))
    return " ".join(filter(None, parts)).lower()


# ---------- endpoints ----------

@router.get("/tags", summary="所有標籤統計")
async def all_tags():
    counts: dict[str, int] = {}
    for r in _load_cocktails():
        for t in r.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    for r in _load_prep():
        for t in r.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    return {"tags": [{"tag": k, "count": v} for k, v in sorted(counts.items())]}


@router.get("/hashtags", summary="備料 Hashtag 列表")
async def all_hashtags():
    counts: dict[str, int] = {}
    for r in _load_prep():
        for h in r.get("hashtags", []):
            counts[h] = counts.get(h, 0) + 1
    return {"hashtags": [{"hashtag": k, "count": v} for k, v in sorted(counts.items())]}


@router.get("", summary="統一搜尋")
async def unified_search(
    q: str = Query(..., min_length=1, description="關鍵字"),
    type: str = Query("all", description="cocktail | prep | all"),
    method: str | None = Query(None, description="shake | stir | build（僅調酒）"),
    tags: str | None = Query(None, description="以逗號分隔的標籤"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    keyword = q.lower()
    tag_set = {t.strip() for t in tags.split(",") if t.strip()} if tags else set()
    results: list[dict] = []

    if type in ("all", "cocktail"):
        for r in _load_cocktails():
            if method and r.get("method") != method:
                continue
            if tag_set and not tag_set.intersection(r.get("tags", [])):
                continue
            if keyword in _searchable_cocktail(r):
                results.append({"source": "cocktail", **r})

    if type in ("all", "prep"):
        for r in _load_prep():
            if tag_set and not tag_set.intersection(r.get("tags", [])):
                continue
            if keyword in _searchable_prep(r):
                results.append({"source": "prep", **r})

    total = len(results)
    return {"total": total, "items": results[offset : offset + limit]}
