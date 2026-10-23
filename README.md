# Centralized Secret Vault

A single Next.js App Router application for an auditable, organization-scoped secret vault. The landing page, signup/login, workspace, and API routes deploy together; Express is mounted behind Next.js Route Handlers and is also available as a local development entry point. The project uses React, Tailwind CSS, PostgreSQL and Prisma.

## Current implementation

- Responsive security overview backed by live API data, with honest empty states.
- Express API with Zod validation, Helmet, request throttling, cookie sessions, CSRF protection and backend role checks.
- Argon2id password hashing, TOTP MFA primitives, AES-256-GCM envelope encryption with a KEK adapter boundary, and chained audit records.
- Organization/project/secret/version/access-request/approval/audit/incident schema and a guarded local seed script.
- Organization-scoped secret creation, list, detail, metadata update, versioned value update, revoke and explicitly authorized reveal. The workspace includes metadata-only version history and expiry tracking. Project members can accept scoped one-time invitations; Administrators and Security Managers can review project membership, update project roles, and remove members, with changes recorded in the audit log. Administrators can manage organization roles and revoke disabled users' sessions.
- Next.js App Router public landing page at `/` and React workspace at `/app`, sharing one app root. The workspace logo returns to `/`; successful first-time registration signs in and opens `/app/projects`.
- `/api/v1/*` and `/health` run as Node.js Route Handlers in that same Next.js app. Local development uses the same API implementation without requiring a second web application or API deployment.
- Product preview on the marketing page uses illustrative data only; workspace data should come from the authenticated API.

External KMS/HSM, mail delivery, provider-specific rotations, full approval workflows, detection, and production operations are not configured; see `SECURITY.md` and `docs/ROADMAP.md`.

## Requirements and setup

Node.js 20.9+, PostgreSQL 15+. Create a PostgreSQL database, then copy `.env.example` to `apps/api/.env`. Generate two independent random 32-byte values and set them as base64 in `AUDIT_HMAC_KEY` and `DEV_KEK_BASE64`. `DEV_KEK_BASE64` is for local development only. Vercel setup and required server-only variables are documented in [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md). The included production key adapter reads a separately generated `VAULT_KEK_BASE64` from Vercel's encrypted environment; it is not an HSM/KMS integration.

```sh
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

`npm run db:migrate` applies committed migrations without requiring the runtime role to create databases. Use `npm run db:migrate:dev` when authoring a new Prisma migration. `npm run dev` starts the workspace-local PostgreSQL runtime when its ignored `.local-postgres` folder is present, then runs one Next.js application. The integrated API reads local credentials from `apps/api/.env`.

Application: `http://localhost:3000`; landing page: `/`; workspace: `/app`; API: `/api/v1`; health check: `/health`. `npm run dev:api` starts the optional standalone local API on port 4000 for development diagnostics.

See [docs/IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md) for the live list of static/illustrative areas, partial workflows, and remaining implementation work. The HTML prototype at `preview.html` is not the application and must never be used with real secrets.

The seeder creates an administrator only when explicit seed credentials are configured and refuses to overwrite an existing account. Registration is also available through `POST /api/v1/auth/register` after obtaining a CSRF token from `GET /api/v1/auth/csrf`.



