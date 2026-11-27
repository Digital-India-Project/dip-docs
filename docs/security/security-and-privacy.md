# Security and Privacy Architecture

**Audience:** Platform & Security Engineers, Administrators, Developers  
**Access Class:** Public / Internal Policy  
**Owner:** `dip-security` & `DIPINDIA` maintainers  
**Implementation Status:** Implemented and verified (`DIPINDIA`, `dip-api`, `dip-security`)  
**Last Verified:** 2026-11-27

> [!SECURITY]
> Never commit secrets, live API keys, customer identity proofs, private certificates, unredacted logs, or internal network addresses to any Digital India Project repository. Report suspected vulnerabilities privately to security owners before public disclosure.

## 1. Authentication and Account Security

- **`DIPINDIA` Portal:** Uses Firebase Authentication and Worker middleware (`requireAuth`, `requirePermission`) plus optional TOTP two-factor authentication (`UserPrivateSecurity.totpSecretEncrypted`), recovery hashes, and biometric credential metadata.
- **`dip-api` Gateway:** Uses short-lived HS256 JWT bearer tokens verified by `HmacAuthVerifier` against `issuer`, `audience`, expiry, and explicit string scopes. Sandbox token generation (`POST /api/v1/sandbox/token`) is strictly disabled in `production`.

## 2. Role-Based Access Control and Tenant Isolation

- **Role Matrix (`DIPINDIA`):** 22 `PermissionCode` constants control access across `applications.*`, `services.*`, `users.manage`, `operators.assign`, `partners.manage`, `commissions.manage`, `payments.*`, `reports.view`, `settings.manage`, `audit_logs.view`, `rbac.manage`, and `integrations.manage`.
- **Tenant & Ownership Enforcement (`dip-api` / `dip-security`):** `assertTenantAndOwnership(auth, record, overrideScope)` ensures every read or write checks both `tenant_id` match and `owner_user_id === auth.subject` unless an explicit elevated tenant scope (e.g., `documents:tenant_read`) is present.

## 3. Document Privacy and Upload Hardening

- **Allowed MIME Types (`DIPINDIA/worker/routes/v1.ts`):** Restricted strictly to `application/pdf`, `image/jpeg`, `image/png`, and `image/webp`.
- **Binary Signature Validation:** `validateFileSignatureAndExtension()` verifies file magic bytes match the declared extension and sanitizes extensions via `sanitizeSafeExtension()` and filenames via `sanitizeContentDispositionFilename()`.
- **Storage Retention:** Administrators with `settings.manage` can trigger retention cleanup via `POST /api/admin/storage/enforce-retention`.

## 4. API, SSRF, and Webhook Security

- **Constant-Time Comparisons:** `constantTimeEqual()` in `DIPINDIA/worker/middleware/security.ts` and `dip-security` prevents timing attacks during HMAC validation.
- **SSRF Protection (`dip-api/src/server/security/ssrf.ts`):** Webhook subscription registration (`POST /api/v1/webhooks/subscriptions`) blocks non-HTTPS URLs and private/loopback/link-local IP targets.
- **Redirect Safety:** `validateSafeRedirectUrl()` prevents open-redirect vulnerabilities in `DIPINDIA`.
- **Webhook Verification:** Cashfree webhooks validate `hmacSha256Base64` / `hmacSha256Hex`, timestamp window freshness (`validateWebhookTimestamp`), and replay deduplication.
- **Log Redaction:** `dip-api` and `dip-sdk` redact `Authorization` headers, token strings, and raw identity numbers (`PAN`/`GST`) before emitting structured logs.

## 5. Responsible Disclosure and Incident Response

Follow the mandatory incident workflow in [Security Policy](../SECURITY.md#7-incident-response): halt publication, notify security owners, rotate exposed credentials through authorized owners, audit cached copies/history, and record corrective actions.
