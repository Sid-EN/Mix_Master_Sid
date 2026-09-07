"""
routes_discover.py — 公開配方目錄與追蹤創作者

公開目錄（is_public）與既有的權杖分享（share_token）是兩件不同的事：
權杖分享是「知道網址的人看得到」，公開目錄是「所有人都找得到」。
兩者分開，才不會有人以為只是傳給朋友、卻被整站列出。

作者資訊一律只回傳顯示名稱與 id，絕不含電子郵件——
公開目錄與追蹤名單都是任何人都能取得的資料。
"""
import secrets
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import get_current_user, oauth2_scheme, optional_user
from ..db import get_db
from ..models.db_models import Follow, RecipeRating, User, UserRecipe

router = APIRouter(prefix="/discover", tags=["Discover 🌍"])

SORT_OPTIONS = {"recent", "rating", "name"}


def _author(user: User | None) -> dict:
    """作者的公開身分。刻意不含 email——這是任何人都取得到的資料。"""
    if user is None:
        return {"id": None, "displayName": "（已停用的帳號）"}
    return {"id": user.id, "displayName": user.display_name or f"使用者 {user.id}"}


def _public_recipe(row: UserRecipe, rating: tuple[float | None, int]) -> dict:
    average, count = rating
    return {
        "id": row.slug,
        "slug": row.slug,
        "type": "user",
        "nameZh": row.data.get("nameZh", ""),
        "nameEn": row.data.get("nameEn", ""),
        "method": row.data.get("method", ""),
        "glassType": row.data.get("glassType", ""),
        "balanceScore": row.data.get("balanceScore"),
        "grade": row.data.get("grade"),
        "tags": row.data.get("tags", []),
        "author": _author(row.user),
        "rating": {"average": round(average, 2) if average is not None else None,
                   "count": count},
        "shareToken": row.share_token,
        "publishedAt": row.published_at.isoformat() if row.published_at else None,
    }


def _ratings_for(db: Session, recipe_ids: list[int]) -> dict[int, tuple[float | None, int]]:
    """
    一次取得多筆配方的評分統計。

    逐筆查詢會讓 20 筆列表送出 20 次查詢；目錄是最常被瀏覽的頁面，
    這裡的差別很明顯。
    """
    if not recipe_ids:
        return {}
    rows = db.execute(
        select(RecipeRating.recipe_id, func.avg(RecipeRating.score), func.count())
        .where(RecipeRating.recipe_id.in_(recipe_ids))
        .group_by(RecipeRating.recipe_id)
    ).all()
    stats = {rid: (float(avg) if avg is not None else None, int(cnt)) for rid, avg, cnt in rows}
    return {rid: stats.get(rid, (None, 0)) for rid in recipe_ids}


