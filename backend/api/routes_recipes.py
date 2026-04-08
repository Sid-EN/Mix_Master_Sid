"""routes_recipes.py — 配方 CRUD 路由"""
import json, os
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/recipes", tags=["Recipes 🍹"])
_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "classic_recipes.json")


def _load():
    with open(_DATA, encoding="utf-8") as f:
        return json.load(f)


@router.get("", summary="配方列表")
async def list_recipes(
    type: str | None = Query(None, description="classic | generated | user"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    data = _load()
    if type:
        data = [r for r in data if r.get("type") == type]
    return {"total": len(data), "items": data[offset: offset + limit]}


@router.get("/classic", summary="經典配方")
async def classic_recipes():
    return [r for r in _load() if r.get("type") == "classic"]


@router.get("/{recipe_id}", summary="配方詳情")
async def get_recipe(recipe_id: str):
    for r in _load():
        if r.get("id") == recipe_id or r.get("slug") == recipe_id:
            return r
    raise HTTPException(404, detail=f"找不到配方：{recipe_id}")
