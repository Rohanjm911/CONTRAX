import asyncio
from app.db.database import engine, Base
import app.db.models
from app.config.logging import logger


async def init_db():
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully.")


if __name__ == "__main__":
    asyncio.run(init_db())
