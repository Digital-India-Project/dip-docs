# DIP Docs — Verification and Test Execution Report

**Audience:** QA Engineers, Maintainers, Release Managers  
**Access Class:** Developer  
**Owner:** `dip-docs` maintainers  
**Implementation Status:** Implemented and verified  
**Last Verified:** 2026-11-27

## 1. Test Category Definitions and Honesty Policy

`dip-docs` separates verification results strictly by execution layer. Unit tests, static contract checks, and build verification never substitute for live browser end-to-end tests or live API integration tests.

| Verification Layer | Command / Mechanism | Execution Scope & Coverage | Status |
|---|---|---|---|
| **Unit Tests** | `npm run test:unit` (`node --experimental-strip-types --test "tests/unit/*.test.ts"`) | `slugifyHeading` (ASCII + Devanagari), `extractHeadings` (nested levels, duplicate suffixes, fenced code ignores), `extractTitle`, `estimateReadMinutes`, `resolveDocFromList`, `isSafeHref`, `searchDocs` | **Unit tested (12/12 Pass)** |
| **Contract Tests** | `npm run test:contract` (`node --experimental-strip-types --test "tests/contract/*.test.ts"`) | `integration/manifest.json` schema completeness, 10-repo inventory parity, `docs/api/openapi.json` 3.1.0 route, `ErrorEnvelope` (`correlation_id`), and `Money` (`amount_minor`) parity, `dip-ui` CSS token parity (`:root` + `.dark` + reduced motion), ADR presence | **Contract tested (6/6 Pass)** |
| **Security & Safety Tests** | `npm run test:security` (`node --experimental-strip-types --test "tests/security/*.test.ts"`) | Secret/token pattern scan, `dangerouslySetInnerHTML` absence check (detected & fixed in `MermaidBlock.tsx` via `DOMParser` SVG sanitization), `javascript:`/`data:` URL rejection, H1 and image `alt` accessibility invariants | **Security tested (3/3 Pass)** |
| **Documentation Validator** | `npm run docs:validate` (`node scripts/validate-docs.mjs`) | Markdown lint, relative link resolution, anchor checks across all 37 Markdown docs, `src/data/docs.ts` completeness, Mermaid syntax, OpenAPI checks, manifest JSON checks, SEO tags | **Passed (0 warnings, 0 errors)** |
| **Build & Type Checks** | `npm run lint && npm run build` (`tsc --noEmit && vite build`) | Strict TypeScript checking (`strict: true`, `noUnusedLocals`, `noUnusedParameters`) and Vite 6 production bundle compilation | **Build & type checked (Pass)** |
| **Mock Integration Tests** | N/A | `dip-docs` invokes no mocked backend SDKs at runtime (`ApiEndpointExplorer` reads static `docs/api/openapi.json`) | **Not applicable** |
| **Real Integration Tests** | N/A | No live HTTP calls made against `DIPINDIA`, `dip-api`, `dip-status`, Firebase, or Cashfree | **Not tested** |
| **Headless Browser E2E Tests** | N/A | Full DOM interaction in headless Chromium (Playwright/Cypress not installed in repository) | **Not tested** |

## 2. Shared Contract Test Fixtures

The contract assertions in `tests/contract/manifest-and-ecosystem.test.ts` and `integration/manifest.json` act as portable verification fixtures for downstream repositories:

- Verifies that every repository listed in the 10-repo Digital India Project ecosystem appears cleanly in `integration/manifest.json` and `docs/COMPATIBILITY_MATRIX.md`.
- Verifies that `docs/api/openapi.json` preserves exact `/api/v1` path conventions (`health`, `metrics`, `openapi.json`, `services`, `products`, `applications`, `payments`, `webhooks`, `integrations`, `sandbox/token`).
- Verifies that `src/styles/dip-tokens.css` preserves `--dip-*` semantic light and dark tokens sourced from `@digital-india-project/dip-ui`.

## 3. Known Testing Gaps

1. **No headless browser E2E runner installed:** Component rendering (`MarkdownRenderer`, `MermaidBlock`, `SearchModal`) is typechecked via `tsc --noEmit` and compiled by Vite, but interactive DOM clicks and Playwright visual regression remain **Not tested**.
2. **External URL reachability:** External `https://` URLs are excluded from offline link validation in `scripts/validate-docs.mjs` so CI runs hermetically without flaky network calls.
