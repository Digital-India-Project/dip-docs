# Integrations and Provider Status

**Audience:** Developers, Partners, Operators, Architects  
**Access Class:** Public / Developer  
**Owner:** `DIPINDIA` & `dip-api` maintainers  
**Implementation Status:** Mixed (Verified payment/worker paths vs Sandbox & Planned connectors)  
**Last Verified:** 2026-11-27

## 1. Honest Integration Classification

Digital India Project strictly separates verified production-capable integrations from sandbox adapters and planned/unconnected provider boundaries. **Do not assume commercial onboarding, government API approval, or live credentials exist unless explicitly verified below.**

| Integration / Provider | Where Found | Current Verified Status | Notes & Constraints |
|---|---|---|---|
| **Cashfree Payments** | `DIPINDIA` (`cashfreeService.ts`), `dip-api` (`CashfreeAdapter.ts`), `dip-sdk` (`webhooks`) | Implemented in `DIPINDIA` (`sandbox` / `production` config); Mock or sandbox only in `dip-api` | Requires authorized merchant credentials & webhook secret; never stored in docs |
| **API Sathi** | `DIPINDIA` (`apiSathiRoutes.ts`, `apiSathiService.ts`), `dip-sdk` (`ApiSathiClient`) | Implemented in `DIPINDIA` worker; absent in `dip-api` | Handles `/api/v1/apisathi/status`, `/catalogue`, `/verify`, `/queue` |
| **API Setu** | `DIPINDIA` (`apiSetuService.ts`, `worker/index.ts`), `dip-api` (`ProviderRegistry`) | Implemented routes in `DIPINDIA` (`/api/v1/apisetu/*`); interface/contract only in `dip-api` | External execution depends on valid authorized provider credentials |
| **DigiLocker / Entity Locker** | `DIPINDIA` (`worker/index.ts`, `apiSathiRoutes.ts`), `dip-api` (`digilocker_planned`) | `planned_unconnected` in `dip-api`; gated workflow hooks in `DIPINDIA` | No government credentials or live access verified in `dip-api` or `dip-docs` |
| **GST / PAN Verification** | `dip-api` (`gst_sandbox_adapter`, `pan_sandbox_adapter`) | Mock or sandbox only | Returns synthetic results (`sbx_*_001`) in sandbox; blocked in `strict` mode |
| **Email Alerts (`paymentAlertService`)** | `DIPINDIA` (`paymentAlertService.ts`) | Implemented and verified in `DIPINDIA` | Dispatches payment status alert emails when configured |
| **SMS / WhatsApp Messaging** | `DIPINDIA` (`rbac.ts` `integrations.manage`), `dip-api` (`messaging` category) | Planned / Configuration hook | Admin configuration slot exists; live messaging provider depends on tenant credentials |

## 2. `dip-api` Provider Registry Lifecycle

In `dip-api/src/server/adapters/providers/ProviderRegistry.ts`:
- `GET /api/v1/integrations/providers` returns metadata for registered adapters (`id`, `category`, `adapter_mode`, `contract_approved`, `timeout_ms`, `max_retries`, `circuit_state`).
- `POST /api/v1/integrations/providers/:providerId/sandbox-check` only executes when `adapter_mode === 'sandbox'`. When `adapter_mode === 'planned_unconnected'` or `strict`, it returns `503 PROVIDER_UNAVAILABLE`.

## 3. Compliance and Government Positioning Reminder

Presence of integration adapters or catalogue entries for `DigiLocker`, `Entity Locker`, or `API Setu` does **not** imply government ownership, endorsement, or active institutional authorization.
