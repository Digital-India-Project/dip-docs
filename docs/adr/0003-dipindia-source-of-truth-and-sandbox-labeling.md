# ADR-0003: Enforce `DIPINDIA`-First Truthfulness and Explicit Sandbox Labeling

**Status:** Accepted  
**Date:** 2026-11-27  
**Owner:** `dip-docs` maintainers  
**Related Repositories:** `DIPINDIA`, `dip-api`, `dip-sdk`, `dip-automation`, `dip-status`

## 1. Context

Across the 10-repository Digital India Project ecosystem, implementation maturity varies significantly: `DIPINDIA` is the active functional Cloudflare Worker + React portal authority, `dip-api` and `dip-automation` currently run with sandbox/in-memory adapters, and `dip-status` contains only planning documentation with no runtime package or status JSON endpoints.

## 2. Decision

Enforce strict factual provenance rules across every document, OpenAPI reference, and manifest entry in `dip-docs`:

1. Record `DIPINDIA` as the authoritative source for verified RBAC roles (7 roles, 22 `PermissionCode` entries), `ApplicationStatus` states (24 total, 14 canonical), and service categories (`CAT_A`–`CAT_H`).
2. Tag every documented endpoint, module, or integration with one of the 7 explicit statuses (`Implemented and verified`, `Implemented but not fully verified`, `Interface or contract only`, `Mock or sandbox only`, `Planned`, `Blocked by dependency`, `Deprecated`).
3. Reject any unverified endpoint paths, placeholder metrics, live provider claims, or external portal links that do not exist in inspected source code.

## 3. Consequences & Open Coordination

- `docs/api/openapi.json` mirrors `dip-api/src/server/routes/v1/` (22 paths / 25 operations) and explicitly labels adapter-backed operations as sandbox-backed (`IDipindiaAdapter`, `ICashfreeAdapter`) until `dip-api` wires live `DIPINDIA` bridges.
- `dip-status` health feeds remain documented as `Planned` until `dip-status` introduces code and schemas.
- External verification providers (`API Setu`, `DigiLocker`, `Entity Locker`, `e-Stamp`) remain documented strictly at their verified state in `DIPINDIA` / `dip-api` without assuming live production activation.
