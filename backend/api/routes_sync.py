"""
routes_sync.py — 使用者個人資料的跨裝置同步

對應前端原本存於 localStorage 的資料。theme 與 locale 屬單一裝置的顯示
偏好，刻意不納入同步。
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models.db_models import User, UserData

router = APIRouter(prefix="/sync", tags=["Sync ☁️"])

# 允許同步的鍵；以白名單限制，避免成為任意資料的儲存空間
SYNCABLE_KEYS = {
    "favorites",     # 收藏、評分與品飲筆記
    "my-bar",        # 我的酒櫃庫存
    "progress",      # 學習進度與經驗值
    "flavor-pref",   # 風味偏好
    "quiz-history",  # 測驗紀錄
    "personality",   # 調酒人格測驗結果
}

# 單筆資料上限，避免異常負載塞爆資料庫
MAX_VALUE_BYTES = 256 * 1024


class DataIn(BaseModel):
    value: dict | list = Field(...)


class DataOut(BaseModel):
    key: str
    value: dict | list
    updated_at: str = Field(..., alias="updatedAt")

    model_config = {"populate_by_name": True}


def _check_key(key: str) -> None:
    if key not in SYNCABLE_KEYS:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"不支援同步的項目：{key}（可用：{'、'.join(sorted(SYNCABLE_KEYS))}）",
        )


def _check_size(value: dict | list) -> None:
    import json
    if len(json.dumps(value, ensure_ascii=False).encode()) > MAX_VALUE_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"資料超過上限（{MAX_VALUE_BYTES // 1024} KB）",
        )


@router.get("", summary="取得全部同步資料")
async def get_all(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(UserData).where(UserData.user_id == user.id)).all()
    return {r.key: r.value for r in rows}


@router.get("/{key}", response_model=DataOut, summary="取得單項同步資料")
async def get_one(key: str, user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    _check_key(key)
    row = db.scalar(
        select(UserData).where(UserData.user_id == user.id, UserData.key == key)
    )
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"尚無資料：{key}")
    return DataOut(key=row.key, value=row.value, updatedAt=row.updated_at.isoformat())


@router.put("/{key}", response_model=DataOut, summary="寫入單項同步資料")
async def put_one(key: str, body: DataIn, user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    _check_key(key)
    _check_size(body.value)
    row = db.scalar(
        select(UserData).where(UserData.user_id == user.id, UserData.key == key)
    )
    if row is None:
        row = UserData(user_id=user.id, key=key, value=body.value)
        db.add(row)
    else:
        row.value = body.value
    db.commit()
    db.refresh(row)
    return DataOut(key=row.key, value=row.value, updatedAt=row.updated_at.isoformat())


@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT, summary="刪除單項同步資料")
async def delete_one(key: str, user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    _check_key(key)
    row = db.scalar(
        select(UserData).where(UserData.user_id == user.id, UserData.key == key)
    )
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"尚無資料：{key}")
    db.delete(row)
    db.commit()
    return None
