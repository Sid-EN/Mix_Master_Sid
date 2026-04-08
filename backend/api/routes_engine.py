"""
routes_engine.py
────────────────
風味引擎 API 路由 (Flavor Engine Endpoints)
"""

from fastapi import APIRouter, HTTPException, status
from ..models.recipe import (
    GenerateRequest, GenerateResponse, SubstituteRequest,
    RecipeOut, RecipeIngredientItem, FlavorProfileOut,
    AlternativeSuggestion, RecipeInsights
)
from ..engine.flavor_engine import FlavorEngine

router = APIRouter(prefix="/engine", tags=["Flavor Engine 🧪"])
_engine = FlavorEngine()


@router.post("/generate", response_model=GenerateResponse, summary="生成調酒配方")
async def generate_recipe(body: GenerateRequest):
    """
    核心功能：根據使用者提供的材料 slug 列表，
    透過智慧風味平衡引擎生成最佳化調酒配方。

    - **availableIngredients**: 材料 slug 列表（如 "tanqueray-gin"）
    - **preferences**: 可選偏好設定（style, glass, maxIngredients）
    - **userLevel**: 使用者等級 1–5
    """
    try:
        result = _engine.generate(
            available_slugs=body.available_ingredients,
            preferences=body.preferences,
            user_level=body.user_level,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    # 序列化
    recipe_ings = [
        RecipeIngredientItem(
            ingredient_id=ri.ingredient["id"],
            ingredient_name=ri.ingredient["name"],
            ingredient_name_zh=ri.ingredient.get("nameZh", ""),
            amount=ri.amount,
            unit=ri.unit,
        )
        for ri in result.ingredients
    ]

    recipe_out = RecipeOut(
        nameEn=result.name_en,
        nameZh=result.name_zh,
        method=result.method,
        glassType=result.glass_type,
        balanceScore=result.balance_score,
        grade=result.grade,
        ingredients=recipe_ings,
        steps=result.steps,
        garnish=result.garnish,
        flavorProfile=FlavorProfileOut(
            vector=result.flavor_profile["vector"],
            primaryFlavors=result.flavor_profile.get("primaryFlavors", []),
            description=result.flavor_profile.get("description", ""),
        ),
        alternatives=[
            AlternativeSuggestion(
                issue=a.get("issue", ""),
                suggestion=a.get("suggestion", ""),
                replaceSlugs=a.get("replaceSlugs", []),
            )
            for a in result.alternatives
        ],
    )

    return GenerateResponse(
        success=True,
        recipe=recipe_out,
        insights=RecipeInsights(
            balanceAnalysis=result.insights.get("balanceAnalysis", ""),
            tipsForImprovement=result.insights.get("tipsForImprovement"),
        ),
    )


@router.post("/substitute", summary="尋找材料替代品")
async def find_substitute(body: SubstituteRequest):
    """
    為指定的缺失材料，從可用材料中尋找風味最相近的替代品。
    """
    try:
        matches = _engine.find_substitutes(
            missing_slug=body.missing_slug,
            available_slugs=body.available_slugs,
            top_n=body.top_n,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {
        "missingSlug": body.missing_slug,
        "suggestions": [
            {
                "ingredientId": m.ingredient_id,
                "ingredientName": m.ingredient_name,
                "similarityScore": m.similarity_score,
                "complementaryScore": m.complementary_score,
                "combinedScore": m.combined_score,
                "matchReason": m.match_reason,
            }
            for m in matches
        ],
    }


@router.get("/flavor-wheel", summary="取得風味輪資料")
async def get_flavor_wheel():
    """返回 15 維風味輪維度定義與互補關係資料"""
    from ..engine.flavor_wheel import FLAVOR_DIMS, COMPLEMENTARY_PAIRS
    return {
        "dimensions": [
            {"index": i, "name": d}
            for i, d in enumerate(FLAVOR_DIMS)
        ],
        "complementaryPairs": {
            str(k): v for k, v in COMPLEMENTARY_PAIRS.items()
        },
    }
