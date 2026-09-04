"""
routes_push.py — 網頁推播訂閱與發送

採 Web Push 協定搭配 VAPID，直接送至瀏覽器廠商的推送服務，
不需 FCM 之類的外部帳號。未設定 VAPID 金鑰時整組功能自動停用。
"""
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pywebpush import WebPushException, webpush
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import get_settings
from ..db import get_db
from ..models.db_models import PushSubscription, User

router = APIRouter(prefix="/push", tags=["Push 🔔"])
logger = logging.getLogger("mixmaster.push")
settings = get_settings()


class SubscriptionKeys(BaseModel):
    p256dh: str = Field(..., max_length=255)
    auth: str = Field(..., max_length=255)


class SubscriptionIn(BaseModel):
    endpoint: str = Field(..., max_length=2048)
    keys: SubscriptionKeys


class NotificationIn(BaseModel):
    title: str = Field("MixMaster", max_length=100)
    body: str = Field(..., min_length=1, max_length=300)
    url: str = Field("/", max_length=500)


def _require_configured() -> None:
    if not (settings.vapid_public_key and settings.vapid_private_key):
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="伺服器尚未設定推播金鑰（VAPID_PUBLIC_KEY／VAPID_PRIVATE_KEY）",
        )


@router.get("/public-key", summary="取得推播公鑰")
async def public_key():
    """前端訂閱時需要此公鑰；未設定時回報停用而非假裝可用。"""
    if not settings.vapid_public_key:
        return {"enabled": False, "publicKey": None}
    return {"enabled": True, "publicKey": settings.vapid_public_key}


@router.post("/subscribe", status_code=status.HTTP_201_CREATED, summary="登錄推播訂閱")
async def subscribe(
    body: SubscriptionIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_configured()
    row = db.scalar(
        select(PushSubscription).where(PushSubscription.endpoint == body.endpoint)
    )
    if row is None:
        db.add(PushSubscription(
            user_id=user.id,
            endpoint=body.endpoint,
            p256dh=body.keys.p256dh,
            auth=body.keys.auth,
        ))
    else:
        # 同一 endpoint 可能因換帳號登入而改屬他人，一併更新金鑰
        row.user_id = user.id
        row.p256dh = body.keys.p256dh
        row.auth = body.keys.auth
    db.commit()
    return {"subscribed": True}


@router.delete("/subscribe", status_code=status.HTTP_204_NO_CONTENT, summary="取消推播訂閱")
async def unsubscribe(
    endpoint: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.scalar(
        select(PushSubscription).where(
            PushSubscription.endpoint == endpoint, PushSubscription.user_id == user.id
        )
    )
    if row is None:
        raise HTTPException(404, detail="找不到此訂閱")
    db.delete(row)
    db.commit()
    return None


def send_to_user(db: Session, user: User, payload: dict) -> dict:
    """
    對使用者的所有裝置發送推播。

    訂閱可能已失效（使用者清除瀏覽器資料、或撤銷權限），
    推送服務回報 404／410 時代表該訂閱已不存在，應一併清除以免持續重試。
    """
    rows = db.scalars(
        select(PushSubscription).where(PushSubscription.user_id == user.id)
    ).all()
    sent, removed = 0, 0
    for row in rows:
        try:
            webpush(
                subscription_info={
                    "endpoint": row.endpoint,
                    "keys": {"p256dh": row.p256dh, "auth": row.auth},
                },
                data=json.dumps(payload, ensure_ascii=False),
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": settings.vapid_subject},
                timeout=10,
            )
            sent += 1
        except WebPushException as e:
            code = getattr(e.response, "status_code", None)
            if code in (404, 410):
                db.delete(row)
                removed += 1
            else:
                logger.warning("推播發送失敗（%s）：%s", code, e)
    if removed:
        db.commit()
    return {"sent": sent, "removed": removed, "total": len(rows)}


@router.post("/test", summary="對自己發送測試推播")
async def send_test(
    body: NotificationIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_configured()
    result = send_to_user(db, user, {
        "title": body.title,
        "body": body.body,
        "url": body.url,
    })
    if result["total"] == 0:
        raise HTTPException(404, detail="此帳號尚無任何推播訂閱")
    return result
