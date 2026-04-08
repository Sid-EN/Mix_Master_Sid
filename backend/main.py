"""
main.py — MixMaster FastAPI 應用入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .api.routes_engine import router as engine_router
from .api.routes_recipes import router as recipes_router
from .api.routes_academy import router as academy_router
from .api.routes_prep import router as prep_router
from .api.routes_search import router as search_router
from .api.routes_batch import router as batch_router
from .api.routes_ingredients import router as ingredients_router
from .api.routes_knowledge import router as knowledge_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="🍹 MixMaster — 智慧風味平衡引擎 API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(engine_router,      prefix="/api/v1")
app.include_router(recipes_router,     prefix="/api/v1")
app.include_router(academy_router,     prefix="/api/v1")
app.include_router(prep_router,        prefix="/api/v1")
app.include_router(search_router,      prefix="/api/v1")
app.include_router(batch_router,       prefix="/api/v1")
app.include_router(ingredients_router, prefix="/api/v1")
app.include_router(knowledge_router,   prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "version": settings.app_version, "env": settings.environment}


@app.get("/", tags=["System"])
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "message": "歡迎來到 MixMaster API 🍹",
    }
