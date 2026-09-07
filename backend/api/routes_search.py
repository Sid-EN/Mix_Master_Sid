"""routes_search.py — 跨庫統一搜尋路由 (Unified Search Routes)"""
from functools import lru_cache

from fastapi import APIRouter, Query

from ..data_store import cocktails as _load_cocktails
from ..data_store import on_reload
from ..data_store import preps as _load_prep
from ..engine.fuzzy import Candidate, normalise, query_terms

router = APIRouter(prefix="/search", tags=["Search 🔍"])


def _cocktail_fields(r: dict) -> dict[str, list[str]]:
    """搜尋時各欄位分開計分，名稱命中要比描述命中重要。"""
    return {
        "name": [r.get("nameEn", ""), r.get("nameZh", "")],
        "tag": list(r.get("tags", [])),
        "ingredient": [
            part
            for ing in r.get("ingredients", [])
            for part in (ing.get("slug", ""), ing.get("name", ""), ing.get("nameEn", ""))
        ],
        "description": [
            r.get("description", ""),
            r.get("descriptionZh", ""),
            r.get("origin", ""),
        ],
    }


def _prep_fields(r: dict) -> dict[str, list[str]]:
    return {
        "name": [r.get("nameEn", ""), r.get("nameZh", "")],
        "tag": list(r.get("tags", [])) + list(r.get("hashtags", [])),
        "ingredient": [
            part
            for ing in r.get("ingredients", [])
            for part in (ing.get("name", ""), ing.get("nameEn", ""))
        ],
        "description": [r.get("description", ""), r.get("descriptionZh", "")],
    }


@lru_cache(maxsize=1)
def _cocktail_candidates() -> list[tuple[dict, Candidate]]:
    """
    先把資料整理成可比對的形式並快取。

    每次查詢都重新切詞會讓容錯搜尋明顯變慢；資料檔在執行期不會變動，
    重新載入資料時由 data_store.reload_all() 一併清掉此快取。
    """
    return [(r, Candidate(_cocktail_fields(r))) for r in _load_cocktails()]


@lru_cache(maxsize=1)
def _prep_candidates() -> list[tuple[dict, Candidate]]:
    return [(r, Candidate(_prep_fields(r))) for r in _load_prep()]


@on_reload
def reset_search_cache() -> None:
    """資料重新載入後必須呼叫，否則搜尋仍比對舊資料。"""
    _cocktail_candidates.cache_clear()
    _prep_candidates.cache_clear()


# ---------- endpoints ----------

@router.get("/tags", summary="所有標籤統計")
async def all_tags():
    counts: dict[str, int] = {}
    for r in _load_cocktails():
        for t in r.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    for r in _load_prep():
        for t in r.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    return {"tags": [{"tag": k, "count": v} for k, v in sorted(counts.items())]}


@router.get("/hashtags", summary="備料 Hashtag 列表")
async def all_hashtags():
    counts: dict[str, int] = {}
    for r in _load_prep():
        for h in r.get("hashtags", []):
            counts[h] = counts.get(h, 0) + 1
    return {"hashtags": [{"hashtag": k, "count": v} for k, v in sorted(counts.items())]}


@router.get("", summary="統一搜尋")
async def unified_search(
    q: str = Query(..., min_length=1, description="關鍵字"),
    type: str = Query("all", description="cocktail | prep | all"),
    method: str | None = Query(None, description="shake | stir | build（僅調酒）"),
    tags: str | None = Query(None, description="以逗號分隔的標籤"),
    fuzzy: bool = Query(True, description="是否允許錯字（關閉則只做精確子字串比對）"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    以相關性排序回傳結果。

    分數由命中欄位與命中方式決定（見 engine/fuzzy.py），
    名稱完全命中會排在只有描述提到關鍵字的項目之前。
    """
    terms = query_terms(q)
    phrase = normalise(q)
    tag_set = {t.strip() for t in tags.split(",") if t.strip()} if tags else set()
    scored: list[tuple[float, dict]] = []

    if not terms:
        return {"total": 0, "items": [], "query": q, "fuzzy": fuzzy}

    if type in ("all", "cocktail"):
        for r, candidate in _cocktail_candidates():
            if method and r.get("method") != method:
                continue
            if tag_set and not tag_set.intersection(r.get("tags", [])):
                continue
            score = candidate.score(terms, phrase)
            exact = _is_exact(candidate, phrase)
            if score > 0 and (fuzzy or exact):
                scored.append((score, {
                    "source": "cocktail", "score": round(score, 4), "exact": exact, **r,
                }))

    if type in ("all", "prep"):
        for r, candidate in _prep_candidates():
            if tag_set and not tag_set.intersection(r.get("tags", [])):
                continue
            score = candidate.score(terms, phrase)
            exact = _is_exact(candidate, phrase)
            if score > 0 and (fuzzy or exact):
                scored.append((score, {
                    "source": "prep", "score": round(score, 4), "exact": exact, **r,
                }))

    # 分數相同時，較短的名稱代表關鍵字占比更高（Negroni 勝過 Mezcal Negroni）；
    # 最後再以名稱排序，讓輸出穩定而非取決於資料檔順序。
    def _rank(pair: tuple[float, dict]) -> tuple[float, int, str]:
        name = pair[1].get("nameEn", "") or pair[1].get("nameZh", "")
        return (-pair[0], len(name), name)

    scored.sort(key=_rank)
    items = [item for _score, item in scored]
    return {
        "total": len(items),
        "items": items[offset : offset + limit],
        "query": q,
        "fuzzy": fuzzy,
    }


def _is_exact(candidate: Candidate, phrase: str) -> bool:
    """
    整串查詢是否原樣出現。

    兩個用途：fuzzy=false 時沿用舊的精確比對行為；
    以及讓前端能標示「這是容錯後才命中的相近結果」。
    """
    return any(phrase in text for text, _tokens in candidate.fields.values())
