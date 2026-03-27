from datetime import datetime, timedelta

from core.config import settings
from core.database import get_db
from models import FraudActivityRequest


def log_activity(payload: FraudActivityRequest) -> dict:
    now = datetime.utcnow()
    with get_db() as connection:
        connection.execute(
            """
            INSERT INTO user_activity (username, action, ip, device, time)
            VALUES (?, ?, ?, ?, ?)
            """,
            (payload.username, payload.action, payload.ip, payload.device, now.isoformat()),
        )

        window_start = (now - timedelta(minutes=1)).isoformat()
        recent_actions = connection.execute(
            """
            SELECT COUNT(*) AS count
            FROM user_activity
            WHERE username = ? AND time >= ?
            """,
            (payload.username, window_start),
        ).fetchone()["count"]

        same_device_users = connection.execute(
            """
            SELECT COUNT(DISTINCT username) AS count
            FROM user_activity
            WHERE device = ? AND username != ?
            """,
            (payload.device, payload.username),
        ).fetchone()["count"]

        user_ips = connection.execute(
            """
            SELECT COUNT(DISTINCT ip) AS count
            FROM user_activity
            WHERE username = ?
            """,
            (payload.username,),
        ).fetchone()["count"]

        risk_score = 0
        excess_actions = recent_actions - settings.velocity_threshold
        if excess_actions > 0:
            risk_score += excess_actions

        risk_score += same_device_users * 2
        risk_score += max(0, user_ips - 2) * 3

        decision = "allow" if risk_score < settings.risk_score_threshold else "block"
        if decision == "block":
            connection.execute(
                """
                INSERT INTO fraud_logs (username, action, risk_score, decision, time)
                VALUES (?, ?, ?, ?, ?)
                """,
                (payload.username, payload.action, risk_score, decision, now.isoformat()),
            )

    return {"risk_score": risk_score, "decision": decision}


def get_fraud_logs() -> list[dict]:
    with get_db() as connection:
        rows = connection.execute(
            """
            SELECT username, action, risk_score, decision, time
            FROM fraud_logs
            ORDER BY time DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]


def get_user_activity() -> list[dict]:
    with get_db() as connection:
        rows = connection.execute(
            """
            SELECT username, action, ip, device, time
            FROM user_activity
            ORDER BY time DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]