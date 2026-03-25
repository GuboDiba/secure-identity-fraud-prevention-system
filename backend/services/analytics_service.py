from core.database import get_db


def top_risk_users(limit: int = 10) -> dict:
    with get_db() as connection:
        rows = connection.execute(
            """
            SELECT username, SUM(risk_score) AS total_risk
            FROM fraud_logs
            GROUP BY username
            ORDER BY total_risk DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return {"top_risk_users": [[row["username"], row["total_risk"]] for row in rows]}


def daily_blocks() -> dict:
    with get_db() as connection:
        rows = connection.execute(
            """
            SELECT substr(time, 1, 10) AS day, COUNT(*) AS total
            FROM fraud_logs
            GROUP BY substr(time, 1, 10)
            ORDER BY day DESC
            """
        ).fetchall()
    return {"daily_blocks": {row["day"]: row["total"] for row in rows}}