"""
routes_community.py — 已公開配方的評分與留言

互動對象限定為已公開分享的配方：未公開的配方屬私人內容，
不應讓他人評分或留言。因此一律以分享權杖定位配方。
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_user, oauth2_scheme
from ..db import get_db
from ..models.db_models import RecipeComment, RecipeRating, User, UserRecipe

router = APIRouter(prefix="/community", tags=["Community 💬"])

MAX_COMMENT_LENGTH = 1000


class RatingIn(BaseModel):
    score: int = Field(..., ge=1, le=5)


class CommentIn(BaseModel):
    body: str = Field(..., min_length=1, max_length=MAX_COMMENT_LENGTH)

    @field_validator("body")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        # min_length 只看字元數，全為空白者仍會通過，去除後將成為空留言
        stripped = v.strip()
        if not stripped:
            raise ValueError("留言內容不可為空白")
        return stripped


def _shared_recipe(db: Session, share_token: str) -> UserRecipe:
    """僅已公開分享的配方可被互動；撤銷分享後即無法再評分或留言。"""
    row = db.scalar(select(UserRecipe).where(UserRecipe.share_token == share_token))
    if row is None:
        raise HTTPException(404, detail="分享連結無效或已撤銷")
    return row


def _optional_user(token: str | None, db: Session) -> User | None:
    """取得目前使用者；未登入時回傳 None 而非拋出 401。"""
    if not token:
        return None
    try:
        from ..auth import decode_token
        user_id, version = decode_token(token)
    except HTTPException:
        return None
    user = db.get(User, user_id)
    if user is None or version != user.token_version:
        return None
    return user


@router.get("/{share_token}/ratings", summary="配方的評分彙總")
async def get_ratings(
    share_token: str,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    recipe = _shared_recipe(db, share_token)
    stats = db.execute(
        select(func.count(RecipeRating.id), func.avg(RecipeRating.score))
        .where(RecipeRating.recipe_id == recipe.id)
    ).one()
    count, average = stats[0], stats[1]

    mine = None
    user = _optional_user(token, db)
    if user is not None:
        row = db.scalar(
            select(RecipeRating).where(
                RecipeRating.recipe_id == recipe.id, RecipeRating.user_id == user.id
            )
        )
        mine = row.score if row else None

    return {
        "count": count or 0,
        "average": round(float(average), 2) if average is not None else None,
        "myScore": mine,
    }


@router.put("/{share_token}/ratings", summary="送出或更新我的評分")
async def rate(
    share_token: str,
    body: RatingIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = _shared_recipe(db, share_token)
    if recipe.user_id == user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="不可為自己的配方評分")

    row = db.scalar(
        select(RecipeRating).where(
            RecipeRating.recipe_id == recipe.id, RecipeRating.user_id == user.id
        )
    )
    if row is None:
        db.add(RecipeRating(recipe_id=recipe.id, user_id=user.id, score=body.score))
    else:
        row.score = body.score
    db.commit()
    return await get_ratings(share_token, None, db)


@router.delete("/{share_token}/ratings", status_code=status.HTTP_204_NO_CONTENT,
               summary="收回我的評分")
async def unrate(
    share_token: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = _shared_recipe(db, share_token)
    row = db.scalar(
        select(RecipeRating).where(
            RecipeRating.recipe_id == recipe.id, RecipeRating.user_id == user.id
        )
    )
    if row is None:
        raise HTTPException(404, detail="尚未評分")
    db.delete(row)
    db.commit()
    return None


@router.get("/{share_token}/comments", summary="配方的留言")
async def list_comments(
    share_token: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    recipe = _shared_recipe(db, share_token)
    total = db.scalar(
        select(func.count(RecipeComment.id)).where(RecipeComment.recipe_id == recipe.id)
    )
    rows = db.scalars(
        select(RecipeComment)
        .where(RecipeComment.recipe_id == recipe.id)
        .order_by(RecipeComment.created_at.desc())
        .offset(offset).limit(limit)
    ).all()
    return {
        "total": total or 0,
        "items": [
            {
                "id": c.id,
                "body": c.body,
                # 僅回傳顯示名稱，不外洩留言者的電子郵件
                "author": c.user.display_name or "使用者",
                "isAuthor": c.user_id == recipe.user_id,
                "createdAt": c.created_at.isoformat() if c.created_at else None,
            }
            for c in rows
        ],
    }


@router.post("/{share_token}/comments", status_code=status.HTTP_201_CREATED,
             summary="發表留言")
async def add_comment(
    share_token: str,
    body: CommentIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = _shared_recipe(db, share_token)
    comment = RecipeComment(recipe_id=recipe.id, user_id=user.id, body=body.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {
        "id": comment.id,
        "body": comment.body,
        "author": user.display_name or "使用者",
        "isAuthor": user.id == recipe.user_id,
        "createdAt": comment.created_at.isoformat() if comment.created_at else None,
    }


@router.delete("/{share_token}/comments/{comment_id}",
               status_code=status.HTTP_204_NO_CONTENT, summary="刪除留言")
async def delete_comment(
    share_token: str,
    comment_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = _shared_recipe(db, share_token)
    comment = db.scalar(
        select(RecipeComment).where(
            RecipeComment.id == comment_id, RecipeComment.recipe_id == recipe.id
        )
    )
    if comment is None:
        raise HTTPException(404, detail="找不到留言")
    # 留言者可刪自己的；配方擁有者可刪自己配方下的任一則
    if comment.user_id != user.id and recipe.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="無權刪除此留言")
    db.delete(comment)
    db.commit()
    return None
