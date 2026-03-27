# Secure Identity & Fraud Prevention System

This repository contains a full-stack solution for secure identity management and fraud prevention, featuring a FastAPI backend and a Next.js 16 frontend.

## Overview

- **Backend**: FastAPI, SQLite, JWT authentication, CORS, modular services for fraud, analytics, TOTP, and cryptography
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Axios, js-cookie, protected routes, responsive UI

## Features

- User authentication (JWT, refresh tokens)
- Fraud activity logging and risk scoring
- Device and IP tracking
- Analytics dashboard (top risk users, daily blocks)
- TOTP/QR 2FA management
- Cryptographic tools (Luhn, Verhoeff, SHA-256, HMAC, AES, RSA)
- API error handling and toast notifications

## Getting Started

### Backend
1. `cd backend`
2. (Optional) `python3 -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `python3 main.py`

- API runs at `http://127.0.0.1:8000`
- See `backend/README.md` for more details

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

- App runs at [http://localhost:3000](http://localhost:3000)
- See `frontend/README.md` for more details

## Project Structure
```
secure-identity-fraud-prevention-system/
  backend/    # FastAPI backend
  frontend/   # Next.js frontend
```

## Development Notes
- Typecheck frontend: `npx tsc --noEmit`
- Compile backend: `python3 -m py_compile ...`
- CORS: Ensure backend has `CORSMiddleware` enabled for frontend dev
- All API endpoints are mapped in `frontend/config/api.ts`

## License
MIT
