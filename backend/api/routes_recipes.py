"""routes_recipes.py — 配方 CRUD 路由"""
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from .. import user_recipes as store
from ..data_store import cocktails as _load, ingredient_index as _ingredient_index
from ..engine.balance_model import calculate_overall_balance_score, flavor_totals

router = APIRouter(prefix="/recipes", tags=["Recipes 🍹"])

VALID_METHODS = {"shake", "stir", "build", "blend", "throw"}


class UserRecipeIngredient(BaseModel):
    slug: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    unit: str = "oz"


class UserRecipeIn(BaseModel):
    """使用者自建配方的輸入格式。分數與等第由引擎計算，不接受前端指定。"""
    name_zh: str = Field(..., alias="nameZh", min_length=1, max_length=80)
    name_en: str = Field("", alias="nameEn", max_length=80)
    method: str = "build"
    glass_type: str = Field("rocks_glass", alias="glassType")
    ingredients: list[UserRecipeIngredient] = Field(..., min_length=1)
    steps: list[str] = Field(default_factory=list)
    garnish: str = ""
    description_zh: str = Field("", alias="descriptionZh", max_length=500)
    tags: list[str] = Field(default_factory=list)
    slug: str | None = None

    model_config = {"populate_by_name": True}


def _score(ingredients: list[dict]) -> tuple[float, str]:
    """以與經典配方相同的模型替使用者配方評分。"""
    index = _ingredient_index()
    items = [(index.get(i["slug"]), i["amount"], i.get("unit", "oz")) for i in ingredients]
    return calculate_overall_balance_score(*flavor_totals(items))


def _validate(body: UserRecipeIn) -> dict:
    if body.method not in VALID_METHODS:
        raise HTTPException(422, detail=f"未知的調製手法：{body.method}")
    index = _ingredient_index()
    unknown = [i.slug for i in body.ingredients if i.slug not in index]
    if unknown:
        raise HTTPException(422, detail=f"材料不存在：{'、'.join(unknown)}")

    ingredients = [i.model_dump() for i in body.ingredients]
    score, grade = _score(ingredients)
    return {
        "nameZh": body.name_zh,
        "nameEn": body.name_en or body.name_zh,
        "method": body.method,
        "glassType": body.glass_type,
        "ingredients": ingredients,
        "steps": body.steps,
        "garnish": body.garnish,
        "descriptionZh": body.description_zh,
        "description": "",
        "tags": body.tags,
        "balanceScore": score,
        "grade": grade,
        "difficulty": min(5, max(1, len(ingredients) - 1)),
    }


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
    data = list(_load()) + store.load()
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
    for r in list(_load()) + store.load():
        if r.get("id") == recipe_id or r.get("slug") == recipe_id:
            return _with_ingredient_names(r, _ingredient_index())
    raise HTTPException(404, detail=f"找不到配方：{recipe_id}")


# ── 使用者自建配方 ──────────────────────────────────────────
# 資料模型早已預留 type="user"，但先前只有讀取端點，沒有建立途徑。

@router.post("", status_code=status.HTTP_201_CREATED, summary="建立使用者配方")
async def create_recipe(body: UserRecipeIn):
    payload = _validate(body)
    if body.slug:
        payload["slug"] = body.slug
    try:
        created = store.create(payload)
    except ValueError as e:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(e))
    return _with_ingredient_names(created, _ingredient_index())


@router.put("/{recipe_id}", summary="更新使用者配方")
async def update_recipe(recipe_id: str, body: UserRecipeIn):
    if any(r.get("id") == recipe_id for r in _load()):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="經典配方不可修改")
    updated = store.update(recipe_id, _validate(body))
    if not updated:
        raise HTTPException(404, detail=f"找不到使用者配方：{recipe_id}")
    return _with_ingredient_names(updated, _ingredient_index())


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="刪除使用者配方")
async def delete_recipe(recipe_id: str):
    if any(r.get("id") == recipe_id for r in _load()):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="經典配方不可刪除")
    if not store.delete(recipe_id):
        raise HTTPException(404, detail=f"找不到使用者配方：{recipe_id}")
    return None
