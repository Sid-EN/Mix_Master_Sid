"""
ingredient.py
─────────────
Pydantic v2 材料資料模型 (Ingredient Data Models)
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

FlavorVector = list[float]  # 15 維，每個值 0.0–1.0

IngredientCategory = Literal[
    "base_spirit", "liqueur", "fortified_wine", "wine", "beer",
    "mixer", "juice", "syrup", "bitter", "fresh", "dairy", "egg", "garnish"
]
RarityLevel = Literal["common", "uncommon", "rare", "exotic"]
FlavorDimension = Literal[
    "citrus", "tropical", "berry", "stone_fruit", "herbal", "floral",
    "spicy", "earthy", "smoky", "nutty", "vanilla", "caramel",
    "bitter", "umami", "oak"
]


class IngredientBase(BaseModel):
    """材料基礎欄位"""
    id: str = Field(..., description="唯一識別 slug，如 'tanqueray-gin'")
    name: str = Field(..., max_length=200)
    name_zh: str = Field(..., alias="nameZh", max_length=200)
    brand: Optional[str] = Field(None, max_length=100)
    category: IngredientCategory
    subcategory: Optional[str] = Field(None, max_length=50)

    # 化學屬性
    abv: float = Field(default=0.0, ge=0.0, le=100.0)
    sugar_content: Optional[float] = Field(None, alias="sugarContent", ge=0.0)
    acid_ph: Optional[float] = Field(None, alias="acidPH", ge=0.0, le=14.0)
    bitter_unit: Optional[int] = Field(None, alias="bitterUnit", ge=0, le=100)
    calories_per_30ml: Optional[int] = Field(None, alias="caloriesPer30ml", ge=0)

    # 風味資料
    flavor_vector: FlavorVector = Field(..., alias="flavorVector")
    flavor_tags: list[FlavorDimension] = Field(default_factory=list, alias="flavorTags")
    aroma: list[str] = Field(default_factory=list)
    taste: list[str] = Field(default_factory=list)
    finish: Optional[str] = None

    # 產地製程
    origin: Optional[str] = Field(None, max_length=100)
    production_method: Optional[str] = Field(None, alias="productionMethod")
    aging: Optional[str] = None

    # 系統屬性
    rarity: RarityLevel = "common"
    color_hex: str = Field(default="#888888", alias="colorHex", pattern=r"^#[0-9A-Fa-f]{6}$")
    description: str = ""
    description_zh: str = Field(default="", alias="descriptionZh")
    substitutes: list[str] = Field(default_factory=list)
    pairing_bonus: dict[str, float] = Field(default_factory=dict, alias="pairingBonus")
    image_url: Optional[str] = Field(None, alias="imageUrl")
    tags: list[str] = Field(default_factory=list)

    @field_validator("flavor_vector")
    @classmethod
    def validate_flavor_vector(cls, v: list[float]) -> list[float]:
        if len(v) != 15:
            raise ValueError(f"flavorVector 必須為 15 維，目前為 {len(v)} 維")
        for val in v:
            if not (0.0 <= val <= 1.0):
                raise ValueError(f"flavorVector 每個值必須在 0.0–1.0 之間，得到 {val}")
        return v

    model_config = {"populate_by_name": True}


class IngredientOut(IngredientBase):
    """API 回應用材料模型（全欄位）"""
    pass


class IngredientSummary(BaseModel):
    """列表頁輕量材料摘要"""
    id: str
    name: str
    name_zh: str = Field(alias="nameZh")
    category: IngredientCategory
    abv: float
    rarity: RarityLevel
    color_hex: str = Field(alias="colorHex")
    flavor_tags: list[FlavorDimension] = Field(alias="flavorTags")

    model_config = {"populate_by_name": True}
