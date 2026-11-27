# DIP Docs — Shared Integration Contracts and Architecture Decisions

**Audience:** Repository Owners, Architects, Developers  
**Access Class:** Developer  
**Owner:** `dip-docs` maintainers  
**Implementation Status:** Implemented and verified  
**Last Verified:** 2026-11-27

## 1. Scope and Ownership Boundary

`Digital-India-Project/dip-docs` owns documentation aggregation, navigation, bilingual English/Hindi guides, OpenAPI reference rendering, and documentation CI validation. `dip-docs` does not own application databases, runtime HTTP APIs, authentication servers, or deployment secrets.

Machine-readable manifest: `integration/manifest.json`. See also the [Compatibility Matrix](COMPATIBILITY_MATRIX.md) and [Architecture Decision Records](adr/README.md).

## 2. Decisions Made Independently in `dip-docs`

1. **Preserve Vite + React 19 SPA runtime (`ADR-0001`):** Kept the existing Vite + React 19 + TypeScript 5.8 build pipeline and extracted pure parsing/search functions into `src/data/docUtils.ts` so application logic can be unit-tested cleanly in Node.js 22.
2. **Adopt `dip-ui` CSS tokens locally (`ADR-0002`):** Mirrored semantic `--dip-*` light/dark custom properties and typography scales from `dip-ui@0.4.0` (`src/lib/tokens/tokens.css`) into `src/styles/dip-tokens.css` rather than introducing broken registry imports.
3. **Maintain OpenAPI 3.1.0 snapshot (`docs/api/openapi.json`):** Mirrored the verified 22 paths (25 operations) under `/api/v1` from `dip-api/src/server/routes/v1/` and explicitly labeled sandbox adapters (`IDipindiaAdapter`, `ICashfreeAdapter`).
4. **Enforce registry & safety CI (`ADR-0004`):** Automated link checking, heading anchor validation, OpenAPI validation, `integration/manifest.json` checks, secret scanning, and `node:test` unit/contract/security suites.

## 3. Decisions Requiring Cross-Repository Coordination

| Topic | Coordinating Repositories | Open Question / Action Required | Current Safe Mitigation in `dip-docs` |
|---|---|---|---|
| `Internal` doc access control | `dip-docs`, `dip-infrastructure`, `dip-security` | Static Vite builds bundle all registered Markdown chunks. Hosting-layer auth (e.g., Cloudflare Access) or split audience builds must gate `Internal` docs before public hosting. | Audience classification metadata (`Public`, `Developer`, `Partner`, `Internal`) enforced on every `DocEntry`; no secrets stored anywhere in repo. |
| Package naming alignment (`dip-core`) | `dip-core`, `dip-sdk`, `dip-docs` | `dip-core/package.json` declares `"name": "@dip/core"`, while `dip-sdk/docs/COMPATIBILITY.md` references `@digital-india/core`. | Explicitly flagged as a compatibility warning in [Compatibility Matrix](COMPATIBILITY_MATRIX.md) and `integration/manifest.json`. |
| Unpublished shared npm packages | `dip-ui`, `dip-core`, `dip-sdk`, `dip-docs` | `@digital-india-project/dip-ui`, `@dip/core`, and `@digital-india/sdk` are not published to public npm yet. | CSS tokens mirrored cleanly in `src/styles/dip-tokens.css`; SDK guides mark registry installation as coordinated pre-release guidance. |
| `dip-api` <-> `DIPINDIA` route parity | `DIPINDIA`, `dip-api`, `dip-sdk` | `DIPINDIA` worker routes (`/api/v1/auth/me`, `/api/v1/forms/validate`, document downloads, tickets, partners) are not yet wired into `dip-api`. | Explicitly separated in [Endpoint Reference](api/endpoint-reference.md) with `Planned` and `Blocked by dependency` labels. |
| `dip-status` telemetry schema | `dip-status`, `dip-docs`, `dip-infrastructure` | `dip-status` currently contains only planning Markdown and has no `package.json` or JSON status feed schema. | Documented as `Planned` in [Infrastructure & Ops](infrastructure/infrastructure-and-operations.md) and `integration/manifest.json`. |