@router.get("/recipes", summary="公開配方目錄")
async def public_recipes(
    sort: str = Query("recent", description="recent | rating | name"),
    author: int | None = Query(None, description="只看某位作者的公開配方"),
    q: str | None = Query(None, max_length=80, description="以名稱篩選"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """任何人皆可瀏覽，不需登入。"""
    if sort not in SORT_OPTIONS:
        raise HTTPException(422, detail=f"排序方式須為 {'、'.join(sorted(SORT_OPTIONS))}")

    stmt = select(UserRecipe).where(UserRecipe.is_public.is_(True))
    if author is not None:
        stmt = stmt.where(UserRecipe.user_id == author)
    if q:
        # JSONB 欄位以文字比對即可；資料量在目錄的規模下不需要額外索引
        pattern = f"%{q.lower()}%"
        stmt = stmt.where(
            func.lower(UserRecipe.data["nameZh"].astext).like(pattern)
            | func.lower(UserRecipe.data["nameEn"].astext).like(pattern)
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    if sort == "name":
        stmt = stmt.order_by(UserRecipe.data["nameZh"].astext)
    else:
        # rating 需要統計值，於取回後再排；此處先以發布時間取一個穩定的順序
        stmt = stmt.order_by(UserRecipe.published_at.desc().nullslast(), UserRecipe.id.desc())

    rows = list(db.scalars(stmt.offset(offset).limit(limit)))
    ratings = _ratings_for(db, [r.id for r in rows])
    items = [_public_recipe(r, ratings[r.id]) for r in rows]

    if sort == "rating":
        # 無人評分者排在最後，而不是被當成 0 分——兩者意義完全不同
        items.sort(key=lambda i: (i["rating"]["average"] is None,
                                  -(i["rating"]["average"] or 0),
                                  -i["rating"]["count"]))

    return {"total": total, "items": items, "sort": sort}


@router.post("/recipes/{slug}/publish", summary="發布至公開目錄")
async def publish_recipe(
    slug: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    發布為公開。

    一併產生分享權杖：目錄上的配方必須有可開啟的網址，
    否則使用者會看到列表卻點不進去。
    """
    row = db.scalar(select(UserRecipe).where(UserRecipe.slug == slug))
    if row is None or row.user_id != user.id:
        raise HTTPException(404, detail=f"找不到使用者配方：{slug}")

    if not row.is_public:
        row.is_public = True
        row.published_at = datetime.now(UTC)
    if row.share_token is None:
        row.share_token = secrets.token_urlsafe(24)
    db.commit()
    db.refresh(row)
    return {"slug": row.slug, "isPublic": True, "shareToken": row.share_token,
            "publishedAt": row.published_at.isoformat() if row.published_at else None}


@router.delete("/recipes/{slug}/publish", status_code=status.HTTP_204_NO_CONTENT,
               summary="自公開目錄下架")
async def unpublish_recipe(
    slug: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    下架。

    分享權杖保留：使用者要的是「不要再被所有人找到」，
    未必是「讓已經傳出去的連結全部失效」。撤銷連結另有 /share 端點。
    """
    row = db.scalar(select(UserRecipe).where(UserRecipe.slug == slug))
    if row is None or row.user_id != user.id:
        raise HTTPException(404, detail=f"找不到使用者配方：{slug}")
    row.is_public = False
    row.published_at = None
    db.commit()


@router.get("/creators", summary="創作者列表")
async def creators(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """有公開配方的使用者；沒有公開作品的人不會出現在這裡。"""
    stmt = (
        select(User, func.count(UserRecipe.id).label("recipe_count"))
        .join(UserRecipe, UserRecipe.user_id == User.id)
        .where(UserRecipe.is_public.is_(True))
        .group_by(User.id)
        .order_by(func.count(UserRecipe.id).desc(), User.id)
    )
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.execute(stmt.offset(offset).limit(limit)).all()

    follower_counts: dict[int, int] = {}
    if rows:
        for followee_id, count in db.execute(
            select(Follow.followee_id, func.count())
            .where(Follow.followee_id.in_([u.id for u, _ in rows]))
            .group_by(Follow.followee_id)
        ).all():
            follower_counts[followee_id] = count

    return {
        "total": total,
        "items": [
            {**_author(user),
             "recipeCount": count,
             "followerCount": follower_counts.get(user.id, 0)}
            for user, count in rows
        ],
    }


@router.get("/creators/{user_id}", summary="創作者資訊")
async def creator(
    user_id: int,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    # 未登入也看得到公開資訊；登入後才多回傳「我是否已追蹤」
    viewer = optional_user(token, db)
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(404, detail="找不到此使用者")

    recipe_count = db.scalar(
        select(func.count()).select_from(UserRecipe)
        .where(UserRecipe.user_id == user_id, UserRecipe.is_public.is_(True))
    ) or 0
    follower_count = db.scalar(
        select(func.count()).select_from(Follow).where(Follow.followee_id == user_id)
    ) or 0
    following = False
    if viewer is not None:
        following = db.scalar(
            select(func.count()).select_from(Follow)
            .where(Follow.follower_id == viewer.id, Follow.followee_id == user_id)
        ) == 1

    return {**_author(target), "recipeCount": recipe_count,
            "followerCount": follower_count, "isFollowing": following}


@router.post("/creators/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT,
             summary="追蹤創作者")
async def follow_creator(
    user_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id == user.id:
        raise HTTPException(422, detail="無法追蹤自己")
    if db.get(User, user_id) is None:
        raise HTTPException(404, detail="找不到此使用者")

    db.add(Follow(follower_id=user.id, followee_id=user_id))
    try:
        db.commit()
    except IntegrityError:
        # 唯一索引擋下重複追蹤；重複操作視為已完成，不算錯誤
        db.rollback()


@router.delete("/creators/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT,
               summary="取消追蹤")
async def unfollow_creator(
    user_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.scalar(
        select(Follow).where(Follow.follower_id == user.id, Follow.followee_id == user_id)
    )
    if row is not None:
        db.delete(row)
        db.commit()


@router.get("/following", summary="我追蹤的創作者")
async def following(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(User, Follow.created_at)
        .join(Follow, Follow.followee_id == User.id)
        .where(Follow.follower_id == user.id)
        .order_by(Follow.created_at.desc())
    ).all()
    return {
        "total": len(rows),
        "items": [
            {**_author(target), "followedAt": created.isoformat() if created else None}
            for target, created in rows
        ],
    }


@router.get("/feed", summary="追蹤對象的最新公開配方")
async def feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    只含追蹤對象的公開配方。

    沒有追蹤任何人時回傳空清單而非全站熱門——
    動態牆若混入沒追蹤的人，追蹤這個動作就失去意義。
    """
    followee_ids = list(db.scalars(
        select(Follow.followee_id).where(Follow.follower_id == user.id)
    ))
    if not followee_ids:
        return {"total": 0, "items": [], "followingCount": 0}

    stmt = (
        select(UserRecipe)
        .where(UserRecipe.is_public.is_(True), UserRecipe.user_id.in_(followee_ids))
        .order_by(UserRecipe.published_at.desc().nullslast(), UserRecipe.id.desc())
    )
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = list(db.scalars(stmt.offset(offset).limit(limit)))
    ratings = _ratings_for(db, [r.id for r in rows])
    return {
        "total": total,
        "items": [_public_recipe(r, ratings[r.id]) for r in rows],
        "followingCount": len(followee_ids),
    }
