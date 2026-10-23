# Centralized Secret Vault — Implementation Checklist

Use this as the running record of what is real, what is illustrative, and what remains before release. “Implemented” means the source is present; build, browser, database, and security verification are tracked separately and remain release gates. The dashboard shown on the public landing page is intentionally an illustrative product preview; it must never be presented as live customer data.

Status key: **Done** = source implementation exists; **Partial** = code exists with a meaningful functional or verification gap; **Static** = presentation/sample data only; **Todo** = not implemented.

## Current project state

- [x] **Done** — Express API and Prisma/PostgreSQL data model foundation, mounted through a Next.js Node.js Route Handler for single-project deployment.
- [x] **Done** — Server-side encrypted secret storage foundation, organization/project scoping, opaque sessions, CSRF checks, and chained audit events.
- [x] **Done** — React workspace console has auth/setup flows and API-backed starter views for dashboard, secrets, projects/invitations, access requests, user roles, and audit logs.
- [x] **Done** — The repository root is one Next.js App Router application: public landing route, `/app` workspace routes, and in-process `/api/v1/*` and `/health` handlers share one deployment.
- [x] **Done** — Project creation and one-time invitation issuance now use in-app forms; invite tokens are shown once and can be copied by an authorized administrator.
- [x] **Done** — Project members can submit a reasoned reveal-access request through an in-app form.
- [x] **Done** — Administrators and Security Managers can view project members, change project roles, and remove membership; changes are audited by the API.
- [x] **Done** — Project access view lists pending invitations, marks expired ones, and lets authorized managers revoke unused tokens; removal also revokes the member's existing secret grants.
- [x] **Done** — Secret metadata can be edited, a replacement value creates a new encrypted version through the API, and version history displays metadata without values.
- [x] **Done** — Revealed values clear from the workspace view after 60 seconds, and users can hide them sooner; clipboard contents still need a clearing strategy.
- [x] **Done** — Rotation & Expiry now reads real secret expiry metadata and separates expiry tracking from provider-driven rotation.
- [x] **Done** — Dashboard audit integrity control now runs the protected API verification and reports the returned result; audit navigation is limited to authorized roles.
- [x] **Done** — User-role controls now reflect API permissions: Security Managers can assign only Developer/Viewer, while disable/enable is Administrator-only and self-actions are disabled.
- [x] **Done** — This checklist records current scope and implementation gaps.
- [ ] **Partial** — The app now starts one Next.js server with API routes in-process. Verify the root production build and API flow after the consolidated install; account creation requires the documented database and key variables.

## Static or illustrative today

- [ ] **Static** — Marketing landing page uses illustrative product data in its dashboard preview (counts, actors, timestamps, and event hashes). It has no live workspace connection.
- [ ] **Static** — `preview.html` is a disposable HTML-only interaction prototype. It is not the Next.js application or a secure vault and should not be used for real credentials.
- [ ] **Partial** — The Aegis guide is a local, rule-based help assistant that navigates to workspace sections; it does not use a hosted AI model or transmit chat messages.
- [ ] **Partial** — Workspace counts, sign-in activity, secrets, project lists, approvals, and audit rows load from PostgreSQL. Dashboard metrics count up when visible, and the 30-day sign-in graph plots persisted daily success/failure totals. Remaining operational pages are still being wired to persisted workflows.
- [ ] **Partial** — Rotation & Expiry reads saved dates; provider-run rotation is unconfigured. Policies now enforce production and expiry rules for secret creation/expiry edits; incidents have audited response stages; monitoring uses persisted sign-in/audit data; audit CSV export and account/organization context are available. Dual-control emergency access, provider integrations, alert delivery, MFA, editable profile settings, and certified compliance reporting remain incomplete.
- [x] **Done** — A single-root Vercel deployment configuration and environment/migration guide are present.
- [ ] **Todo** — No production KMS/HSM integration, hosted AI provider, mail/alert provider, credential rotation provider, external immutable audit checkpoint store, or Vercel project/environment values are configured.

## Website and experience

- [x] **Done** — Set the visual direction from the provided design brief: quiet dark neutrals, restrained blue/purple/gold, editorial section rhythm, compact technical product UI, and responsive layouts.
- [x] **Done** — Add the public Next.js App Router landing-page route and the `/app` React workspace route in the same root app.
- [x] **Done** — Add responsive layout styling, keyboard focus basics, mobile layout adaptations, and `prefers-reduced-motion` handling.
- [x] **Done** — Refine the public landing page and authenticated workspace with a shared premium visual system, more readable product-preview typography, stronger workspace surfaces, and a collapsible mobile sidebar.
- [x] **Done** — Browser-checked the compact workspace layout, mobile menu, and dashboard at a narrow viewport; additional viewport QA remains before release.
- [ ] **Partial** — The workspace console now uses the brand surfaces and responsive sidebar; review it in a browser and replace remaining temporary copy/icons.
- [ ] **Todo** — Add real login/signup/onboarding page metadata, form feedback, loading/skeleton/empty/error states, and accessible validation.
- [ ] **Todo** — Add privacy, terms, support/contact, and trust-center content when product/legal requirements are known.
- [ ] **Partial** — Checked the workspace dashboard, cyan gradient primary actions, activity graph, and description dialog in the browser. Full cross-browser, contrast, and viewport review remains before release.

