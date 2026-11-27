# ADR-0001: Preserve Vite + React 19 Documentation SPA Runtime

**Status:** Accepted  
**Date:** 2026-11-27  
**Owner:** `dip-docs` maintainers  
**Related Repositories:** `dip-docs`, `dip-infrastructure`, `dip-security`

## 1. Context

`dip-docs` was initialized with Vite 6, React 19, TypeScript 5.8, Tailwind CSS v4, `react-markdown`, and `remark-gfm`. Planning notes in [Docs Architecture](../ARCHITECTURE.md) also discuss evaluating static site generators such as Docusaurus or MkDocs for multi-versioning and hosting access control.

## 2. Decision

Preserve the existing Vite + React 19 documentation application runtime rather than migrating mid-flight to Docusaurus or MkDocs, while separating pure Markdown/search helpers into `src/data/docUtils.ts` so they remain unit-testable in Node.js.

## 3. Rationale

- Preserves zero-friction preview compatibility, existing interactive components (`ApiEndpointExplorer`, `RolePermissionMatrix`, `MermaidBlock`), and full bilingual English/Hindi support.
- Avoids introducing a second runtime stack or breaking CI scripts while parallel ecosystem repositories (`dip-api`, `dip-sdk`, `dip-core`, `dip-ui`) are actively stabilizing.
- Keeps bundle build output as standard static files (`dist/`), compatible with Cloudflare `[assets]` or Cloudflare Pages defined by `dip-infrastructure`.

## 4. Consequences & Open Coordination

- **Access Control Trade-off:** Because Vite bundles all registered Markdown imports into static JS chunks at build time, `Internal`-classified docs are visible in the compiled assets unless gated upstream. Coordinating edge authentication (e.g., Cloudflare Access) or build-time audience splitting with `dip-infrastructure` and `dip-security` is required before deploying `Internal` runbooks publicly.
- **Reversibility:** All authoritative content lives in standard CommonMark/GFM files under `docs/` and `README.md`, making a future shift to Docusaurus or Astro straightforward without rewriting documentation prose.
