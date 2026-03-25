from fastapi import APIRouter

from models import TotpRegisterRequest, TotpVerifyRequest
from services.totp_service import generate_qr_code, get_totp_users, register_totp_user, verify_totp_code


router = APIRouter(prefix="/totp", tags=["totp"])


@router.post("/register")
def register_totp(payload: TotpRegisterRequest):
    return register_totp_user(payload.username, payload.password)


@router.get("/qr/{username}")
def get_qr(username: str):
    return generate_qr_code(username)


@router.post("/verify")
def verify_totp(payload: TotpVerifyRequest):
    return verify_totp_code(payload.username, payload.token)


@router.get("/users")
def list_totp_users():
    return get_totp_users()