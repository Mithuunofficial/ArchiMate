# Security Policy & Repository Safety Guidelines

## Overview

**ArchiMate** implements strict security practices to ensure private credentials, database secrets, API keys, and administrative configurations are never exposed publicly or committed to GitHub repositories.

---

## 🔒 1. Environment Variable Boundaries

### Local Development Environment (`.env.local`)
- `.env.local` is ignored by Git (`.gitignore`) and must **NEVER** be committed.
- Always use `.env.example` as a template for required variable names.

### Public Client-Side Variables (`NEXT_PUBLIC_*`)
Variables prefixed with `NEXT_PUBLIC_` are bundled and exposed to the browser.
- **Allowed**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **PROHIBITED**: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ADMIN_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`.

### Server-Only Secret Variables
Secrets without the `NEXT_PUBLIC_` prefix are accessible strictly on the server:
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side database administration.
- `GEMINI_API_KEY`: Server-side LLM architecture generation queries.
- `ADMIN_USERNAME` & `ADMIN_PASSWORD`: Server-side administrator portal credentials.

---

## 🛡️ 2. Administrator Security Rules

- Admin authorization is strictly enforced server-side via Next.js Server API Routes (`/api/admin/*`).
- Admin session tokens are issued via HTTP-Only, SameSite-restricted cookies (`archimate_admin_token`).
- Admin passwords and tokens are never stored in `localStorage`, `sessionStorage`, or public database tables.

---

## 🔑 3. API Key Rotation & Incident Response

If an API key or database secret is ever exposed or suspected to be compromised:

1. **Immediate Revocation**: Go to your service provider dashboard (Supabase / Google AI Studio / Cloud provider) and immediately revoke/rotate the affected key.
2. **Update Environment**: Replace the key in your local `.env.local` and your hosting provider (e.g., Vercel Environment Variables).
3. **Clean Git History**: If a secret was committed in a previous Git commit, history purging is required:
   ```bash
   git filter-repo --invert-paths --path .env.local
   ```
4. **Push Update**: Force push updated branch history after rotation and verification.

---

## 🚀 4. Production Deployment (Vercel / Cloud)

- Production environments must rely on hosting platform environment configuration (e.g. Vercel Project Settings -> Environment Variables).
- Do not commit production `.env` files.
