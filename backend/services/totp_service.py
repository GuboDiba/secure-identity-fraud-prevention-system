from pathlib import Path

import qrcode
from fastapi import HTTPException

from core.config import settings
from users_db import (
    create_user,
    generate_totp_secret,
    get_totp_uri,
    get_user,
    list_totp_users,
    set_totp_secret,
    verify_totp,
)


def register_totp_user(username: str, password: str) -> dict:
    secret = generate_totp_secret()
    created = create_user(username, password, totp_secret=secret)
    if not created:
        raise HTTPException(status_code=400, detail="User already exists")

    uri = get_totp_uri(username, secret, issuer_name=settings.totp_issuer_name)
    return {"username": username, "totp_uri": uri, "secret": secret}


def generate_qr_code(username: str) -> dict:
    user = get_user(username)
    if not user or not user.get("totp_secret"):
        raise HTTPException(status_code=404, detail="User not found")

    uri = get_totp_uri(username, user["totp_secret"], issuer_name=settings.totp_issuer_name)
    filename = settings.qr_codes_dir / f"{username}_qr.png"
    image = qrcode.make(uri)
    image.save(filename)
    return {"message": f"QR code saved as {filename.name}", "path": str(filename)}


def verify_totp_code(username: str, token: str) -> dict:
    user = get_user(username)
    if not user or not user.get("totp_secret"):
        raise HTTPException(status_code=404, detail="User not found")

    if verify_totp(token, user["totp_secret"]):
        return {"message": "TOTP verified!"}
    raise HTTPException(status_code=400, detail="Invalid TOTP code")


def get_totp_users() -> dict:
    return {"users": list_totp_users()}