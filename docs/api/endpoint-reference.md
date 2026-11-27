# API Endpoint Reference and Coverage Matrix

**Audience:** Developers, API Consumers  
**Access Class:** Developer  
**Owner:** `dip-api` & `DIPINDIA` maintainers  
**Implementation Status:** Mock or sandbox only (`dip-api`); Implemented and verified (`DIPINDIA` worker)  
**Last Verified:** 2026-11-27

## 1. Verified `/api/v1` Gateway Endpoints (`dip-api`)

Every endpoint below is verified directly against `dip-api/src/server/routes/v1/` and `dip-api/docs/ENDPOINT_CATALOGUE.md`. Machine-readable specification: [OpenAPI 3.1.0](openapi.json).

| Method | Path | Auth & Scope | Idempotency | Backing Status |
|---|---|---|---|---|
| `GET` | `/api/v1/health` | Public (none) | No | Implemented (Gateway runtime) |
| `GET` | `/api/v1/metrics` | Public (non-sensitive counts) | No | Implemented (`ObservabilityRegistry`) |
| `GET` | `/api/v1/openapi.json` | Public (none) | No | Implemented (`buildOpenApiDocument`) |
| `GET` | `/api/v1/services` | Public (none) | No | Sandbox (`IDipindiaAdapter`) |
| `GET` | `/api/v1/services/:serviceId` | Public (none) | No | Sandbox (`IDipindiaAdapter`) |
| `GET` | `/api/v1/products` | Public (none) | No | Sandbox (`IDipindiaAdapter`) |
| `GET` | `/api/v1/products/:productId` | Public (none) | No | Sandbox (`IDipindiaAdapter`) |
| `GET` | `/api/v1/applications` | Bearer JWT (`applications:read`) | No | Sandbox (`IDipindiaAdapter`) |
| `POST` | `/api/v1/applications` | Bearer JWT (`applications:write`) | Required | Sandbox (`IDipindiaAdapter`) |
| `GET` | `/api/v1/applications/:applicationId` | Bearer JWT (`applications:read` + owner) | No | Sandbox (`IDipindiaAdapter`) |
| `PATCH` | `/api/v1/applications/:applicationId` | Bearer JWT (`applications:write` + owner) | No | Sandbox (`IDipindiaAdapter`) |
| `POST` | `/api/v1/applications/:applicationId/submit` | Bearer JWT (`applications:write` + owner) | Required | Sandbox (`IDipindiaAdapter`) |
| `POST` | `/api/v1/applications/:applicationId/transition` | Bearer JWT (`workflow:review` + tenant) | Required | Sandbox (`IDipindiaAdapter`) |
| `GET` | `/api/v1/applications/:applicationId/documents` | Bearer JWT (`documents:read` + owner) | No | Sandbox (`IDipindiaAdapter`) |
| `POST` | `/api/v1/applications/:applicationId/documents/upload-intent` | Bearer JWT (`documents:write` + owner) | Required | Sandbox (`IDipindiaAdapter`) |
| `POST` | `/api/v1/payments/orders` | Bearer JWT (`payments:write` + owner) | Required | Sandbox (`ICashfreeAdapter`) |
| `GET` | `/api/v1/payments/orders/:orderId` | Bearer JWT (`payments:read` + owner) | No | Sandbox (`ICashfreeAdapter`) |
| `POST` | `/api/v1/payments/orders/:orderId/refunds` | Bearer JWT (`payments:refund` + tenant) | Required | Sandbox (`ICashfreeAdapter`) |
| `POST` | `/api/v1/payments/webhooks/cashfree` | HMAC-SHA256 + Timestamp | Deduplicated | Sandbox (`ICashfreeAdapter`) |
| `GET` | `/api/v1/webhooks/subscriptions` | Bearer JWT (`webhooks:read` + tenant) | No | Implemented (`WebhookService`) |
| `POST` | `/api/v1/webhooks/subscriptions` | Bearer JWT (`webhooks:write` + tenant) | Required | Implemented (`WebhookService`) |
| `GET` | `/api/v1/webhooks/deliveries` | Bearer JWT (`webhooks:read` + tenant) | No | Implemented (`WebhookService`) |
| `GET` | `/api/v1/integrations/providers` | Bearer JWT (`integrations:read`) | No | Implemented (`ProviderRegistry`) |
| `POST` | `/api/v1/integrations/providers/:providerId/sandbox-check` | Bearer JWT (`integrations:write`) | No | Sandbox only (`ProviderRegistry`) |
| `POST` | `/api/v1/sandbox/token` | Non-production only | No | Sandbox only (Disabled in prod) |

## 2. Example Request and Response (`POST /api/v1/applications`)

```bash
curl -s -X POST http://localhost:3000/api/v1/applications \
  -H "Authorization: Bearer <SANDBOX_JWT>" \
  -H "Idempotency-Key: idem_app_create_0001" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "srv_udyam_reg",
    "business_name": "Example Traders Pvt Ltd",
    "form_data": { "entity_type": "private_limited" },
    "submit_immediately": false
  }'
```

## 3. `DIPINDIA` Worker Routes Compatibility Matrix

These routes exist in `DIPINDIA/worker/routes/*` for the active portal and are tracked for future migration or adapter wiring:

| Domain | `DIPINDIA` Worker Path | Parity in `dip-api` | Notes |
|---|---|---|---|
| Session profile | `GET /api/v1/auth/me` | Planned (missing in `dip-api`) | Defined as planned type in `dip-sdk/src/contracts/planned.ts` |
| Form validation | `POST /api/v1/forms/validate` | Planned (missing in `dip-api`) | Defined as planned type in `dip-sdk/src/contracts/planned.ts` |
| Document binary download | `GET /api/storage/files/:id/download`, `GET /api/v1/documents/:id/download` | Blocked by dependency | `dip-api` currently implements upload-intent & listing only |
| Support tickets | `GET` / `POST /api/v1/tickets`, `POST /api/v1/tickets/:id/reply` | Not yet in `dip-api` | Active in `DIPINDIA/worker/routes/unifiedRoutes.ts` |
| Partner & B2B console | `/api/v1/partners/*`, `/api/v1/b2b/*`, `/api/v1/settlements/*` | Not yet in `dip-api` | Active in `DIPINDIA/worker/routes/unifiedRoutes.ts` |
| API Sathi gateway | `GET /api/v1/apisathi/status`, `POST /api/v1/apisathi/verify` | Not in `dip-api` | Supported in `dip-sdk` via `ApiSathiClient` |
| Admin operations | `/api/admin/*` | Internal only (`DIPINDIA`) | Protected by `requirePermission(...)`; not exposed in public gateway |
