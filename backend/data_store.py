"""
data_store.py — 資料檔集中載入與快取

先前每個路由模組各自實作載入函式，且每次請求都重新讀檔與解析 JSON；
/search 單次請求就會讀檔 5 次。實測解析成本佔 p50 延遲的 77%，
吞吐量硬卡在約 557 req/s。

資料檔為唯讀資產，僅在啟動時載入一次即可。

注意：以下函式回傳的是共用物件，呼叫端必須視為唯讀；若需修改請自行複製，
否則會污染快取。修改資料檔後請呼叫 reload_all()。
"""
import json
import os
from functools import lru_cache

_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def _path(filename: str) -> str:
    return os.path.join(_DATA_DIR, filename)


def _read(filename: str):
    with open(_path(filename), encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def cocktails() -> list[dict]:
    """經典調酒配方（唯讀）。"""
    return _read("classic_recipes.json")


@lru_cache(maxsize=1)
def preps() -> list[dict]:
    """備料配方（唯讀）。"""
    return _read("prep_recipes.json")


@lru_cache(maxsize=1)
def ingredients() -> list[dict]:
    """材料目錄（唯讀）。"""
    return _read("ingredients.json")


@lru_cache(maxsize=1)
def ingredient_index() -> dict[str, dict]:
    """以 id 為鍵的材料索引（唯讀）。"""
    return {i["id"]: i for i in ingredients()}


@lru_cache(maxsize=1)
def wine_knowledge() -> dict:
    """葡萄酒知識庫（唯讀）。"""
    return _read("wine_knowledge.json")


@lru_cache(maxsize=1)
def spirits_knowledge() -> dict | None:
    """烈酒知識庫（唯讀）；檔案不存在時回傳 None。"""
    if not os.path.exists(_path("spirits_knowledge.json")):
        return None
    return _read("spirits_knowledge.json")


@lru_cache(maxsize=1)
def flavor_wheel() -> dict:
    """風味輪資料（唯讀）。"""
    return _read("flavor_wheel.json")


def reload_all() -> None:
    """清除所有快取，強制下次存取時重新讀檔（測試與開發時使用）。"""
    for fn in (cocktails, preps, ingredients, ingredient_index,
               wine_knowledge, spirits_knowledge, flavor_wheel):
        fn.cache_clear()
