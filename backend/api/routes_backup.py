"""
routes_backup.py — 使用者資料的匯出與匯入

供使用者自行保存備份、或在帳號之間搬移資料。
匯入會逐項驗證：僅接受白名單內的同步項目，配方則走與建立時相同的驗證，
避免此端點淪為任意資料的注入管道。
"""
import json
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models.db_models import User, UserData, UserRecipe
from .routes_recipes import UserRecipeIn, _validate
from .routes_sync import MAX_VALUE_BYTES, SYNCABLE_KEYS

router = APIRouter(prefix="/backup", tags=["Backup 💾"])

# 備份格式版本；日後格式若變更，可據此判斷是否需要轉換
BACKUP_VERSION = 1
MAX_IMPORT_BYTES = 2 * 1024 * 1024
MAX_IMPORT_RECIPES = 200


class BackupRecipe(BaseModel):
    slug: str | None = None
    data: dict


class BackupIn(BaseModel):
    version: int = Field(..., ge=1)
    data: dict = Field(default_factory=dict)
    recipes: list[dict] = Field(default_factory=list)


@router.get("/export", summary="匯出我的全部資料")
async def export_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(select(UserData).where(UserData.user_id == user.id)).all()
    recipes = db.scalars(select(UserRecipe).where(UserRecipe.user_id == user.id)).all()
    return {
        "version": BACKUP_VERSION,
        "exportedAt": datetime.now(UTC).isoformat(timespec="seconds"),
        "account": {"email": user.email, "displayName": user.display_name},
        "data": {r.key: r.value for r in rows},
        # 不含分享權杖：匯入他處後應由該帳號自行決定是否公開
        "recipes": [{"slug": r.slug, "data": r.data} for r in recipes],
    }


@router.post("/import", summary="由備份還原資料")
async def import_data(
    body: BackupIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    合併式還原：備份中的同步項目覆寫同名項目，配方則以新代號新增。

    刻意不刪除備份中沒有的既有資料——匯入應是增添而非抹除，
    否則誤匯入舊備份會靜默清空使用者現有的內容。
    """
    if body.version > BACKUP_VERSION:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"備份格式版本 {body.version} 高於本系統支援的 {BACKUP_VERSION}",
        )
    if len(json.dumps(body.model_dump(), ensure_ascii=False).encode()) > MAX_IMPORT_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="備份檔超過大小上限")
    if len(body.recipes) > MAX_IMPORT_RECIPES:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"配方數超過上限（{MAX_IMPORT_RECIPES}）")

    imported_keys: list[str] = []
    skipped_keys: list[str] = []
    for key, value in (body.data or {}).items():
        if key not in SYNCABLE_KEYS:
            skipped_keys.append(key)          # 白名單之外一律略過
            continue
        if not isinstance(value, dict | list):
            skipped_keys.append(key)
            continue
        if len(json.dumps(value, ensure_ascii=False).encode()) > MAX_VALUE_BYTES:
            skipped_keys.append(key)
            continue

        row = db.scalar(
            select(UserData).where(UserData.user_id == user.id, UserData.key == key)
        )
        if row is None:
            db.add(UserData(user_id=user.id, key=key, value=value))
        else:
            row.value = value
        imported_keys.append(key)

    # slug 為全域唯一，因此需比對所有配方而非僅本人的——
    # 否則匯入他人備份時會撞上對方既有的代號
    existing = set(db.scalars(select(UserRecipe.slug)).all())
    imported_recipes = 0
    skipped_recipes: list[str] = []
    for entry in body.recipes or []:
        raw = entry.get("data") if isinstance(entry, dict) else None
        if not isinstance(raw, dict):
            skipped_recipes.append(str(entry)[:40])
            continue
        try:
            # 走與建立配方相同的驗證，確保材料與手法皆有效
            payload = _validate(UserRecipeIn.model_validate({
                "nameZh": raw.get("nameZh", ""),
                "nameEn": raw.get("nameEn", ""),
                "method": raw.get("method", "build"),
                "glassType": raw.get("glassType", "rocks_glass"),
                "ingredients": raw.get("ingredients", []),
                "steps": raw.get("steps", []),
                "garnish": raw.get("garnish", ""),
                "descriptionZh": raw.get("descriptionZh", ""),
                "tags": raw.get("tags", []),
            }))
        except (HTTPException, ValueError):
            skipped_recipes.append(str(raw.get("nameZh", ""))[:40])
            continue

        slug = entry.get("slug") or ""
        if not slug or slug in existing:
            # 代號已被占用時另取新代號，避免覆寫既有配方
            slug = f"user-{uuid.uuid4().hex[:10]}"
        existing.add(slug)
        db.add(UserRecipe(slug=slug, user_id=user.id, data=payload))
        imported_recipes += 1

    db.commit()
    return {
        "importedKeys": imported_keys,
        "skippedKeys": skipped_keys,
        "importedRecipes": imported_recipes,
        "skippedRecipes": skipped_recipes,
    }
