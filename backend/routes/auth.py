from fastapi import APIRouter, Header

from models import RefreshRequest, TokenResponse, UserLogin, UserRegister
from services.auth_service import get_user_from_bearer_token, login_user, refresh_tokens, register_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: UserRegister):
    return register_user(payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    return login_user(payload)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest):
    return refresh_tokens(payload)


@router.get("/protected")
def protected_route(authorization: str = Header(...)):
    username = get_user_from_bearer_token(authorization)
    return {"message": f"Hello {username}, you are authorized!"}