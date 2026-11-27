# Partner, Customer, and Business User Guide

**Audience:** Partners (`partner`), Customers (`customer`), Business Users (`business`)  
**Access Class:** Public / Partner  
**Owner:** `DIPINDIA` maintainers  
**Implementation Status:** Implemented and verified (`DIPINDIA/src/lib/rbac.ts`, `DIPINDIA/worker/routes/unifiedRoutes.ts`)  
**Last Verified:** 2026-11-27

## 1. Partner Guide (`partner`)

Partners represent external assisted-filing channels (`individual_agent`, `csc_center`, `franchise`, `corporate_connector`) submitting applications on behalf of end customers.

### Verified Navigation (`getPrimaryNavForRole('partner')`)
- **Partner Desk** (`partner` / `overview`)
- **My Customers** (`partner` / `customers`)
- **Assisted Filings** (`partner` / `applications`)
- **Payout Wallet** (`partner` / `wallet`)
- **Services** (`services`)

### Verified Partner Permissions (5 `PermissionCode` grants)
- `applications.view`, `applications.create` (`partner_assisted` source channel), `applications.request_correction`, `payments.view`, `reports.view`.

### Partner Workflows
- **Enrollment:** Register partner profile via `POST /api/v1/partners/enroll`. Approval progresses through `Pending Approval` → `Approved`.
- **Customer Directory:** List (`GET /api/v1/partners/customers`) and register (`POST /api/v1/partners/customers`) partner-scoped customer profiles.
- **Settlements:** Review wallet balance (`GET /api/v1/settlements`) and request commission payouts (`POST /api/v1/settlements/request`) governed by configured commission rules.

---

## 2. Customer Guide (`customer`)

`customer` is the default role for individual applicants using the self-service portal.

### Verified Navigation (`getPrimaryNavForRole('customer')`)
- **My Dashboard** (`dashboard` / `overview`)
- **Services** (`services`)
- **My Applications** (`dashboard` / `applications`)
- **Doc Vault** (`dashboard` / `documents`)
- **Track & Help** (`track`)

### Verified Customer Permissions (4 `PermissionCode` grants)
- `applications.view`, `applications.create` (`web_b2c` channel), `applications.request_correction` (respond to correction requests), `payments.view`.

### Customer Journey
1. **Discover Services:** Filter the 8 catalogue categories or search services on `Services`.
2. **Submit & Pay:** Fill service-specific form fields, upload required documents, and complete payment checkout.
3. **Respond to Corrections:** When status enters `Documents Required` or `Correction Required`, upload revised documents to transition to `Resubmitted`.
4. **Track & Support:** Check real-time stage progress (`TrackPage` / `POST /api/v1/applications/track`) or open a support ticket (`GET`/`POST /api/v1/tickets`).

---

## 3. Business / B2B User Guide (`business`)

Business accounts support organizations running higher-volume verification, bulk checks, and API integrations.

### Verified Navigation (`getPrimaryNavForRole('business')`)
- **B2B Console** (`b2b` / `overview`)
- **API Playground** (`b2b` / `playground`)
- **Bulk Verify** (`b2b` / `bulk`)
- **API Keys** (`b2b` / `apikeys`)
- **Audit Logs** (`b2b` / `history`)

### Verified Business Permissions (4 `PermissionCode` grants)
- `applications.view`, `applications.create` (`b2b_portal` channel), `payments.view`, `reports.view`.

### Verified B2B Endpoints (`unifiedRoutes.ts`)
- **Profile & Team:** `GET`/`POST /api/v1/b2b/profile`, `GET`/`POST /api/v1/b2b/members`.
- **API Credentials:** `POST /api/v1/b2b/rotate-key` to rotate organization API keys.
- **Bulk Processing:** `GET /api/v1/b2b/bulk-jobs` to inspect bulk verification jobs.
- **Invoices & Refunds:** `GET /api/v1/invoices`, `GET`/`POST /api/v1/refunds`.
