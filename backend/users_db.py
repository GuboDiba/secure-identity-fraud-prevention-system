from passlib.context import CryptContext
from datetime import datetime
import pyotp

from core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_user(username: str, password: str, totp_secret: str | None = None) -> bool:
    with get_db() as connection:
        existing = connection.execute(
            "SELECT username FROM users WHERE username = ?",
            (username,),
        ).fetchone()
        if existing:
            return False

        connection.execute(
            """
            INSERT INTO users (username, password_hash, totp_secret, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (username, hash_password(password), totp_secret, datetime.utcnow().isoformat()),
        )
    return True


def get_user(username: str) -> dict | None:
    with get_db() as connection:
        row = connection.execute(
            "SELECT username, password_hash, totp_secret, created_at FROM users WHERE username = ?",
            (username,),
        ).fetchone()
    return dict(row) if row else None


def set_totp_secret(username: str, secret: str) -> bool:
    with get_db() as connection:
        result = connection.execute(
            "UPDATE users SET totp_secret = ? WHERE username = ?",
            (secret, username),
        )
    return result.rowcount > 0


def list_totp_users() -> list[dict]:
    with get_db() as connection:
        rows = connection.execute(
            "SELECT username, created_at FROM users WHERE totp_secret IS NOT NULL ORDER BY username",
        ).fetchall()
    return [dict(row) for row in rows]


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def get_totp_uri(username: str, secret: str, issuer_name: str = "SecureApp") -> str:
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=username, issuer_name=issuer_name)


def verify_totp(token: str, secret: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(token)