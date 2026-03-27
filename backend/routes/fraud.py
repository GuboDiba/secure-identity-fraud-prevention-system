from fastapi import APIRouter

from models import FraudActivityRequest
from services.fraud_service import get_fraud_logs, get_user_activity, log_activity


router = APIRouter(prefix="/fraud", tags=["fraud"])


@router.post("/log_activity")
def create_activity_log(payload: FraudActivityRequest):
    return log_activity(payload)


@router.get("/logs")
def list_fraud_logs():
    return get_fraud_logs()


@router.get("/activity")
def list_user_activity():
    return get_user_activity()