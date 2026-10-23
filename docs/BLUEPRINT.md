# Centralized Secret Vault — Product Blueprint

## Product goal

Provide an organization-scoped system where approved teams can store, retrieve and govern credentials without putting plaintext into logs, browser URLs, audit metadata or analytics. Server-side authorization and verifiable actions are core product behavior, not presentation features.

## Users and roles

- **Administrator:** organization, users and policy administration; all project actions.
- **Security Manager:** security policies, audit review, approvals and security operations.
- **Developer:** manage secrets within explicitly assigned projects and environments.
- **Viewer:** read non-sensitive inventory metadata for assigned projects.
- **Project membership:** narrows access further; secret reveal is a separate privilege.

## First usable release (MVP)

1. First-organization setup, secure sign-in/out, session revocation and role-aware navigation.
2. Create projects and assign organization-scoped members.
3. Create, list, edit, version and revoke secrets. Encrypt values server-side; list/detail APIs return metadata only. Reveal is an explicit no-store operation, guarded by project membership and reveal permission, and audited.
4. Dashboard counts and recent activity read from the database, with honest empty states.
5. Audit chain and explicit integrity verification. Explain that an HMAC chain detects many changes but needs separately protected checkpoints for strong tamper resistance.
6. Responsive Next.js App Router experience with a public product site and authenticated React workspace.

## Security model

- Browser talks to versioned Express REST routes over same-origin secure cookies, with CSRF checks on mutations.
- Passwords are Argon2id hashes. Session cookie holds random opaque material; PostgreSQL stores its SHA-256 digest and expiry/revocation.
- Each secret version uses a fresh random 256-bit DEK, AES-256-GCM nonce and tag. DEK is wrapped by a separately managed KEK. Development KEK may come from `.env`; production must use a KMS/HSM adapter and TLS.
- Every database query scopes by organization; project membership checks happen on the server. Secret reveal is separately authorized.
- Audit records contain identifiers and safe metadata only. Independent HMAC key chains records; production checkpoints go to immutable external storage.
- No security state is fabricated. Provider integrations report success only after provider confirmation.

## Build sequence

### Phase 0 — Foundation and blueprint

Workspace, architecture, schema, environment contract, security boundary documentation, and Next.js application structure.

### Phase 1 — MVP workflows

Finish onboarding/auth, projects, memberships, encrypted secret CRUD/reveal, audit verification, database-backed dashboard. Confirm build and critical flows in a browser with PostgreSQL.

### Phase 2 — Governance

MFA enrollment/challenge and recovery, expiry policies, scoped access requests and approval, user administration, session management, policy enforcement, notifications.

### Phase 3 — Operations

KMS provider integration, re-encryption worker, provider-specific rotation adapters, emergency access with approvals and expiry, incident timelines and authorized response actions, audit checkpoints.

### Phase 4 — Developer and compliance surface

Scoped API credentials, CLI, OpenAPI docs, reports, backups/restore procedures, retention and deployment automation.

### Phase 5 — Verification and launch readiness

Unit/integration/authorization/security tests, browser checks, dependency review, backup/restore drill, independent security review, TLS/KMS/deployment configuration.

## Release gates

- No plaintext secret in database or audit/log output.
- Cross-organization and cross-project access denied by API checks.
- No reveal without explicit permission; reveal creates an audit event and sets no-store.
- Browser pages display actual database state and honest unavailable/pending states.
- Build succeeds without Vite. Tests are added and run before production readiness.
- No real credential in source control; production KEK unavailable unless external provider configured.

## Current status

Phase 0 exists. The repository has a starter UI and backend draft, but local dependency installation did not finish. Phase 1 is in progress; this code is not production-ready until workflows and security verification are complete.
