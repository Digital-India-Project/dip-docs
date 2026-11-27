# Manager and Operator Guide

**Audience:** Managers (`manager`), Operators (`operator`)  
**Access Class:** Internal / Role-Scoped  
**Owner:** `DIPINDIA` maintainers  
**Implementation Status:** Implemented and verified (`DIPINDIA/src/lib/rbac.ts`, `DIPINDIA/src/lib/workflow.ts`)  
**Last Verified:** 2026-11-27

## 1. Manager Guide (`manager`)

Managers coordinate operational throughput, team assignments, partner oversight, and escalations without holding global system settings, refund execution, or RBAC configuration privileges.

### Verified Navigation (`getPrimaryNavForRole('manager')`)
- **SLA Queue** (`manager` / `sla`)
- **Assign Team** (`manager` / `assign`)
- **Escalations** (`manager` / `escalations`)
- **Partner Oversight** (`manager` / `partners`)
- **Reports** (`manager` / `reports`)

### Verified Manager Permissions (11 `PermissionCode` grants)
- **Applications:** `applications.view`, `applications.create`, `applications.assign`, `applications.process`, `applications.verify_documents`, `applications.request_correction`, `applications.complete`
- **Governance & Partners:** `operators.assign`, `partners.manage`
- **Finance & Analytics:** `payments.view`, `reports.view`

### Key Manager Workflows
1. **Operator KYC & Assignment:** Review operator KYC submissions (`Not Submitted` → `KYC Submitted` → `Under Verification` → `Approved` / `Rejected` / `Resubmission Required`) and assign operators to incoming queues (`operators.assign`, `applications.assign`).
2. **Escalation Handling:** Reassign stalled applications, inspect correction cycles, and oversee transitions through `Under Review`, `Assigned`, `Processing`, and `Awaiting External Authority`.
3. **Partner Oversight:** Monitor partner-assisted filings and approval states (`partners.manage`).
4. **Operational Reporting:** View SLA and revenue summaries (`reports.view`, `payments.view`).

*Restrictions:* Managers cannot cancel applications (`applications.cancel`), issue refunds (`payments.refund`), modify services (`services.*`), or edit global settings (`settings.manage`).

---

## 2. Operator Guide (`operator`)

Operators execute day-to-day application processing, walk-in intake, document verification, and deliverable completion.

### Verified Navigation (`getPrimaryNavForRole('operator')`)
- **Operator Desk** (`operator` / `queue`)
- **Walk-In Intake** (`operator` / `intake`)
- **My KYC** (`operator-enroll`)
- **Services** (`services`)
- **Workspace** (`workspace`)

### Verified Operator Permissions (7 `PermissionCode` grants)
- `applications.view` — View assigned applications in queue.
- `applications.create` — File walk-in / operator-assisted applications (`operator_assisted` channel).
- `applications.process` — Advance workflow stages (`Under Review` → `Processing` / `Awaiting External Authority`).
- `applications.verify_documents` — Verify or reject uploaded supporting documents.
- `applications.request_correction` — Transition applications to `Documents Required` or `Correction Required` with remarks.
- `applications.complete` — Upload final deliverables and mark applications `Completed`.
- `payments.view` — Verify payment confirmation status before advancing verification.

### Operator KYC Gate
If an operator's `kycStatus` is anything other than `Approved`, `getHomeRouteForRole()` directs them to `operator-enroll` (`My KYC`) until verification is completed by a manager or administrator.

### Standard Processing Checklist
1. Confirm payment state is `Payment Confirmed` / `Payment Successful` before starting formal verification.
2. Inspect uploaded documents for completeness and legibility.
3. If records are missing or invalid, transition to `Documents Required` or `Correction Required` with clear instructions so the applicant can submit a `Resubmitted` update.
4. Advance verified filings through `Processing` and (if applicable) `Awaiting External Authority`, then upload deliverables to reach `Completed`.
