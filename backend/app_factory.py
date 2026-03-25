from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.config import settings
from core.database import init_db
from routes.analytics import router as analytics_router
from routes.auth import router as auth_router
from routes.crypto import router as crypto_router
from routes.fraud import router as fraud_router
from routes.totp import router as totp_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


def create_application(
    *,
    title: str,
    include_crypto: bool = False,
    include_auth: bool = False,
    include_totp: bool = False,
    include_fraud: bool = False,
    include_analytics: bool = False,
) -> FastAPI:
    app = FastAPI(title=title, version=settings.app_version, lifespan=lifespan)

    @app.get("/health", tags=["system"])
    def healthcheck():
        return {"status": "ok", "app": title, "version": settings.app_version}

    if include_crypto:
        app.include_router(crypto_router)
    if include_auth:
        app.include_router(auth_router)
    if include_totp:
        app.include_router(totp_router)
    if include_fraud:
        app.include_router(fraud_router)
    if include_analytics:
        app.include_router(analytics_router)

    return app