## 4. Contracts Consumed Across the Ecosystem

| Source Repository | Consumed Artifact / Interface | Version / Commit | Consumption Mode |
|---|---|---|---|
| `DIPINDIA` | `src/lib/rbac.ts`, `src/lib/serviceCatalogue.ts`, `worker/routes/*`, `.env.example` | `main` (`04542ec`) | Read-only verification into guides, RBAC matrix (`RolePermissionMatrix`), and compatibility notes |
| `dip-api` | `src/server/routes/v1/openapi.ts`, `docs/COMPATIBILITY.md`, `ErrorEnvelope` | `0.1.0` (`c3348d5`) | Static snapshot at `docs/api/openapi.json` powering `ApiEndpointExplorer` and API guides |
| `dip-sdk` | `DIPClient`, `ApiSathiClient`, `@digital-india/sdk/webhooks`, error & retry contracts | `0.2.0` (`926cee4`) | Verified developer guides and snippet alignment |
| `dip-ui` | `src/lib/tokens/tokens.css`, typography scale, focus/motion tokens | `0.4.0` (`1b99701`) | Semantic CSS token mirror in `src/styles/dip-tokens.css` verified by contract tests |
| `dip-core` | `@dip/core` exports, integer-paise `Money`, `dipindiaAdapters.ts` | `0.2.0` (`f3bdc28`) | Documented domain & compatibility boundaries |
| `dip-security` | `packages/*` contracts (`Principal`, `DipRole`, `DipPermission`, webhook HMAC) | `0.1.0` (`c9f39f5`) | Verified security architecture and policy docs |
| `dip-automation` | `TaskEngine`, `WorkflowEngine`, `jobs.yaml`, event envelopes | `0.1.0` (`b9ce7f3`) | Verified automation runbooks (`Mock or sandbox only`) |
| `dip-infrastructure` | Cloudflare D1/R2 quotas, Docker/Postgres templates, CI checks | `1.0.0` (`d602b2c`) | Verified operational & environment variable documentation |
| `dip-status` | Planning health & incident definitions | `0.0.0` (`8fa3578`) | Documented as `Planned` status principles only |

## 5. Contracts Provided by `dip-docs`

- **TypeScript Documentation Registry (`src/data/docs.ts`):** Exports `DOCS`, `OPENAPI_SPEC`, `resolveDocByHref`, `slugifyHeading`, and strict metadata interfaces (`DocEntry`, `AudienceClass`, `ImplementationStatus`).
- **Pure Documentation Utilities (`src/data/docUtils.ts`):** Exports Node-testable heading extraction, search scoring, safe URL validation (`isSafeHref`), and path resolution utilities.
- **Machine-Readable Artifacts:** `integration/manifest.json`, `docs/api/openapi.json`, `public/sitemap.xml`, and `public/robots.txt`.
- **No Runtime Backend API:** `dip-docs` exposes zero server HTTP endpoints and requires zero runtime credentials or databases.

## 6. Assumptions, Compatibility Risks, and Breaking Change Policy

- **Assumptions:** Upstream `DIPINDIA` remains the functional authority for business workflows, permissions, and service categories during gradual modularization. Any cross-repo endpoint without code verification is excluded.
- **Compatibility Risks:**
  1. Legacy `bun.lock` remains in the repository root alongside npm `package-lock.json` workflows; package installations use `npm` (`package.json`) while `bun.lock` is untouched unless cleanup is coordinated.
  2. GitHub upstream `dip-docs` contains `main` (`1d9808a`) and `review/planning-dip-docs` (`a954e0b`), whereas this isolated workspace started from `b2c6d8f` and commits strictly to `development/documentation-foundation` without pushing to `main` or `master`.
- **Breaking Changes Policy:** Changes to `DocEntry` fields, OpenAPI snapshot paths, or `integration/manifest.json` keys require synchronized updates to `scripts/validate-docs.mjs` and `tests/contract/`.
