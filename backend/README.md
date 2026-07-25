# Aayu EnviroTech — Backend API

Express + SQLite (libsql/drizzle-orm) backend powering the Aayu EnviroTech admin dashboard and public lead form.

## Overview

- **Runtime**: Node.js, Express 5, CommonJS
- **Database**: SQLite via `@libsql/client` + `drizzle-orm`
- **Auth**: JWT bearer tokens, bcrypt password hashing
- **Modules**: leads, trades, trips, alerts, auth, health

## Setup

```bash
npm install
cp .env.example .env      # then fill in real values
npm run db:seed           # creates tables and seeds sample data
npm run dev                # starts on http://localhost:4000 with nodemon
```

Seeded users (from `npm run db:seed`):

| Email | Password | Role |
|---|---|---|
| admin@aayuenviro.com | admin123 | admin |
| manager@aayuenviro.com | manager123 | manager |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | yes | `4000` | Port the server listens on |
| `DATABASE_URL` | yes | — | Path to the SQLite database file |
| `JWT_SECRET` | yes | — | Secret used to sign/verify JWTs |
| `JWT_EXPIRES_IN` | no | `7d` | JWT token lifetime |
| `CORS_ORIGIN` | yes | — | Extra allowed CORS origin (in addition to localhost:3000 and the production Vercel domain, which are always allowed) |
| `SMTP_HOST` | no | — | SMTP server host for email notifications |
| `SMTP_PORT` | no | `587` | SMTP server port |
| `SMTP_USER` | no | — | SMTP auth username |
| `SMTP_PASS` | no | — | SMTP auth password / app password |
| `ADMIN_EMAIL` | no | — | Address that receives new-lead notifications |

`PORT`, `JWT_SECRET`, `DATABASE_URL`, and `CORS_ORIGIN` are validated on startup (`src/config.js`) — the process exits with a clear error if any are missing.

## API Endpoints

All responses follow `{ success: boolean, ... }`. List endpoints return `{ success, data, pagination }`.

### Health

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/api/health` | none | `{ status: "ok", ts, db: "connected" }` |

### Auth

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/api/auth/login` | none | `{ email, password }` | Rate limited: 5 attempts / 15 min / IP. Returns `{ token, user }` |
| GET | `/api/auth/me` | Bearer | — | Returns the current user profile |

### Leads

| Method | Path | Auth | Query params | Body |
|---|---|---|---|---|
| POST | `/api/leads` | none (5/min limit) | — | `{ name, email, phone?, company?, message?, projectType? }` |
| GET | `/api/leads` | Bearer | `page, limit, status, search` (matches name/email) | — |
| PATCH | `/api/leads/:id` | Bearer | — | `{ status }` |

Creating a lead sends two emails in parallel (admin notification + user confirmation); email failures are logged but never block lead creation.

Example `GET /api/leads?page=1&limit=20&status=new&search=john`:

```json
{
  "success": true,
  "data": [ { "id": 1, "name": "John Doe", "email": "john@example.com", "status": "new", "...": "..." } ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3, "hasNext": true, "hasPrev": false }
}
```

### Trades

| Method | Path | Auth | Query params | Body |
|---|---|---|---|---|
| GET | `/api/trades` | Bearer | `page, limit, status, commodity, search` (matches commodity/buyer) | — |
| POST | `/api/trades` | Bearer | — | `{ commodity, buyer, quantityMt, value, status?, tradeDate, settlementDate? }` |
| PATCH | `/api/trades/:id` | Bearer | — | `{ status?, settlementDate? }` |

### Trips

| Method | Path | Auth | Query params | Body |
|---|---|---|---|---|
| GET | `/api/trips` | Bearer | `page, limit, status, carrier, search` (matches origin/destination/commodity/carrier/tripRef) | — |
| POST | `/api/trips` | Bearer | — | `{ tripRef, origin, destination, commodity, carrier, weightMt, status?, eta? }` |
| PATCH | `/api/trips/:id` | Bearer | — | `{ status?, eta? }` |

### Alerts

| Method | Path | Auth | Query params | Body |
|---|---|---|---|---|
| GET | `/api/alerts` | Bearer | `page, limit, severity, resolved, search` (matches title/message) | — |
| PATCH | `/api/alerts/:id/resolve` | Bearer | — | — |

## Cross-cutting behavior

- **Rate limiting**: global 100 req / 15 min / IP; login 5 req / 15 min / IP; public lead submission 5 req / min / IP.
- **Sanitization**: all string values in `req.body` are HTML-stripped and trimmed before validation.
- **Validation**: Zod schemas per resource; failures return `400` with `{ success: false, error, details }`.
- **Error handling**: a single error-handling middleware normalizes all errors to `{ success: false, error }` — Zod validation errors → 400, JWT errors → 401, SQLite constraint violations → 409, everything else → 500 (stack traces never leak in production).
- **CORS**: allows `http://localhost:3000`, `https://aayu-environment-tech.vercel.app`, and any origin set in `CORS_ORIGIN`.
- **Logging**: `morgan` dev-format request logging, skipped for `/api/health`.
