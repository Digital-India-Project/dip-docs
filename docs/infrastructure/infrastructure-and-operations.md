# Infrastructure, Operations, and Observability

**Audience:** Platform Engineers, Maintainers, Release Managers  
**Access Class:** Internal (Sanitized Public Summary)  
**Owner:** `dip-infrastructure` & `dip-status` maintainers  
**Implementation Status:** Interface or contract only (`dip-infrastructure` console/templates); Planned (`dip-status`)  
**Last Verified:** 2026-11-27

> [!WARNING]
> This document uses sanitized configuration patterns only. Real Cloudflare account IDs, D1 database IDs, R2 bucket names, internal IPs, and secrets must never be published in documentation.

## 1. Platform Runtime Footprint (Verified Baseline)

- **`DIPINDIA`:** React/Vite frontend served alongside a Hono-based Cloudflare Worker (`wrangler.toml`) using D1/Firestore/R2 storage bindings (`BindingType`: `r1`, `r2`, `d1`, `d2`, `firebase`).
- **`dip-api` & `dip-automation`:** Node.js 22 + Express microservices designed for containerized or standalone deployment on port `3000`.
- **`dip-infrastructure`:** Provides an interactive YAML configuration validator (`infra-config.yaml`, `infra-config.v2.schema.json`) and sanitized environment templates (`templates/env.{development,staging,production}.example`).
- **`dip-status`:** Currently a planning foundation (`README.md` + `docs/`) defining principles for future read-only, privacy-safe public status reporting.

## 2. Environments (`dip-infrastructure`)

| Environment | Purpose | Adapter / Safety Rules |
|---|---|---|
| `development` | Local developer workstation | Sandbox adapters allowed; ephemeral secrets permitted locally |
| `staging` | Pre-production verification | Mirrors strict security boundaries; uses isolated synthetic/test credentials |
| `production` | Live customer environment | Strict mode required (`DIP_ALLOW_SANDBOX_ADAPTERS` false); sandbox token endpoint disabled |

*Known Baseline Defect in `dip-infrastructure`:* `infra-config.yaml` currently contains a whitespace typo in its root key (`digital_ india_project`) which the parser flags and offers to normalize via reviewed schema migration.

## 3. Backup, Recovery, and Retention (`DIPINDIA` Admin APIs)

Verified administrative operations in `DIPINDIA/worker/routes/adminRoutes.ts` (all gated by `requirePermission('settings.manage')`):
- `GET /api/admin/backups` — List recorded backup snapshots.
- `POST /api/admin/backups/export` — Trigger a controlled backup export.
- `POST /api/admin/backups/:id/verify` — Verify backup checksum/integrity.
- `GET /api/admin/backups/:id/download` — Download verified snapshot.
- `POST /api/admin/storage/enforce-retention` — Apply configured document retention policy.

## 4. Logging, Monitoring, and Status Boundaries

- **Correlation IDs:** `dip-api` attaches `X-Correlation-Id` to every response and `ErrorEnvelope`.
- **Non-Sensitive Metrics:** `GET /api/v1/metrics` exposes aggregated route request and error counts without PII or payload contents.
- **Health Checks (`dip-status` Principles):** Public health checks must be read-only, map to logical components rather than internal server hostnames, and keep private diagnostics separate from public incident updates.

## 5. Release and Incident Process

1. All changes land on review branches (`development/*` or `review/*`) and pass CI checks before approval.
2. Production infrastructure, DNS, Cloudflare, Firebase, and payment cutovers require explicit owner approval and cutover verification (`POST /api/admin/payments/cutover-check`).
3. Security or data-exposure incidents follow [Security Policy](../SECURITY.md#7-incident-response).
