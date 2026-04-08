"""routes_academy.py — 調酒學院內容路由"""
from fastapi import APIRouter

router = APIRouter(prefix="/academy", tags=["Academy 🎓"])

CURRICULUM = {
    "levels": [
        {"level": 1, "name": "入門調酒師 Novice",     "weeks": "1-2",   "unlockRequirement": None},
        {"level": 2, "name": "見習學員 Apprentice",    "weeks": "3-4",   "unlockRequirement": "完成 Lv.1 × 5 課"},
        {"level": 3, "name": "熟練調酒師 Journeyman",  "weeks": "5-8",   "unlockRequirement": "完成 Lv.2 × 8 課"},
        {"level": 4, "name": "創意設計師 Creator",     "weeks": "2-3月",  "unlockRequirement": "完成 Lv.3 × 10 課"},
        {"level": 5, "name": "大師工匠 Master",        "weeks": "3-6月",  "unlockRequirement": "完成 Lv.4 + 引擎評分 A"},
    ],
    "modules": [
        {"id": "tools-techniques", "nameZh": "器材與手法", "articleCount": 8},
        {"id": "wine-encyclopedia", "nameZh": "葡萄酒百科", "articleCount": 7},
        {"id": "spirits-encyclopedia", "nameZh": "烈酒百科", "articleCount": 10},
    ]
}


@router.get("/curriculum", summary="取得課程結構")
async def get_curriculum():
    return CURRICULUM


@router.get("/articles", summary="文章列表")
async def list_articles():
    return {"message": "Phase 1 MDX 內容由前端 Next.js 直接讀取，此端點為 Phase 2 預留"}
