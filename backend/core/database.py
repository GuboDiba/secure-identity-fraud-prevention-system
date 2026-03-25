from contextlib import contextmanager
import sqlite3

from core.config import settings


def init_db() -> None:
    settings.database_url.parent.mkdir(parents=True, exist_ok=True)
    settings.qr_codes_dir.mkdir(parents=True, exist_ok=True)
    settings.rsa_keys_dir.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(settings.database_url) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                totp_secret TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS user_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                action TEXT NOT NULL,
                ip TEXT NOT NULL,
                device TEXT NOT NULL,
                time TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS fraud_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                action TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                decision TEXT NOT NULL,
                time TEXT NOT NULL
            )
            """
        )
        connection.commit()


@contextmanager
def get_db():
    init_db()
    connection = sqlite3.connect(settings.database_url)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()