# Secure Identity & Fraud Prevention Backend

FastAPI backend for identity security and fraud prevention.

This project combines identity verification, authentication, cryptography, fraud scoring, and analytics in one backend API.

## What This Backend Does

- Generates and validates Luhn/Verhoeff IDs.
- Provides SHA-256 hashing, HMAC signing/verification, AES encryption/decryption, and RSA signing/verification.
- Supports user registration/login with JWT access and refresh tokens.
- Supports TOTP (Google Authenticator/Authy style) enrollment and verification.
- Logs activity and calculates simple fraud risk scores.
- Exposes analytics endpoints (top risk users, daily blocked events).

## Main Features

- Checksum utilities: Luhn and Verhoeff
- Cryptography tools: SHA-256, HMAC, AES, RSA
- Authentication: register/login with JWT access and refresh tokens
- TOTP 2FA: enroll users, generate QR, verify OTP codes
- Fraud engine: risk scoring based on activity, IP, and device patterns
- Analytics: top risky users and daily blocked events

## Project Structure

```text
backend/
	main.py                     # Full app entrypoint
	app_factory.py              # Shared FastAPI app builder
	core/
		config.py                 # Environment/config loading
		database.py               # SQLite initialization + connection helper
	routes/
		crypto.py                 # Crypto/checksum endpoints
		auth.py                   # Register/login/refresh/protected
		totp.py                   # TOTP endpoints
		fraud.py                  # Fraud endpoints
		analytics.py              # Analytics endpoints
	services/
		auth_service.py
		totp_service.py
		fraud_service.py
		analytics_service.py
	algorithms/
		luhn.py
		verhoeff.py
		hashing.py
		encryption.py
		rsa_signatures.py
	models.py                   # Request/response schemas
	jwt_utils.py                # JWT creation/verification
	users_db.py                 # User/TOTP database operations
	fraud/main.py               # Fraud-only app entrypoint
	analytics_engine/main.py    # Analytics-only app entrypoint
	totp_backend.py             # TOTP-only app entrypoint
	.env.example                # Environment template
	requirements.txt
```

## Tech Stack

- Python 3.10+
- FastAPI + Uvicorn
- SQLite (builtin `sqlite3`)
- `python-jose` for JWT
- `passlib[bcrypt]` for password hashing
- `pyotp` + `qrcode` for TOTP
- `pycryptodome` + `cryptography` for crypto features

## Setup

1. Move to backend folder:

```bash
cd /secure-identity-fraud-prevention-system/backend
```

2. Create and activate virtualenv:

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create your local env file:

```bash
cp .env.example .env
```

5. Set a real secret key in `.env` (important):

```env
SECRET_KEY=replace-with-a-long-random-secret
```

You can generate one with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Run

### Full Backend

```bash
uvicorn main:app --reload
```

Open:

- Swagger UI: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

### Optional Standalone Services

```bash
uvicorn fraud.main:app --reload --port 8001
uvicorn analytics_engine.main:app --reload --port 8002
uvicorn totp_backend:app --reload --port 8003
```

## Core API Groups

- `crypto`: `/luhn/*`, `/verhoeff/*`, `/hash/*`, `/hmac/*`, `/aes/*`, `/rsa/*`
- `auth`: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/protected`
- `totp`: `/totp/register`, `/totp/qr/{username}`, `/totp/verify`, `/totp/users`
- `fraud`: `/fraud/log_activity`, `/fraud/logs`
- `analytics`: `/analytics/top-risk-users`, `/analytics/daily-blocks`

## Data and Generated Files

- SQLite DB: `backend/app.db`
- RSA keys: `backend/keys/`
- QR images: `backend/generated_qr/`

## Quick Demo Flow

1. `POST /auth/register`
2. `POST /auth/login`
3. `POST /rsa/generate-keys`
4. `POST /totp/register`
5. `POST /fraud/log_activity`
6. `GET /analytics/top-risk-users`

## Security Notes

- Do not commit `.env`.
- Rotate `SECRET_KEY` if leaked.
- Changing `SECRET_KEY` invalidates old JWT tokens.

## Useful Local Commands

View users in DB (without sqlite3 CLI):

```bash
./venv/bin/python -c "import sqlite3; c=sqlite3.connect('app.db'); c.row_factory=sqlite3.Row; rows=c.execute('SELECT username, created_at FROM users ORDER BY created_at DESC').fetchall(); print('users:', len(rows)); [print(dict(r)) for r in rows]; c.close()"
```
