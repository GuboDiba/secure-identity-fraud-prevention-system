from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import os

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_version: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    database_url: Path
    rsa_keys_dir: Path
    qr_codes_dir: Path
    totp_issuer_name: str
    velocity_threshold: int
    risk_score_threshold: int


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv("APP_NAME", "Secure Identity & Fraud Prevention API"),
        app_version=os.getenv("APP_VERSION", "1.0.0"),
        secret_key=os.getenv("SECRET_KEY", "change-this-secret-key-in-production"),
        algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15")),
        refresh_token_expire_days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")),
        database_url=Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "app.db"))),
        rsa_keys_dir=Path(os.getenv("RSA_KEYS_DIR", str(BASE_DIR / "keys"))),
        qr_codes_dir=Path(os.getenv("QR_CODES_DIR", str(BASE_DIR / "generated_qr"))),
        totp_issuer_name=os.getenv("TOTP_ISSUER_NAME", "SecureApp"),
        velocity_threshold=int(os.getenv("VELOCITY_THRESHOLD", "5")),
        risk_score_threshold=int(os.getenv("RISK_SCORE_THRESHOLD", "10")),
    )


settings = get_settings()