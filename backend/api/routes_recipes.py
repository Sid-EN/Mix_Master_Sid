"""routes_recipes.py — 配方 CRUD 路由"""
from fastapi import APIRouter, HTTPException, Query

from ..data_store import cocktails as _load, ingredient_index as _ingredient_index

router = APIRouter(prefix="/recipes", tags=["Recipes 🍹"])


def _with_ingredient_names(recipe: dict, index: dict[str, dict]) -> dict:
    """
    補上材料的顯示名稱。

    配方只以 slug 參照材料，前端無從得知名稱，先前因此在每一列都顯示
    佔位字串「材料」。名稱在此解析後回傳，前端不需再自行 join。
    """
    out = dict(recipe)
    out["ingredients"] = [
        {
            **ing,
            "name": (index.get(ing.get("slug"), {}).get("name") or ing.get("name") or ing.get("slug", "")),
            "nameZh": (index.get(ing.get("slug"), {}).get("nameZh") or ing.get("nameZh") or ""),
        }
        for ing in recipe.get("ingredients", [])
    ]
    return out


@router.get("", summary="配方列表")
async def list_recipes(
    type: str | None = Query(None, description="classic | generated | user"),
    limit: int = Query(20, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    data = _load()
    if type:
        data = [r for r in data if r.get("type") == type]
    index = _ingredient_index()
    page = [_with_ingredient_names(r, index) for r in data[offset: offset + limit]]
    return {"total": len(data), "items": page}


@router.get("/classic", summary="經典配方")
async def classic_recipes():
    index = _ingredient_index()
    return [_with_ingredient_names(r, index)
            for r in _load() if r.get("type") == "classic"]


@router.get("/{recipe_id}", summary="配方詳情")
async def get_recipe(recipe_id: str):
    for r in _load():
        if r.get("id") == recipe_id or r.get("slug") == recipe_id:
            return _with_ingredient_names(r, _ingredient_index())
    raise HTTPException(404, detail=f"找不到配方：{recipe_id}")
