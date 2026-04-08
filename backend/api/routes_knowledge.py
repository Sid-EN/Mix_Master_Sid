"""routes_knowledge.py — 知識庫 API 路由 (Knowledge Base Routes)"""
import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/knowledge", tags=["Knowledge 📚"])

_WINE_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "wine_knowledge.json")
_SPIRITS_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "spirits_knowledge.json")


def _load_wine() -> dict:
    with open(_WINE_DATA, encoding="utf-8") as f:
        return json.load(f)


def _load_spirits() -> dict | None:
    if os.path.exists(_SPIRITS_DATA):
        with open(_SPIRITS_DATA, encoding="utf-8") as f:
            return json.load(f)
    return None


# ── Wine Knowledge ──────────────────────────────────────────

@router.get("/wine", summary="葡萄酒知識全集")
async def get_wine_knowledge():
    """取得完整的葡萄酒知識庫（釀造、品種、產區、橡木桶、品飲、餐搭、年份）"""
    return _load_wine()


@router.get("/wine/{section}", summary="葡萄酒知識單一章節")
async def get_wine_section(section: str):
    """取得特定章節，可用: winemaking, grapeVarieties, regions, barrels, tasting, foodPairing, vintageGuide, spiritProduction, advancedWinemaking"""
    data = _load_wine()
    if section not in data:
        raise HTTPException(404, detail=f"找不到章節：{section}。可用章節：{', '.join(data.keys())}")
    return {section: data[section]}


# ── Spirits Knowledge ───────────────────────────────────────

@router.get("/spirits", summary="烈酒知識全集")
async def get_spirits_knowledge():
    """取得完整的烈酒知識庫"""
    data = _load_spirits()
    if data is None:
        # Fallback: use spiritProduction section from wine_knowledge.json
        wine = _load_wine()
        fallback = {}
        if "spiritProduction" in wine:
            fallback["spiritProduction"] = wine["spiritProduction"]
        if fallback:
            return fallback
        raise HTTPException(404, detail="烈酒知識庫尚未建立")
    return data


@router.get("/spirits/{section}", summary="烈酒知識單一章節")
async def get_spirits_section(section: str):
    """取得特定烈酒章節"""
    data = _load_spirits()
    if data is None:
        # Fallback
        wine = _load_wine()
        if section == "spiritProduction" and section in wine:
            return {section: wine[section]}
        raise HTTPException(404, detail="烈酒知識庫尚未建立")
    if section not in data:
        raise HTTPException(404, detail=f"找不到章節：{section}。可用章節：{', '.join(data.keys())}")
    return {section: data[section]}
