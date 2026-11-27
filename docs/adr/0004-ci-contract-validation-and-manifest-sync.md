# ADR-0004: Automate Manifest, OpenAPI, Link, and Security Validation in CI

**Status:** Accepted  
**Date:** 2026-11-27  
**Owner:** `dip-docs` maintainers  
**Related Repositories:** `dip-docs`, `dip-api`, `dip-core`, `dip-security`

## 1. Context

Because `dip-docs` aggregates contracts maintained by nine sibling repositories running in parallel, manual review alone cannot prevent broken relative links, unregistered Markdown pages, OpenAPI route drift, accidental secret commits, or `dip-ui` CSS token regressions.

## 2. Decision

Maintain a dual-layer verification pipeline enforced locally and in GitHub Actions (`.github/workflows/docs-ci.yml`):

1. `npm run docs:validate` (`scripts/validate-docs.mjs`): Validates every Markdown file for H1 headings, unclosed code fences, internal links/anchors, `src/data/docs.ts` registry parity, Mermaid header/bracket syntax, OpenAPI 3.1.0 completeness, `integration/manifest.json` integrity, SEO tags, and prohibited secret/emblem patterns.
2. `npm test` (`node --experimental-strip-types --test`): Executes unit tests on TypeScript utility functions (`tests/unit/`), contract/compatibility assertions across `integration/manifest.json`, `openapi.json`, and `dip-tokens.css` (`tests/contract/`), and content safety/accessibility tests (`tests/security/`).
3. `npm run lint && npm run build`: Runs `tsc --noEmit` and Vite production bundle verification without triggering any deployment or package publishing step.

## 3. Consequences

- Every newly added Markdown file under `docs/` fails CI immediately unless registered in `src/data/docs.ts`, keeping the navigation sidebar and search index synchronized with the filesystem.
- Cross-repository contract assumptions (such as the `@dip/core` vs `@digital-india/core` naming drift) are codified in machine-checked compatibility files (`integration/manifest.json`, `docs/COMPATIBILITY_MATRIX.md`) rather than buried in prose.
