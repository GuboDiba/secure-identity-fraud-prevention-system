from fastapi import HTTPException

from jwt_utils import create_access_token, create_refresh_token, verify_token
from models import RefreshRequest, UserLogin, UserRegister
from users_db import create_user, get_user, verify_password


def register_user(user: UserRegister) -> dict:
    if not create_user(user.username, user.password):
        raise HTTPException(status_code=400, detail="User already exists")
    return {"message": "User registered successfully"}


def login_user(user: UserLogin) -> dict:
    db_user = get_user(user.username)
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": create_access_token({"sub": user.username}),
        "refresh_token": create_refresh_token({"sub": user.username}),
    }


def refresh_tokens(payload: RefreshRequest) -> dict:
    token_payload = verify_token(payload.refresh_token)
    if not token_payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    username = token_payload.get("sub")
    return {
        "access_token": create_access_token({"sub": username}),
        "refresh_token": create_refresh_token({"sub": username}),
    }


def get_user_from_bearer_token(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = authorization.split(" ", 1)[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]