"""routes_batch.py — 智慧批次換算路由 (Batch Calculation Routes)"""
import json
import math
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/batch", tags=["Batch Calculator 🧮"])

_COCKTAIL_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "classic_recipes.json")
_PREP_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "prep_recipes.json")

OZ_TO_ML = 29.5735

DILUTION_FACTORS = {
    "shake": 1.25,
    "stir": 1.15,
    "build": 1.0,
}


def _load_cocktails() -> list[dict]:
    with open(_COCKTAIL_DATA, encoding="utf-8") as f:
        return json.load(f)


def _load_prep() -> list[dict]:
    with open(_PREP_DATA, encoding="utf-8") as f:
        return json.load(f)


def _find(data: list[dict], id_or_slug: str) -> dict | None:
    for r in data:
        if r.get("id") == id_or_slug or r.get("slug") == id_or_slug:
            return r
    return None


# ---------- models ----------

class BatchRequest(BaseModel):
    recipe_id: str = Field(alias="recipeId")
    multiplier: float = Field(ge=0.5, le=100, description="批次倍數")
    model_config = {"populate_by_name": True}


class BatchPrepRequest(BaseModel):
    prep_id: str = Field(alias="prepId")
    multiplier: float = Field(ge=0.5, le=100, description="批次倍數")
    model_config = {"populate_by_name": True}


# ---------- helpers ----------

def _round2(v: float) -> float:
    return round(v, 2)


def _dilution_note(method: str, factor: float, ml: float, servings: int) -> str:
    pct = round((factor - 1) * 100)
    method_zh = {"shake": "搖盪法", "stir": "攪拌法", "build": "直調法"}.get(method, method)
    if pct > 0:
        return f"{method_zh}預計稀釋約 {pct}%，實際產出約 {round(ml)}ml，可供 {servings} 杯標準份量。"
    return f"{method_zh}無額外稀釋，實際產出約 {round(ml)}ml，可供 {servings} 杯標準份量。"


# ---------- endpoints ----------

@router.post("/calculate", summary="調酒批次換算")
async def calculate_batch(req: BatchRequest):
    recipe = _find(_load_cocktails(), req.recipe_id)
    if not recipe:
        raise HTTPException(404, detail=f"找不到配方：{req.recipe_id}")

    method = recipe.get("method", "build")
    dilution = DILUTION_FACTORS.get(method, 1.0)

    total_oz = 0.0
    scaled_ingredients = []
    for ing in recipe.get("ingredients", []):
        amount = ing.get("amount", 0)
        unit = ing.get("unit", "oz")
        scaled = _round2(amount * req.multiplier)

        if unit == "oz":
            ml = _round2(scaled * OZ_TO_ML)
            total_oz += amount * req.multiplier
        else:
            ml = scaled
            total_oz += scaled / OZ_TO_ML

        scaled_ingredients.append({
            "name": ing.get("slug", ing.get("name", "")),
            "nameZh": ing.get("nameZh", ing.get("name", "")),
            "originalAmount": amount,
            "scaledAmount": scaled,
            "unit": unit,
            "scaledMl": ml,
        })

    total_ml = _round2(total_oz * OZ_TO_ML)
    estimated_ml = _round2(total_ml * dilution)
    servings = max(1, math.floor(req.multiplier))

    return {
        "recipeId": recipe["id"],
        "recipeName": recipe.get("nameEn", ""),
        "recipeNameZh": recipe.get("nameZh", ""),
        "multiplier": req.multiplier,
        "ingredients": scaled_ingredients,
        "totalVolume": {"oz": _round2(total_oz), "ml": total_ml},
        "estimatedOutput": {
            "ml": estimated_ml,
            "servings": servings,
            "method": method,
            "dilutionFactor": dilution,
        },
        "notes": _dilution_note(method, dilution, estimated_ml, servings),
    }


@router.post("/calculate-prep", summary="備料批次換算")
async def calculate_batch_prep(req: BatchPrepRequest):
    prep = _find(_load_prep(), req.prep_id)
    if not prep:
        raise HTTPException(404, detail=f"找不到備料配方：{req.prep_id}")

    scaled_ingredients = []
    total_ml = 0.0
    total_g = 0.0
    for ing in prep.get("ingredients", []):
        amount = ing.get("amount", 0)
        unit = ing.get("unit", "")
        scaled = _round2(amount * req.multiplier)

        if unit == "ml":
            total_ml += scaled
        elif unit == "g":
            total_g += scaled
        elif unit == "oz":
            total_ml += scaled * OZ_TO_ML

        scaled_ingredients.append({
            "name": ing.get("nameEn", ing.get("name", "")),
            "nameZh": ing.get("name", ""),
            "originalAmount": amount,
            "scaledAmount": scaled,
            "unit": unit,
        })

    return {
        "prepId": prep["id"],
        "prepName": prep.get("nameEn", ""),
        "prepNameZh": prep.get("nameZh", ""),
        "multiplier": req.multiplier,
        "ingredients": scaled_ingredients,
        "totalVolume": {"ml": _round2(total_ml), "g": _round2(total_g)},
        "yield": prep.get("yield", ""),
        "notes": f"以 {req.multiplier} 倍批次製作「{prep.get('nameZh', '')}」。",
    }
