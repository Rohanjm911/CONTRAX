import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select

from app.config.settings import settings
from app.config.logging import logger
from app.db.database import engine, Base, AsyncSessionLocal
from app.db.models.user import User
from app.core.security import get_password_hash

from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.contracts import router as contracts_router
from app.api.v1.scans import router as scans_router
from app.api.v1.findings import router as findings_router
from app.api.v1.gas import router as gas_router
from app.api.v1.reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CONTRAX Database Tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.username == "researcher"))
        user = res.scalars().first()
        if not user:
            logger.info("Creating default security researcher account...")
            default_user = User(
                username="researcher",
                email="researcher@contrax.security",
                hashed_password=get_password_hash("ContraxAdmin2026!"),
                full_name="Lead Security Auditor",
                is_active=True,
                is_superuser=True
            )
            db.add(default_user)
            await db.commit()

    logger.info("CONTRAX Security Engine Ready. 'See the flaw before they do.'")
    yield
    logger.info("Shutting down CONTRAX...")


app = FastAPI(
    title="CONTRAX API",
    description="Smart Contract Automated Vulnerability Scanner & Audit Visualizer - REST Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

v1_prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=v1_prefix)
app.include_router(projects_router, prefix=v1_prefix)
app.include_router(contracts_router, prefix=v1_prefix)
app.include_router(scans_router, prefix=v1_prefix)
app.include_router(findings_router, prefix=v1_prefix)
app.include_router(gas_router, prefix=v1_prefix)
app.include_router(reports_router, prefix=v1_prefix)


@app.get("/")
async def root():
    return {
        "platform": settings.APP_NAME,
        "tagline": settings.APP_TAGLINE,
        "status": "OPERATIONAL",
        "docs": "/docs",
        "api_v1": v1_prefix
    }
