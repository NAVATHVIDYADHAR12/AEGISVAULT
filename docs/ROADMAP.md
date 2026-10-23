# Roadmap and honest feature boundaries

## Implemented foundation
- [x] Password registration/login/logout; opaque revocable sessions; role checks on protected API operations.
- [x] AES-256-GCM with per-version DEK and wrapped-key metadata; development KEK adapter rejects production use.
- [x] Organization-scoped encrypted secret CRUD, audited reveal/revoke, and audit events; list responses never contain secret values.
- [x] PostgreSQL relational schema for users, sessions, teams, projects, secrets/versions, access grants/requests, policies, rotation records, audit, notifications, emergency grants and incidents.
- [x] Actual dashboard counts and recent audit records; empty states when records do not exist.
- [x] Next.js App Router public site and React workspace under `/app`, with API rewrites for the Express service.
- [x] Workspace forms for project creation, one-time invitations, reveal-access requests, secret metadata/version updates, and version history.
- [x] Expiry tracking reads real secret expiry metadata; provider-driven rotation is still unavailable.
- [ ] Install dependencies and verify the Next.js build and workspace flows against PostgreSQL in a browser.

## Pending integrations/work
- [ ] MFA enrollment and login challenge UX, secure email-based password reset and notification delivery.
- [ ] External KMS/HSM provider, key rotation/re-encryption worker, immutable external audit checkpoints.
- [ ] Provider-specific secret rotation execution; schedules and history alone must never imply a credential changed.
- [ ] Policy editor, organization policy enforcement and environment rules.
- [ ] Break-glass approvals/expiry worker, incident response actions, anomaly detection and operational alerting.
- [ ] Scoped API tokens, CLI, OpenAPI generation, reports/export and full management screens.
- [ ] Unit, integration, authorization, migration, tamper and rate-limit tests; deployment pipelines and restore drills.

No pending feature is represented by simulated security results. Extend each item with its provider and operational controls before claiming it is active.


