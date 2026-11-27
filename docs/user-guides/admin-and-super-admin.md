# Super Administrator and Administrator Guide

**Audience:** Super Administrators (`super_admin`), Administrators (`admin`)  
**Access Class:** Internal  
**Owner:** `DIPINDIA` maintainers  
**Implementation Status:** Implemented and verified (`DIPINDIA/src/lib/rbac.ts`, `DIPINDIA/worker/routes/adminRoutes.ts`)  
**Last Verified:** 2026-11-27

## 1. Role Scope and Navigation

In `DIPINDIA`, both `super_admin` and `admin` normalize via `isSuperAdminRole()` to full administrative access across all 22 `PermissionCode` permissions. Their verified primary navigation tabs (`getPrimaryNavForRole('admin')`) are:

- **Overview** (`admin` / `overview`)
- **Operations** (`admin` / `applications`)
- **Services & Forms** (`admin` / `services`)
- **Partners & Team** (`admin` / `users`)
- **Payments & Audit** (`admin` / `payments`)

> [!WARNING]
> Administrative routes in `worker/routes/adminRoutes.ts` enforce `requireAuth` plus granular `requirePermission(...)` checks on every handler. Never bypass server-side permission checks or expose admin operational endpoints in public client documentation.

## 2. Verified Administrative Capabilities

### Platform Settings, RBAC & Governance
- **Global Business & GST Settings (`settings.manage`):** Read (`GET /api/admin/settings`) and update (`PUT /api/admin/settings`) platform settings.
- **Role Permission Matrix (`rbac.manage`):** Customize per-role `PermissionCode` assignments stored in `customMatrix`.
- **User Management (`users.manage`):** Manage user profiles, roles, account types, and active status.
- **Security Audit Logs (`audit_logs.view`):** Inspect recorded administrative and security actions (`GET /api/admin/audit-logs`).

### Service Catalogue & Content Management
- **Dynamic Services & Forms (`services.create`, `services.edit`, `services.publish`):** Create, version, publish/unpublish services, import catalogue payloads (`POST /api/admin/catalogue/import`), inspect import logs (`GET /api/admin/catalogue/import-logs`), and synchronize catalogue state (`POST /api/admin/catalogue/sync`).
- **Coupons & Quotes (`services.edit` / `applications.view`):** List and create coupons (`/api/admin/coupons`) and review/update quotes (`/api/admin/quotes`).
- **Editorial Blog Management (`services.edit`):** Manage blog entries and revision history (`/api/admin/blog`).

### Financial Oversight, Refunds & Reconciliation
- **Payment Analytics & Ledger (`requireAdminPaymentAccess`):** Review payment analytics (`GET /api/admin/payments/analytics`), transactions (`GET /api/admin/payments`), refunds (`GET /api/admin/payments/refunds`), and digital product orders (`GET /api/admin/digital-orders`).
- **Refund Processing (`payments.refund`):** Issue refunds (`POST /api/v1/payments/orders/:orderId/refund`) and replay webhook events (`POST /api/admin/payments/webhooks/:eventId/replay`).
- **Reconciliation & Gateway Config (`integrations.manage` / `requireAdminPaymentAccess`):** Run payment reconciliation (`POST /api/admin/payments/reconcile`), inspect/update payment configuration (`/api/admin/payments/config`), and execute cutover checks (`POST /api/admin/payments/cutover-check`).
- **Commissions & Settlements (`commissions.manage`):** Configure partner commission rules (`POST /api/v1/commissions/rules`).

### Infrastructure, Backups & Storage Retention
- **Infrastructure Health (`settings.manage`):** View infrastructure status (`GET /api/admin/infrastructure`) and trigger read-only health checks (`POST /api/admin/infrastructure/health-check`).
- **Backups (`settings.manage`):** List backups (`GET /api/admin/backups`), export snapshots (`POST /api/admin/backups/export`), verify integrity (`POST /api/admin/backups/:id/verify`), and download verified archives (`GET /api/admin/backups/:id/download`).
- **Storage Retention (`settings.manage`):** Enforce retention policies (`POST /api/admin/storage/enforce-retention`).

## 3. Distinction Between `super_admin` and `admin`

At the `src/lib/rbac.ts` code level, `isSuperAdminRole(role)` returns `true` for both `super_admin` and `admin`, granting identical baseline permissions. Organizations should still separate **Super Administrator** duties (RBAC policy changes, payment gateway configuration, backup exports, and retention enforcement) from **Administrator** duties (daily operations, service catalogue maintenance, and user/partner oversight) through operational governance and audit log review.
