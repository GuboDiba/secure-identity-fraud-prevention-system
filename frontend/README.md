# Secure Identity & Fraud Prevention Frontend

This is the Next.js 16 (App Router) frontend for the Secure Identity & Fraud Prevention System. It provides a modern, responsive UI for authentication, fraud monitoring, analytics, TOTP/QR management, and cryptographic tools.

## Features

- **Authentication**: Login, registration, JWT-based session management
- **Dashboard**: Overview of system stats and quick navigation
- **Fraud Logs**: View and submit fraud activity, risk scores, decisions
- **Devices**: Track user activity by device and IP
- **Analytics**: Visualize top risk users and daily block events
- **TOTP/QR**: Enroll, view QR, verify, and list 2FA users
- **Crypto Tools**: Luhn, Verhoeff, SHA-256, HMAC, AES, RSA utilities
- **Protected Routes**: All pages except login/register require authentication
- **Responsive Design**: Mobile-friendly, dark mode support

## Getting Started

### Prerequisites
- Node.js 20+
- Backend API running at `http://127.0.0.1:8000` (see backend/README.md)

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
App runs at [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## Environment Variables
- `NEXT_PUBLIC_API_URL` (optional): Override backend API URL

## Project Structure
```
frontend/
	app/           # Next.js App Router pages
	components/    # Shared React components
	config/        # API config
	public/        # Static assets
	globals.css    # Tailwind CSS + custom styles
```

## API Endpoints
All API endpoints are defined in `config/api.ts` and map to the backend FastAPI routes.

## Authentication
- JWT tokens are stored in cookies (`token`, `refresh_token`)
- Protected pages redirect to login if not authenticated

## Customization
- Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`)
- Uses React 19, Next.js 16, Axios, js-cookie

## Development Notes
- Typecheck: `npx tsc --noEmit`
- Lint: (not configured by default)
- All API errors are shown as toast notifications
- For CORS issues, ensure backend has `CORSMiddleware` enabled

## License
MIT
