# API overview

Base path: `/api/v1`. JSON errors use `{ "error": { "code", "message" } }`. Never put secret values in query strings.

- `POST /auth/register` (first organization only), `POST /auth/accept-invitation`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/csrf`, `GET /auth/setup-status`
- `GET /dashboard` — organization-scoped database counts and recent events.
- `GET /projects`, `POST /projects`, `POST /projects/:id/invitations`, `GET /projects/:id/invitations`, `DELETE /projects/:id/invitations/:invitationId`, `GET /projects/:id/members`, `PUT /projects/:id/members/:userId`, `DELETE /projects/:id/members/:userId`
- `GET /users`, `PUT /users/:id/role`, `POST /users/:id/disable`, `POST /users/:id/enable`
- `GET /access-requests`, `POST /access-requests`, `POST /access-requests/:id/decision`
- `GET /secrets?projectId=...`, `POST /secrets`, `GET /secrets/:id`, `POST /secrets/:id/reveal`, `PUT /secrets/:id`, `DELETE /secrets/:id`
- `GET /audit`, `POST /audit/verify`

Mutations require a valid session, same-origin request, and CSRF token. Obtain CSRF token from `GET /auth/csrf`; send it as `x-csrf-token`. Secrets must be accessed through an active project membership or an Administrator/Security Manager role. A reveal is an audited POST and the response is `Cache-Control: no-store`.

Project access endpoints are restricted to Administrators and Security Managers and always scope records to the caller's organization. A global Viewer cannot create or edit secrets even if stale membership data grants project write access. Removing a project member also revokes their existing grants for secrets in that project.



