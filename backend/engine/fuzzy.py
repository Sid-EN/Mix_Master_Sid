"""
fuzzy.py — 容錯搜尋的比對與排序

原本的搜尋是單純的子字串比對：打錯一個字母就完全沒有結果，
且回傳順序等同於資料檔的順序，名稱完全命中的項目可能排在
只有描述提到關鍵字的項目後面。

此模組提供兩件事：
1. 容錯比對——依詞長允許 0～2 個編輯距離，讓 "daquiri" 仍能找到 Daiquiri。
2. 相關性排序——命中欄位（名稱／標籤／材料／描述）與命中方式
   （完全相同／前綴／包含／模糊）各有權重，分數高者在前。

中日文沒有空白分詞，但這裡的比對同時涵蓋「整串子字串」與
「以編輯距離比對」，對 CJK 查詢一樣有效。
"""
from __future__ import annotations

import re

# 各欄位的權重：名稱命中遠比描述命中有意義
FIELD_WEIGHTS: dict[str, float] = {
    "name": 1.0,
    "tag": 0.6,
    "ingredient": 0.5,
    "description": 0.3,
}

# 命中方式的權重
EXACT = 1.0        # 與某個詞完全相同
PREFIX = 0.85      # 是某個詞的開頭
CONTAINS = 0.7     # 出現在欄位文字中的任何位置
FUZZY_BASE = 0.5   # 允許錯字後才命中
PHRASE_BONUS = 0.5 # 整串查詢原樣出現時的額外加權

_TOKEN_RE = re.compile(r"[^\W_]+", re.UNICODE)


def normalise(text: str) -> str:
    """統一大小寫並壓縮空白，讓比對不受輸入格式影響。"""
    return " ".join(text.lower().split())


def tokenise(text: str) -> list[str]:
    """切出可比對的詞；標點與底線一律視為分隔。"""
    return _TOKEN_RE.findall(normalise(text))


def max_typos(term: str) -> int:
    """
    允許的編輯距離上限。

    短詞放寬容錯會讓幾乎所有東西都命中（"gin" 與 "sin"、"tin" 距離皆為 1），
    因此三個字以下不容錯；長詞則允許較多錯字。
    """
    n = len(term)
    if n <= 3:
        return 0
    if n <= 6:
        return 1
    return 2


def bounded_levenshtein(a: str, b: str, limit: int) -> int:
    """
    編輯距離，超過 limit 即提前放棄並回傳 limit + 1。

    搜尋時只關心「是否夠接近」，算出精確的大距離沒有意義，
    提前中止可省下大量無謂計算。
    """
    if limit < 0:
        return 1
    if a == b:
        return 0
    if abs(len(a) - len(b)) > limit:
        return limit + 1
    if not a:
        return len(b) if len(b) <= limit else limit + 1
    if not b:
        return len(a) if len(a) <= limit else limit + 1

    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        current = [i]
        best_in_row = i
        for j, cb in enumerate(b, start=1):
            cost = 0 if ca == cb else 1
            value = min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
            current.append(value)
            best_in_row = min(best_in_row, value)
        if best_in_row > limit:
            return limit + 1
        previous = current
    return previous[-1] if previous[-1] <= limit else limit + 1


def term_match(term: str, field_text: str, field_tokens: list[str]) -> float:
    """單一查詢詞對單一欄位的命中強度，0 表示沒命中。"""
    if not term or not field_text:
        return 0.0
    if term in field_tokens:
        return EXACT
    if any(tok.startswith(term) for tok in field_tokens):
        return PREFIX
    if term in field_text:
        return CONTAINS

    limit = max_typos(term)
    if limit == 0:
        return 0.0
    best = 0.0
    for tok in field_tokens:
        distance = bounded_levenshtein(term, tok, limit)
        if distance <= limit:
            # 錯得越少分數越高，但一律低於「確實包含」
            best = max(best, FUZZY_BASE * (1 - distance / (limit + 1)))
    return best


class Candidate:
    """把一筆資料預先整理成可重複比對的欄位，避免每個查詢詞重算。"""

    __slots__ = ("fields",)

    def __init__(self, fields: dict[str, list[str]]):
        # fields: {欄位名稱: [該欄位的多段文字]}
        self.fields: dict[str, tuple[str, list[str]]] = {}
        for name, chunks in fields.items():
            text = normalise(" ".join(c for c in chunks if c))
            self.fields[name] = (text, tokenise(text))

    def score(self, terms: list[str], phrase: str = "") -> float:
        """
        相關性分數。

        所有查詢詞都必須命中某個欄位（AND 語意），否則視為不相關——
        多打一個詞卻得到更多結果會讓搜尋難以收斂。
        整串查詢若原樣出現在某欄位，額外加權，讓片語命中排在前面。
        """
        if not terms:
            return 0.0
        total = 0.0
        for term in terms:
            best = 0.0
            for name, (text, tokens) in self.fields.items():
                weight = FIELD_WEIGHTS.get(name, 0.3)
                best = max(best, weight * term_match(term, text, tokens))
            if best == 0.0:
                return 0.0
            total += best
        score = total / len(terms)

        if phrase and len(terms) > 1:
            for name, (text, _tokens) in self.fields.items():
                if phrase in text:
                    score *= 1 + PHRASE_BONUS * FIELD_WEIGHTS.get(name, 0.3)
                    break
        return score


def query_terms(q: str) -> list[str]:
    """把查詢字串切成可比對的詞。"""
    return tokenise(q)
