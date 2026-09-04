"""routes_recipes.py — 配方 CRUD 路由"""
import secrets
import uuid
from typing import get_args

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..data_store import cocktails as _load
from ..data_store import ingredient_index as _ingredient_index
from ..db import get_db
from ..engine.balance_model import calculate_overall_balance_score, flavor_totals
from ..models.db_models import User, UserRecipe
from ..models.recipe import RecipeMethod

router = APIRouter(prefix="/recipes", tags=["Recipes 🍹"])

# 由權威定義衍生，避免與 models.recipe 的 Literal 逐漸失同步
VALID_METHODS = set(get_args(RecipeMethod))


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


def _as_dict(row: UserRecipe) -> dict:
    """將資料庫中的使用者配方轉為與經典配方一致的形狀。"""
    return {
        **row.data,
        "id": row.slug,
        "slug": row.slug,
        "type": "user",
        "isShared": row.share_token is not None,
        "shareToken": row.share_token,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }


def _own_recipe(db: Session, slug: str, user: User) -> UserRecipe:
    """取得使用者自己的配方；他人的配方一律視為不存在，避免洩漏其存在與否。"""
    row = db.scalar(select(UserRecipe).where(UserRecipe.slug == slug))
    if row is None or row.user_id != user.id:
        raise HTTPException(404, detail=f"找不到使用者配方：{slug}")
    return row


@router.get("", summary="配方列表")
async def list_recipes(
    type: str | None = Query(None, description="classic | generated | user"),
    limit: int = Query(20, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    data = list(_load())
    if type != "classic":
        # 列表僅含經典配方與自己的配方；未登入者只看得到經典配方
        data = data + []
    if type:
        data = [r for r in data if r.get("type") == type]
    index = _ingredient_index()
    page = [_with_ingredient_names(r, index) for r in data[offset: offset + limit]]
    return {"total": len(data), "items": page}


@router.get("/mine", summary="我的配方")
async def my_recipes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(UserRecipe).where(UserRecipe.user_id == user.id).order_by(UserRecipe.created_at.desc())
    ).all()
    index = _ingredient_index()
    items = [_with_ingredient_names(_as_dict(r), index) for r in rows]
    return {"total": len(items), "items": items}


@router.get("/shared/{share_token}", summary="以分享連結檢視配方")
async def get_shared_recipe(share_token: str, db: Session = Depends(get_db)):
    """公開端點：憑不可猜測的權杖檢視，無需登入。撤銷分享後即失效。"""
    row = db.scalar(select(UserRecipe).where(UserRecipe.share_token == share_token))
    if row is None:
        raise HTTPException(404, detail="分享連結無效或已撤銷")
    return _with_ingredient_names(_as_dict(row), _ingredient_index())


@router.get("/classic", summary="經典配方")
async def classic_recipes():
    index = _ingredient_index()
    return [_with_ingredient_names(r, index)
            for r in _load() if r.get("type") == "classic"]


@router.get("/{recipe_id}", summary="配方詳情")
async def get_recipe(recipe_id: str, db: Session = Depends(get_db)):
    for r in _load():
        if r.get("id") == recipe_id or r.get("slug") == recipe_id:
            return _with_ingredient_names(r, _ingredient_index())
    # 使用者配方需經 /recipes/mine 或分享連結取得，此處不公開
    raise HTTPException(404, detail=f"找不到配方：{recipe_id}")


# ── 使用者自建配方 ──────────────────────────────────────────
# 配方屬於帳號：僅擁有者可修改或刪除。
# 先前以 JSON 檔儲存且無擁有者概念，任何未登入者都能刪改他人的配方。

@router.post("", status_code=status.HTTP_201_CREATED, summary="建立使用者配方")
async def create_recipe(
    body: UserRecipeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = _validate(body)
    slug = body.slug or f"user-{uuid.uuid4().hex[:10]}"
    row = UserRecipe(slug=slug, user_id=user.id, data=payload)
    db.add(row)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT,
                            detail=f"配方代號已存在：{slug}") from e
    db.refresh(row)
    return _with_ingredient_names(_as_dict(row), _ingredient_index())


@router.put("/{recipe_id}", summary="更新使用者配方")
async def update_recipe(
    recipe_id: str,
    body: UserRecipeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if any(r.get("id") == recipe_id for r in _load()):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="經典配方不可修改")
    row = _own_recipe(db, recipe_id, user)
    row.data = _validate(body)
    db.commit()
    db.refresh(row)
    return _with_ingredient_names(_as_dict(row), _ingredient_index())


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="刪除使用者配方")
async def delete_recipe(
    recipe_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if any(r.get("id") == recipe_id for r in _load()):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="經典配方不可刪除")
    row = _own_recipe(db, recipe_id, user)
    db.delete(row)
    db.commit()
    return None


# ── 分享 ────────────────────────────────────────────────────
# 以不可猜測的隨機權杖作為公開網址，而非直接暴露配方代號——
# 前者可隨時撤銷，後者一旦外流便無從收回。預設不公開。

@router.post("/{recipe_id}/share", summary="產生分享連結")
async def share_recipe(
    recipe_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _own_recipe(db, recipe_id, user)
    if row.share_token is None:
        row.share_token = secrets.token_urlsafe(24)
        db.commit()
        db.refresh(row)
    return {"shareToken": row.share_token, "path": f"/shared/{row.share_token}"}


@router.delete("/{recipe_id}/share", status_code=status.HTTP_204_NO_CONTENT,
               summary="撤銷分享連結")
async def unshare_recipe(
    recipe_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _own_recipe(db, recipe_id, user)
    row.share_token = None
    db.commit()
    return None
