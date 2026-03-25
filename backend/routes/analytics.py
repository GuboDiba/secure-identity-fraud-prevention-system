from fastapi import APIRouter

from services.analytics_service import daily_blocks, top_risk_users


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/top-risk-users")
def get_top_risk_users():
    return top_risk_users()


@router.get("/daily-blocks")
def get_daily_blocks():
    return daily_blocks()