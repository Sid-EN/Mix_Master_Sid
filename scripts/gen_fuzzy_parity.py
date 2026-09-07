#!/usr/bin/env python3
"""
產生前後端容錯搜尋的對照基準。

後端 backend/engine/fuzzy.py 與前端 lib/fuzzy.ts 是同一套規則的兩份實作
（靜態版沒有後端可呼叫）。兩邊都對照同一份基準檔，任一側改動而另一側
沒跟上時，測試就會失敗。

基準值由後端產生，因此後端的測試是「行為不得無意間改變」的鎖，
前端的測試才是真正的兩側一致性檢查。修改規則時請重跑此腳本並檢視差異。

用法：python scripts/gen_fuzzy_parity.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.engine.fuzzy import (  # noqa: E402
    Candidate,
    bounded_levenshtein,
    max_typos,
    normalise,
    query_terms,
    tokenise,
)

FIELDS_CASES = [
    {"name": ["Classic Daiquiri", "經典黛綺麗"], "tag": ["classic", "sour", "rum"],
     "ingredient": ["bacardi-rum", "fresh-lime-juice", "simple-syrup"],
     "description": ["The perfect rum Sour."]},
    {"name": ["Negroni"], "tag": ["classic", "bitter"],
     "ingredient": ["gin", "campari", "sweet-vermouth"],
     "description": ["Italian aperitivo."]},
    {"name": ["Mezcal Negroni"], "tag": ["modern"],
     "ingredient": ["mezcal", "campari"], "description": ["Smoky twist."]},
    {"name": ["Old Fashioned", "古典雞尾酒"], "tag": ["classic", "spirit-forward"],
     "ingredient": ["bourbon", "sugar", "angostura"],
     "description": ["The original cocktail."]},
    {"name": ["Whiskey Sour"], "tag": ["sour"],
     "ingredient": ["bourbon", "lemon-juice"], "description": ["Egg white optional."]},
    {"name": ["Gin & Tonic"], "tag": ["highball"],
     "ingredient": ["gin", "tonic-water"], "description": ["Long and refreshing."]},
]

QUERIES = [
    "daiquiri", "daquiri", "negroni", "negrone", "old fashioned", "fashioned old",
    "whisky sour", "gin", "sin", "rum", "黛綺麗", "古典", "lime juice", "zzzz", "",
    "!!!", "GIN  Tonic", "campari",
]

DISTANCES = [
    ("daiquiri", "daiquiri", 5), ("daiquiri", "daquiri", 5), ("negroni", "negrone", 5),
    ("mojito", "mojtio", 5), ("", "abc", 5), ("daiquiri", "manhattan", 2),
    ("gin", "gin", 0), ("gin", "sin", 0), ("abc", "", 5), ("kitten", "sitting", 5),
]

TYPO_TERMS = ["a", "gin", "rum", "sour", "negroni", "daiquiri", "黛綺麗"]

TOKENISE_CASES = ["Gin & Tonic!", "經典黛綺麗", "  Old   Fashioned \n", "a_b-c", ""]


def build() -> dict:
    scores = []
    for q in QUERIES:
        terms, phrase = query_terms(q), normalise(q)
        for index, fields in enumerate(FIELDS_CASES):
            scores.append({
                "query": q,
                "candidate": index,
                "score": round(Candidate(fields).score(terms, phrase), 10),
            })
    return {
        "_generated_by": "scripts/gen_fuzzy_parity.py",
        "candidates": FIELDS_CASES,
        "distances": [
            {"a": a, "b": b, "limit": lim, "expected": bounded_levenshtein(a, b, lim)}
            for a, b, lim in DISTANCES
        ],
        "maxTypos": [{"term": t, "expected": max_typos(t)} for t in TYPO_TERMS],
        "tokenise": [
            {"text": t, "normalised": normalise(t), "tokens": tokenise(t)}
            for t in TOKENISE_CASES
        ],
        "scores": scores,
    }


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, "tests", "fixtures", "fuzzy_parity.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(build(), f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"已寫入 {out}")


if __name__ == "__main__":
    main()
