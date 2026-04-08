"""routes_prep.py — 備料製作 CRUD 路由 (Prep Recipe Routes)"""
import json
import os
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/prep", tags=["Prep Recipes 🧪"])

_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "prep_recipes.json")


def _load() -> list[dict]:
    with open(_DATA, encoding="utf-8") as f:
        return json.load(f)


# ---------- endpoints ----------

@router.get("/categories", summary="備料分類統計")
async def list_categories():
    counts: dict[str, int] = {}
    for r in _load():
        cat = r.get("category", "other")
        counts[cat] = counts.get(cat, 0) + 1
    return {"categories": [{"category": k, "count": v} for k, v in sorted(counts.items())]}


@router.get("/search", summary="搜尋備料配方")
async def search_prep(
    q: str = Query(..., min_length=1, description="關鍵字"),
    category: str | None = Query(None, description="syrup | infusion | bitters | mixer | garnish"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    keyword = q.lower()
    results = []
    for r in _load():
        if category and r.get("category") != category:
            continue
        searchable = " ".join(
            filter(
                None,
                [
                    r.get("nameEn", ""),
                    r.get("nameZh", ""),
                    r.get("description", ""),
                    r.get("descriptionZh", ""),
                    " ".join(r.get("tags", [])),
                    " ".join(r.get("hashtags", [])),
                ],
            )
        ).lower()
        if keyword in searchable:
            results.append(r)
    total = len(results)
    return {"total": total, "items": results[offset : offset + limit]}


@router.get("/{prep_id}", summary="備料詳情")
async def get_prep(prep_id: str):
    for r in _load():
        if r.get("id") == prep_id or r.get("slug") == prep_id:
            return r
    raise HTTPException(404, detail=f"找不到備料配方：{prep_id}")


@router.get("", summary="備料列表")
async def list_prep(
    category: str | None = Query(None, description="syrup | infusion | bitters | mixer | garnish"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    data = _load()
    if category:
        data = [r for r in data if r.get("category") == category]
    return {"total": len(data), "items": data[offset : offset + limit]}
