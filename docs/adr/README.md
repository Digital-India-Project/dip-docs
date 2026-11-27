# Architecture Decision Records (ADRs)

**Audience:** Architects, Maintainers, Contributors  
**Access Class:** Developer  
**Owner:** `dip-docs` maintainers  
**Implementation Status:** Implemented and verified  
**Last Verified:** 2026-11-27

## 1. Purpose

This directory records architectural decisions for `Digital-India-Project/dip-docs`, explicitly capturing decisions already taken, decisions requiring cross-repository coordination, verified assumptions, and trade-offs.

## 2. ADR Index

| ID | Decision Title | Status | Requires Cross-Repo Coordination |
|---|---|---|---|
| [ADR-0001](0001-vite-react-documentation-runtime.md) | Preserve Vite + React 19 Documentation SPA Runtime | Accepted | Yes (`dip-infrastructure` hosting / access control) |
| [ADR-0002](0002-dip-ui-token-parity-without-runtime-coupling.md) | Mirror `dip-ui` CSS Custom Properties Without Unpublished Package Coupling | Accepted | Yes (`dip-ui` registry publication) |
| [ADR-0003](0003-dipindia-source-of-truth-and-sandbox-labeling.md) | Enforce `DIPINDIA`-First Truthfulness and Explicit Sandbox Labeling | Accepted | Yes (`DIPINDIA`, `dip-api`, `dip-status`) |
| [ADR-0004](0004-ci-contract-validation-and-manifest-sync.md) | Automate Manifest, OpenAPI, Link, and Security Validation in CI | Accepted | Yes (`dip-api`, `dip-sdk`, `dip-core`) |
