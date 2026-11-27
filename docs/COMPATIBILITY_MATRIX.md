# Digital India Project — Ecosystem Compatibility Matrix

**Audience:** Architects, Repository Owners, Release Managers  
**Access Class:** Developer  
**Owner:** `dip-docs` maintainers  
**Implementation Status:** Implemented and verified (via read-only source inspection)  
**Last Verified:** 2026-11-27

## 1. Audited 10-Repository Compatibility Table

Every row below reflects direct read-only inspection of the repository source, `package.json`, `.env.example`, and documentation contracts on 2026-11-27.

| Repository | Package Name & Version | Inspected Branch & Commit | Runtime / Stack | Sync Contract Status | Observed Drift or Blocker |
|---|---|---|---|---|---|
| `DIPINDIA` | `dipindia-react-vite` (private portal) | `main` (`04542ec`) | React 19, Vite 8, Cloudflare Workers (Hono 4, 10 D1 DBs, 10 R2 buckets) | **Verified Authority** | Worker routes (`tickets`, `partners`, `forms/validate`, `auth/me`) ahead of `dip-api` parity |
| `dip-api` | `dip-api-portal` (`0.1.0`) | `main` (`c3348d5`) | Node.js / Express (`tsx`), Zod, Vitest | **OpenAPI Synced (Sandbox)** | Uses `IDipindiaAdapter` & `ICashfreeAdapter` sandbox stubs; live `DIPINDIA` adapter pending |
| `dip-sdk` | `@digital-india/sdk` (`0.2.0`) | `master` (`926cee4`) | Node.js `>=20`, ESM+CJS, Axios, Zod | **Contract Aligned** | References `@digital-india/core` in `COMPATIBILITY.md`, conflicting with `@dip/core` |
| `dip-core` | `@dip/core` (`0.2.0`) | `main` (`f3bdc28`) | TypeScript library (`./dist-lib`), Vitest/node:test | **Schema Compatible** | Package name `@dip/core` differs from `@digital-india/core`; `dipindiaAdapters.ts` marked provisional |
| `dip-ui` | `@digital-india-project/dip-ui` (`0.4.0`) | `main` (`1b99701`) | React 19, Vite lib, Tailwind CSS 4 | **Tokens Integrated** | Package unpublished on npm; tokens mirrored via `src/styles/dip-tokens.css` |
| `dip-security` | `dip-security` (`0.1.0`) | `main` (`c9f39f5`) | TypeScript security modules, Vitest | **Contract Documented** | Standalone packages (`packages/*`) pending registry packaging |
| `dip-infrastructure` | `dip-infrastructure` (`1.0.0`) | `master` (`d602b2c`) | Cloudflare/Docker/Postgres configs, Node `node:test` | **Contract Documented** | Production edge/DB provisioning intentionally unexecuted |
| `dip-automation` | `dip-automation` (`0.1.0`) | `master` (`b9ce7f3`) | Node 22 (`--experimental-strip-types`), Express, YAML | **Contract Documented (Mock)** | Executes local `TaskEngine` / `WorkflowEngine` sandbox state; webhook secret required in CI/prod |
| `dip-status` | None (`0.0.0` planning only) | `main` (`8fa3578`) | Markdown planning repository (6 files, no `package.json`) | **Planned / Blocked** | No runtime service, endpoints, or status JSON schema implemented yet |
| `dip-docs` | `dip-docs` (`0.1.0`) | `development/documentation-foundation` | React 19, Vite 6, Tailwind 4, `react-markdown`, `mermaid` | **Implemented & Validated** | Workspace local `main` (`b2c6d8f`) differs from upstream GitHub `main` (`1d9808a`) |

## 2. Export & Interface Cross-Check

| Interface / Standard | Producer Repo | Consumer / Reference in `dip-docs` | Verification Method |
|---|---|---|---|
| `--dip-*` light/dark CSS tokens & fonts | `dip-ui` (`tokens.css`) | `src/styles/dip-tokens.css`, `index.html`, `src/index.css` | Automated contract test in `tests/contract/manifest-and-ecosystem.test.ts` |
| `/api/v1/*` 22 endpoints & `ErrorEnvelope` | `dip-api` (`openapi.ts`) | `docs/api/openapi.json`, `ApiEndpointExplorer.tsx` | Path & schema verification in `scripts/validate-docs.mjs` and `tests/contract/` |
| 7 RBAC roles & 22 `PermissionCode` grants | `DIPINDIA` (`src/lib/rbac.ts`) | `docs/user-guides/roles-and-permissions.md`, `RolePermissionMatrix.tsx` | Verified against audited `DIPINDIA` RBAC rules |
| `DIPClient` & webhook HMAC helper | `dip-sdk` (`src/core/dipClient.ts`) | `docs/sdk/sdk-guide.md` | Checked against `dip-sdk@0.2.0` method table |

## 3. Environment Variable Ownership Boundaries

`dip-docs` requires **zero secrets** and **zero runtime environment variables** (standard `NODE_ENV` only during build/CI). All secret-bearing variables belong exclusively to server runtimes (`DIPINDIA`, `dip-api`, `dip-security`, `dip-automation`, `dip-infrastructure`) and must never appear in Vite client bundles (`VITE_*` public configs excluded from `dip-docs`).
