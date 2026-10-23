# Security notes and deployment boundary

This repository intentionally ships without production credentials. Generate distinct random audit-HMAC and development encryption values. Never commit `.env`.

## Cryptographic model

Secret versions use AES-256-GCM with a fresh 96-bit nonce and authenticated metadata. A random data-encryption key (DEK) encrypts each value; the DEK is wrapped through a key-encryption-key (KEK) provider adapter. The included development adapter reads a base64 KEK from the environment and is refused outside development. Production requires a cloud KMS/HSM adapter, TLS, restricted key access, tested restore procedures, and key rotation runbooks.

## Authentication

Passwords are Argon2id hashed. Login sessions are opaque random tokens; only their SHA-256 digest is stored. Cookies are HTTP-only, SameSite strict and Secure in production. Mutating cookie-authenticated requests require an origin check and CSRF token. MFA enrollment/verification routes and recovery delivery require completion before production launch. Use a trusted email provider for password reset and security notifications; the app does not claim delivery without one.

## Audit

Events are chained with HMAC-SHA-256 using an independent audit key. Verification detects modification/deletion/reordering relative to a trusted checkpoint. Hash chains alone do not prevent a privileged operator rewriting the entire chain. Production must export signed checkpoints to separately controlled immutable storage.

## Before production

Complete external KMS integration, email/reset delivery, MFA enrollment UX, API/CLI key issuance and revocation, provider-specific credential rotation, anomaly detection tuning, backup/restore drills, independent security review, and the test suite. Enforce TLS at the edge, least privilege for database/KMS identities, retention policy, monitoring, and incident response ownership. Do not expose production secrets to client analytics or logs.

