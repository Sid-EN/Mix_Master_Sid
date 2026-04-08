"""
recipe.py
─────────
Pydantic v2 配方資料模型 (Recipe Data Models)
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field


RecipeType   = Literal["classic", "generated", "user"]
RecipeMethod = Literal["shake", "stir", "build", "roll", "throw"]
RecipeGrade  = Literal["A", "B", "C", "D"]


class RecipeIngredientItem(BaseModel):
    ingredient_id: str
    ingredient_name: str
    ingredient_name_zh: str
    amount: float = Field(..., gt=0)
    unit: str = "oz"
    is_optional: bool = False
    notes: Optional[str] = None


class FlavorProfileOut(BaseModel):
    vector: list[float]
    primary_flavors: list[str] = Field(alias="primaryFlavors")
    description: str

    model_config = {"populate_by_name": True}


class AlternativeSuggestion(BaseModel):
    issue: str
    suggestion: str
    replace_slugs: list[str] = Field(alias="replaceSlugs")

    model_config = {"populate_by_name": True}


class RecipeInsights(BaseModel):
    balance_analysis: str = Field(alias="balanceAnalysis")
    tips_for_improvement: Optional[str] = Field(None, alias="tipsForImprovement")

    model_config = {"populate_by_name": True}


class RecipeOut(BaseModel):
    """API 回應用配方模型"""
    name_en: str = Field(alias="nameEn")
    name_zh: str = Field(alias="nameZh")
    method: RecipeMethod
    glass_type: str = Field(alias="glassType")
    balance_score: float = Field(alias="balanceScore", ge=0, le=100)
    grade: RecipeGrade
    ingredients: list[RecipeIngredientItem]
    steps: list[str]
    garnish: Optional[str] = None
    flavor_profile: FlavorProfileOut = Field(alias="flavorProfile")
    alternatives: list[AlternativeSuggestion] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class GenerateRequest(BaseModel):
    """POST /engine/generate 請求 Schema"""
    available_ingredients: list[str] = Field(
        alias="availableIngredients",
        min_length=1,
        max_length=20,
        description="材料 slug 列表",
    )
    preferences: Optional[dict] = None
    user_level: int = Field(default=1, alias="userLevel", ge=1, le=5)

    model_config = {"populate_by_name": True}


class GenerateResponse(BaseModel):
    """POST /engine/generate 回應 Schema"""
    success: bool = True
    recipe: RecipeOut
    insights: RecipeInsights


class BalanceCheckRequest(BaseModel):
    ingredients: list[dict]


class SubstituteRequest(BaseModel):
    missing_slug: str = Field(alias="missingSlug")
    available_slugs: list[str] = Field(alias="availableSlugs")
    top_n: int = Field(default=3, alias="topN", ge=1, le=10)

    model_config = {"populate_by_name": True}
