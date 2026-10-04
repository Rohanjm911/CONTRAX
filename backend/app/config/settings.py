from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "CONTRAX"
    APP_TAGLINE: str = "See the flaw before they do."
    API_V1_PREFIX: str = "/api/v1"

    SECRET_KEY: str = "contrax_ultra_secure_dev_secret_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    DATABASE_URL: str = "sqlite+aiosqlite:///./contrax.db"

    REDIS_URL: str = "redis://localhost:6379/0"

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    MAX_UPLOAD_SIZE: int = 20 * 1024 * 1024
    MAX_ZIP_EXTRACTED_SIZE: int = 100 * 1024 * 1024
    MAX_ZIP_FILE_COUNT: int = 250
    SCAN_TIMEOUT: int = 300
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")
    SANDBOX_DIR: str = os.path.join(os.getcwd(), "analysis_sandbox")

    RPC_ETHEREUM: str = "https://rpc.ankr.com/eth"
    RPC_SEPOLIA: str = "https://rpc.ankr.com/eth_sepolia"
    RPC_POLYGON: str = "https://polygon-rpc.com"
    RPC_ARBITRUM: str = "https://arb1.arbitrum.io/rpc"
    RPC_OPTIMISM: str = "https://mainnet.optimism.io"
    RPC_BASE: str = "https://mainnet.base.org"

    ETHERSCAN_API_KEY: str = ""
    POLYGONSCAN_API_KEY: str = ""
    ARBISCAN_API_KEY: str = ""
    OPTIMISMSCAN_API_KEY: str = ""
    BASESCAN_API_KEY: str = ""


settings = Settings()
