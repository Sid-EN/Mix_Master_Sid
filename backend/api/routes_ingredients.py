"""routes_ingredients.py — 材料庫 API 路由 (Ingredients Routes)"""
import json
import os
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/ingredients", tags=["Ingredients 🧂"])

_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "ingredients.json")


def _load() -> list[dict]:
    with open(_DATA, encoding="utf-8") as f:
        return json.load(f)


@router.get("", summary="全部材料列表")
async def list_ingredients(
    category: str | None = Query(None, description="base_spirit | liqueur | wine | syrup | juice | mixer | fresh | bitter | fortified_wine | dairy | egg"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """取得材料列表，可依類別篩選"""
    data = _load()
    if category:
        data = [i for i in data if i.get("category") == category]
    total = len(data)
    return {"total": total, "items": data[offset: offset + limit]}


@router.get("/categories", summary="材料分類統計")
async def list_categories():
    """取得所有材料分類及其數量"""
    counts: dict[str, int] = {}
    for i in _load():
        cat = i.get("category", "other")
        counts[cat] = counts.get(cat, 0) + 1
    return [{"category": k, "count": v} for k, v in sorted(counts.items())]


@router.get("/search", summary="搜尋材料")
async def search_ingredients(
    q: str = Query(..., min_length=1, description="關鍵字"),
    category: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
):
    """根據關鍵字搜尋材料（支援中英文名稱、風味標籤）"""
    keyword = q.lower()
    results = []
    for i in _load():
        if category and i.get("category") != category:
            continue
        searchable = " ".join(filter(None, [
            i.get("nameEn", ""),
            i.get("nameZh", ""),
            i.get("description", ""),
            " ".join(i.get("flavorTags", [])),
            i.get("category", ""),
        ])).lower()
        if keyword in searchable:
            results.append(i)
    return {"total": len(results), "items": results[:limit]}


@router.get("/{ingredient_id}", summary="材料詳情")
async def get_ingredient(ingredient_id: str):
    """根據 ID 或 slug 取得單一材料詳情"""
    for i in _load():
        if i.get("id") == ingredient_id or i.get("slug") == ingredient_id:
            return i
    raise HTTPException(404, detail=f"找不到材料：{ingredient_id}")
