"""
user_recipes.py — 使用者自建配方的儲存層

配方資料模型早已預留 type="user"，但一直沒有建立途徑。
在導入資料庫之前，先以 JSON 檔案儲存，與現有資料層一致。

寫入以行程內鎖序列化，並採「先寫暫存檔再原子性替換」，
避免寫入過程中程序中斷導致檔案毀損。
"""
import json
import os
import tempfile
import threading
import uuid
from datetime import UTC, datetime

_DEFAULT_PATH = os.path.join(os.path.dirname(__file__), "data", "user_recipes.json")
_lock = threading.Lock()


def store_path() -> str:
    """儲存檔位置；測試以環境變數指向暫存檔，避免污染實際資料。"""
    return os.environ.get("MIXMASTER_USER_RECIPES", _DEFAULT_PATH)


def load() -> list[dict]:
    path = store_path()
    if not os.path.exists(path):
        return []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        # 檔案毀損時不應讓整個 API 崩潰
        return []


def _write(recipes: list[dict]) -> None:
    path = store_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(recipes, f, ensure_ascii=False, indent=2)
        os.replace(tmp, path)   # 原子性替換
    except Exception:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise


def _now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def create(payload: dict) -> dict:
    """新增一筆使用者配方，回傳建立後的完整內容。"""
    with _lock:
        recipes = load()
        slug = payload.get("slug") or f"user-{uuid.uuid4().hex[:10]}"
        if any(r["id"] == slug for r in recipes):
            raise ValueError(f"配方代號已存在：{slug}")
        recipe = {
            **payload,
            "id": slug,
            "slug": slug,
            "type": "user",
            "createdAt": _now(),
            "updatedAt": _now(),
        }
        recipes.append(recipe)
        _write(recipes)
        return recipe


def get(recipe_id: str) -> dict | None:
    return next((r for r in load() if r["id"] == recipe_id), None)


def update(recipe_id: str, payload: dict) -> dict | None:
    with _lock:
        recipes = load()
        for i, r in enumerate(recipes):
            if r["id"] == recipe_id:
                merged = {
                    **r,
                    **payload,
                    "id": r["id"],          # 代號與型別不可經由更新變更
                    "slug": r["slug"],
                    "type": "user",
                    "createdAt": r.get("createdAt", _now()),
                    "updatedAt": _now(),
                }
                recipes[i] = merged
                _write(recipes)
                return merged
        return None


def delete(recipe_id: str) -> bool:
    with _lock:
        recipes = load()
        remaining = [r for r in recipes if r["id"] != recipe_id]
        if len(remaining) == len(recipes):
            return False
        _write(remaining)
        return True
