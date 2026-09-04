"""
main.py — MixMaster FastAPI 應用入口
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from .api.routes_academy import router as academy_router
from .api.routes_auth import router as auth_router
from .api.routes_batch import router as batch_router
from .api.routes_community import router as community_router
from .api.routes_engine import router as engine_router
from .api.routes_ingredients import router as ingredients_router
from .api.routes_knowledge import router as knowledge_router
from .api.routes_prep import router as prep_router
from .api.routes_recipes import router as recipes_router
from .api.routes_search import router as search_router
from .api.routes_sync import router as sync_router
from .config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="🍹 MixMaster — 智慧風味平衡引擎 API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
# 瀏覽器規範禁止 allow_origins=["*"] 與 allow_credentials=True 併用——
# 兩者同時設定時憑證請求會被直接拒絕。萬用字元來源時關閉 credentials，
# 明列來源時才啟用。
_wildcard_origins = "*" in settings.allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=not _wildcard_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 速率限制
# config.py 早已定義限制值卻從未套用；此處接上 slowapi。
# 以 RATE_LIMIT_ENABLED=false 關閉（開發與自動化測試使用），
# 否則固定次數的測試會因限流而隨機失敗。
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.rate_limit_default],
    enabled=settings.rate_limit_enabled,
    headers_enabled=True,   # 回傳 X-RateLimit-* 供客戶端自行節流
)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": f"請求過於頻繁，請稍後再試（限制：{exc.detail}）"},
    )


if settings.rate_limit_enabled:
    app.add_middleware(SlowAPIMiddleware)

# 路由
app.include_router(auth_router,        prefix="/api/v1")
app.include_router(sync_router,        prefix="/api/v1")
app.include_router(community_router,   prefix="/api/v1")
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
