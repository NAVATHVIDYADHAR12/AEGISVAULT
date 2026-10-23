# Security notes and deployment boundary

This repository intentionally ships without production credentials. Generate distinct random values for audit-HMAC and vault encryption. Never commit `.env` or copy production keys into source control.

## Cryptographic model

Secret versions use AES-256-GCM with a fresh 96-bit nonce and authenticated metadata. A random data-encryption key (DEK) encrypts each value; the DEK is wrapped with a key-encryption-key (KEK). Local development uses `DEV_KEK_BASE64`. The single-project Vercel deployment can use `VAULT_KEK_BASE64`, stored as a server-only encrypted environment variable, while `AUDIT_HMAC_KEY` remains independent. This environment-backed adapter is a deployment option, not an HSM or external KMS. A cloud KMS/HSM adapter, key versioning and re-wrapping, tested restore procedures, TLS, and key-rotation runbooks remain required before regulated or high-assurance production use.

## Authentication

Passwords are Argon2id hashed. Login sessions are opaque random tokens; only their SHA-256 digest is stored. Cookies are HTTP-only, SameSite strict and Secure in production. Mutating cookie-authenticated requests require an origin check and CSRF token. MFA enrollment/verification routes and recovery delivery require completion before production launch. Use a trusted email provider for password reset and security notifications; the app does not claim delivery without one.

## Audit

Events are chained with HMAC-SHA-256 using an independent audit key. Verification detects modification/deletion/reordering relative to a trusted checkpoint. Hash chains alone do not prevent a privileged operator rewriting the entire chain. Production must export signed checkpoints to separately controlled immutable storage.

## Before production

Complete external KMS integration and key rotation, email/reset delivery, MFA enrollment UX, API/CLI key issuance and revocation, provider-specific credential rotation, anomaly detection tuning, backup/restore drills, independent security review, and the test suite. Enforce TLS at the edge, least privilege for database/key identities, retention policy, monitoring, and incident response ownership. Do not expose production secrets to client analytics or logs. Protect and back up `VAULT_KEK_BASE64` securely; losing it makes wrapped secret keys unrecoverable.

