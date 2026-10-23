# Centralized Secret Vault

A production-minded foundation for an auditable, organization-scoped secret vault. The project uses React, JavaScript, Next.js App Router, Tailwind CSS, Express, PostgreSQL and Prisma.

## Current implementation

- Responsive security overview backed by live API data, with honest empty states.
- Express API with Zod validation, Helmet, request throttling, cookie sessions, CSRF protection and backend role checks.
- Argon2id password hashing, TOTP MFA primitives, AES-256-GCM envelope encryption with a KEK adapter boundary, and chained audit records.
- Organization/project/secret/version/access-request/approval/audit/incident schema and a guarded local seed script.
- Organization-scoped secret creation, list, detail, metadata update, versioned value update, revoke and explicitly authorized reveal. The workspace includes metadata-only version history and expiry tracking. Project members can accept scoped one-time invitations; Administrators and Security Managers can review project membership, update project roles, and remove members, with changes recorded in the audit log. Administrators can manage organization roles and revoke disabled users' sessions.
- Next.js App Router public landing page at `/` and React workspace at `/app`.
- Next rewrites `/api/*` and `/health` to the Express API on port 4000 during local development.
- Product preview on the marketing page uses illustrative data only; workspace data should come from the authenticated API.

External KMS, mail delivery, provider-specific rotations, full approval workflows, detection, and production operations are not configured; see `SECURITY.md` and `docs/ROADMAP.md`.

## Requirements and setup

Node.js 20.9+, PostgreSQL 15+. Create a PostgreSQL database, then copy `.env.example` to `apps/api/.env` so both the API and Prisma CLI load it. Generate two independent random 32-byte values and set them as base64 in `AUDIT_HMAC_KEY` and `DEV_KEK_BASE64`. `DEV_KEK_BASE64` is for local development only. Production requires an external KMS/HSM adapter, which is not implemented.

```sh
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

`npm run db:migrate` applies committed migrations without requiring the runtime role to create databases. Use `npm run db:migrate:dev` when authoring a new Prisma migration. `npm run dev` starts the workspace-local PostgreSQL runtime when its ignored `.local-postgres` folder is present; otherwise it uses the PostgreSQL server configured in `apps/api/.env`.

Web: `http://localhost:3000`; public site: `/`; workspace: `/app`; API: `http://localhost:4000/api/v1`; health check: `/health`.

See [docs/IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md) for the live list of static/illustrative areas, partial workflows, and remaining implementation work. The HTML prototype at `preview.html` is not the application and must never be used with real secrets.

The seeder creates an administrator only when explicit seed credentials are configured and refuses to overwrite an existing account. Registration is also available through `POST /api/v1/auth/register` after obtaining a CSRF token from `GET /api/v1/auth/csrf`.



