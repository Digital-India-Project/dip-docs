# SDK Guide (`@digital-india/sdk`)

**Audience:** TypeScript & JavaScript Developers (Node.js & Browser)  
**Access Class:** Developer  
**Owner:** `dip-sdk` maintainers  
**Implementation Status:** Implemented and verified against `dip-api` sandbox (`DIPClient` in `dip-sdk`)  
**Last Verified:** 2026-11-27

## 1. Installation and Runtimes

`@digital-india/sdk` supports both Node.js (`>=18` / `22.x`) and modern browsers using standard `fetch`:

```bash
npm install @digital-india/sdk
```

- **Browser safety:** Never embed secret HMAC keys or Cashfree webhook secrets in browser bundles. Use short-lived user-scoped `TokenProvider` callbacks in browsers, and import webhook signature helpers exclusively from `@digital-india/sdk/webhooks` on the server.

## 2. Initializing `DIPClient`

```typescript
import { DIPClient } from '@digital-india/sdk';

const client = new DIPClient({
  baseUrl: 'https://api-sandbox.example.invalid/api/v1',
  getToken: async () => process.env.DIP_ACCESS_TOKEN ?? '',
});
```

## 3. Verified Resource Modules

Every resource module below is implemented on `DIPClient` in `dip-sdk/src/core/dipClient.ts`:

| Property | Class | Verified Methods |
|---|---|---|
| `client.health` | `HealthClient` | `getHealth()`, `getMetrics()`, `getOpenApiSpec()` |
| `client.services` | `ServicesClient` | `list()`, `get()` |
| `client.products` | `ProductsClient` | `list()`, `get()` |
| `client.applications` | `ApplicationsClient` | `list()`, `get()`, `create()`, `update()`, `submit()` |
| `client.workflow` | `WorkflowClient` | `transition()` |
| `client.documents` | `DocumentsClient` | `listForApplication()`, `createUploadIntent()` |
| `client.payments` | `PaymentsClient` | `createOrder()`, `getOrder()`, `requestRefund()` |
| `client.webhooks` | `WebhooksClient` | `listSubscriptions()`, `createSubscription()`, `listDeliveries()` |
| `client.integrations` | `IntegrationsClient` | `listProviders()`, `executeSandboxCheck()` |
| `client.sandbox` | `SandboxAuthClient` | `issueToken()` (rejected automatically if `environment === 'production'`) |

## 4. Error Handling, Pagination, Retries, and Idempotency

- **Typed Errors:** `DIPAuthenticationError`, `DIPValidationError`, `DIPUnexpectedResponseError`, and `mapHttpErrorToDIPAPIError` preserve HTTP status, `code`, `correlationId`, and `retryAfterSeconds`.
- **Retries:** `isRequestEligibleForRetry()` performs bounded exponential backoff (`computeBackoffDelayMs`) for safe `GET` operations and `429`/`503` transient errors. Mutating payment creation (`payments.createOrder`) and refund (`payments.requestRefund`) calls are **never blindly retried**.
- **Idempotency:** Mutating calls accept or generate an `Idempotency-Key` matching `^[a-zA-Z0-9_-]{8,128}$`.
- **Redaction:** `redactHeaders()` and `redactUrl()` scrub `Authorization` headers and sensitive query parameters before logging.

## 5. Server-Side Cashfree Webhook Verification

```typescript
import { verifyCashfreeWebhookSignature } from '@digital-india/sdk/webhooks';

const isValid = verifyCashfreeWebhookSignature({
  rawBody,
  signature: req.headers['x-webhook-signature'],
  timestamp: req.headers['x-webhook-timestamp'],
  secret: process.env.CASHFREE_WEBHOOK_SECRET!,
});
```

## 6. Legacy Client & Compatibility Notes

- **`ApiSathiClient`:** Preserved for `DIPINDIA` worker compatibility (`getGatewayStatus()` targeting `/api/v1/apisathi/status`, plus legacy `getStatus()`).
- **`ApiClient` (v0.1.0 Axios):** Preserved for backwards compatibility; prefer `DIPClient` for new integrations.
- **Deprecated Services:** `DatabaseClient` (`/data/:collection`) and `StorageClient` (`/storage/objects/:key`) are marked `@deprecated` due to missing/mismatched backend endpoints—use `client.documents` instead.