## Core vault workflows

- [ ] **Todo** — Run setup, registration, login, logout, session expiry/revocation against PostgreSQL.
- [ ] **Partial** — Secret create/list/reveal/revoke UI and API exist; verify server authorization, no-store reveal behavior, audit behavior, error paths, and value handling end to end.
- [ ] **Partial** — Secret metadata editing and encrypted version creation/history are available; revealed values auto-clear from view after 60 seconds; add version restore, richer metadata filtering, and safe clipboard clearing.
- [ ] **Partial** — Project creation/listing, invitation issuance/revocation, and member role/removal actions are wired to the API; finish invitation resend/email delivery and verify role boundaries end to end.
- [ ] **Partial** — Reveal requests and 24-hour approve/reject controls are wired to API routes; finish scoped approver policy, rejection reasons, expiry/revocation handling, notifications, and race-condition handling.
- [ ] **Partial** — Audit listing and HMAC chain verification scaffolding exist; add pagination/filtering and separately protected checkpoint support before making strong tamper-resistance claims.
- [ ] **Partial** — Dashboard, secrets, projects, access, users, audit, policies, incidents, monitoring, reports, settings, and expiry views now use saved API data or session context. KMS, CLI credentials, break-glass access, provider rotation, and several admin settings remain gated integration work.

## Security, reliability, and operations

- [ ] **Todo** — Complete MFA enrollment/challenge/recovery and secure password reset.
- [ ] **Todo** — Integrate a production KMS/HSM, key versioning/rotation, and re-encryption worker; prohibit development KEKs in production.
- [ ] **Partial** — Admins can create and pause server-enforced organization policies for production-secret creation and expiry requirements/lifetimes; policy changes are audited. Policy versioning, environment-specific exceptions, policy simulation, and additional secret lifecycle rules remain.
- [ ] **Todo** — Implement provider-confirmed rotation jobs, retries/idempotency, rollback strategy, and operational history; the current expiry page tracks dates only.
- [ ] **Todo** — Implement break-glass requests with dual control, short expiry, revocation, and incident linkage.
- [ ] **Partial** — Monitoring reports persisted sign-in and audit activity; administrators and Security Managers can open incidents and advance them through audited response states. Anomaly detection, notification delivery, alert routing, automated containment, and incident-to-secret linkage remain.
- [ ] **Partial** — The Reports page exports up to 100 recent audit events as CSV. Scoped API tokens, CLI, OpenAPI, certified compliance exports, backups, restore drills, retention, and deployment automation remain.
- [ ] **Todo** — Add unit, integration, authorization/isolation, migration, tamper, rate-limit, and browser tests; do not claim production readiness before these pass.
- [ ] **Todo** — Complete dependency review, threat model review, TLS/secret configuration, security assessment, and release checklist.

## Definition of done for MVP

- [ ] A developer can install dependencies, configure PostgreSQL and keys, run migrations, and start the Next.js app and API using documented commands.
- [ ] First admin setup, authentication, project membership, secret create/list/version/reveal/revoke, and audit verification work in a real browser.
- [ ] Secret plaintext is absent from database records, logs, URLs, analytics, and audit metadata; reveal is authorized, no-store, and audited.
- [ ] Cross-organization and cross-project access is denied by server-side checks.
- [ ] The public landing page distinguishes illustrative preview data from live authenticated workspace data.
- [ ] Accessibility, responsive layout, error handling, and production dependency/security checks are reviewed.

## Work log

- 2026-10-23 — Consolidated the landing page, workspace, and API under one root Next.js application for Vercel; added an in-process Node.js API route adapter, root deployment configuration, production key handling, and environment/migration guidance. The logo and signup redirects remain within the same app.
- 2026-10-23 — Added shareable workspace routes for sidebar sections; replaced the static authentication panel with a PostgreSQL-backed 30-day sign-in graph; added visible count-up metrics and a first-project action for empty workspaces; unified legacy workspace submit buttons with the cyan/mint gradient; added focus entry, keyboard trapping, Escape dismissal, and focus restoration to the description dialog; added audited incidents, server-enforced organization policies, live monitoring, audit CSV export, and account/organization settings context; and verified dashboard, audit, policy, incident, monitoring, report, and settings routes in the running browser.
- 2026-10-22 — Added the premium landing page in Next.js App Router; established `/app` as the React workspace route; added in-app project, invitation, access-request, secret-edit, version-history, and API-backed expiry-tracking flows; added dashboard audit verification feedback; aligned user-role controls with API authorization; added scoped project member listing, role changes, audited removal with grant revocation, pending invitation review/revocation, and timed reveal clearing; polished the landing page/workspace styling and mobile navigation; and recorded known static areas and remaining implementation work.
