"""共用 fixture：資料檔與 API client。"""
import json
import os
import sys

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

DATA_DIR = os.path.join(ROOT, "backend", "data")


def _load(name):
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="session")
def ingredients():
    return _load("ingredients.json")


@pytest.fixture(scope="session")
def ingredient_index(ingredients):
    return {i["id"]: i for i in ingredients}


@pytest.fixture(scope="session")
def recipes():
    return _load("classic_recipes.json")


@pytest.fixture(scope="session")
def preps():
    return _load("prep_recipes.json")


@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient；整個測試 session 共用一個應用實例。"""
    from fastapi.testclient import TestClient
    from backend.main import app
    with TestClient(app) as c:
        yield c
