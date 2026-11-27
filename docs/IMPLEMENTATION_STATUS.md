# DIP Docs — Implementation Status and Source Inventory

**Audience:** Maintainers, Engineering Leads, QA Engineers  
**Access Class:** Developer  
**Owner:** `dip-docs` maintainers  
**Implementation Status:** Implemented and verified  
**Last Verified:** 2026-11-27

## 1. Source-Code Inventory

| Directory / File | Responsibility | Ownership Boundary | Status |
|---|---|---|---|
| `src/App.tsx` | 3-zone header, sidebar audience filter, breadcrumb workspace, theme toggle, language switch, TOC | `dip-docs` UI shell | Implemented and verified |
| `src/data/docUtils.ts` | Pure TypeScript utilities for slugs, heading parsing, relative path resolution, safe links, search scoring | `dip-docs` core logic | Implemented and verified |
| `src/data/docs.ts` | Canonical registry binding all Markdown files and `docs/api/openapi.json` into `DOCS` | `dip-docs` registry | Implemented and verified |
| `src/components/MarkdownRenderer.tsx` | GFM Markdown rendering, internal route links, safe external links, callouts, copyable code blocks | `dip-docs` renderer | Implemented and verified |
| `src/components/ApiEndpointExplorer.tsx` | Interactive OpenAPI 3.1.0 endpoint browser with tag & auth filters | `dip-docs` + `dip-api` snapshot | Implemented and verified |
| `src/components/RolePermissionMatrix.tsx` | Interactive 7-role x 22-permission matrix grounded in `DIPINDIA` | `dip-docs` + `DIPINDIA` | Implemented and verified |
| `src/components/MermaidBlock.tsx` | Client-side Mermaid v12 diagram renderer synchronized with light/dark theme | `dip-docs` visualizer | Implemented and verified |
| `src/components/SearchModal.tsx` | `Cmd/Ctrl+K` modal with English/Hindi keyword search and audience filters | `dip-docs` search | Implemented and verified |
| `src/styles/dip-tokens.css` | Light and dark semantic CSS custom properties aligned with `dip-ui@0.4.0` | `dip-docs` theme layer | Implemented and verified |
| `integration/manifest.json` | Machine-readable repository manifest, dependencies, versions, blockers, and contracts | `dip-docs` governance | Implemented and verified |
| `scripts/validate-docs.mjs` | Automated link, anchor, heading, Mermaid, OpenAPI, manifest, SEO, and secret validator | `dip-docs` quality tooling | Implemented and verified |
| `tests/unit/`, `tests/contract/`, `tests/security/` | Automated `node:test` suites covering pure helpers, cross-repo contracts, and safety rules | `dip-docs` QA | Implemented and verified |
| `.github/workflows/docs-ci.yml` | Pull-request validation workflow (`lint`, `test`, `docs:validate`, `build`) | `dip-docs` CI | Implemented and verified |

## 2. Feature & Capability Readiness Classification

| Capability | Classification | Notes |
|---|---|---|
| English platform, user, workflow, service, security, and governance docs | **Implemented and verified** | Grounded in read-only audits of `DIPINDIA` and ecosystem repositories |
| Bilingual Hindi core documentation (`docs/hi/*`) | **Implemented and verified** | Six reviewed Hindi pages paired with English equivalents plus pending-translation notice |
| Interactive OpenAPI 3.1.0 Explorer (`docs/api/openapi.json`) | **Mock or sandbox only** (API runtime) / **Implemented** (UI) | UI explorer is fully functional; underlying `dip-api` gateway routes use sandbox adapters |
| Interactive RBAC Permission Matrix (`RolePermissionMatrix`) | **Implemented and verified** | Verified against `DIPINDIA/src/lib/rbac.ts` (7 roles, 22 permissions) |
| Ecosystem compatibility & integration contracts + ADRs | **Implemented and verified** | Covers all 10 repos (`integration/manifest.json`, `docs/adr/0001`–`0004`) |
| Server-side audience gating for `Internal` pages | **Blocked by dependency** | Requires edge auth or split builds coordinated with `dip-infrastructure` & `dip-security` |
| Live `dip-status` health widgets / telemetry feeds | **Planned** | Blocked until `dip-status` ships runnable schema/API definitions |
| Package consumption via `@digital-india-project/dip-ui` / `@dip/core` npm registries | **Blocked by dependency** | Packages are not yet published to npm; local token mirror bridges `dip-ui` safely |

## 3. Legacy Artifacts and Pending Cleanups

- **`bun.lock` preservation:** A root `bun.lock` file from initial repository scaffolding remains tracked in Git while the runtime toolchain runs on `npm` (`package.json`). Removing or refreshing `bun.lock` is deferred for coordinated cleanup before merging to `main`.
- **Hindi coverage scope:** Six core end-user/overview pages have reviewed Hindi translations; developer/internal deep dives (API, SDK, security, ADRs, integration contracts) intentionally display the pending-translation banner alongside authoritative English docs.
