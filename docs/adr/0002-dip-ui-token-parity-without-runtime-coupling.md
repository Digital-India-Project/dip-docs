# ADR-0002: Mirror `dip-ui` CSS Custom Properties Without Unpublished Package Coupling

**Status:** Accepted  
**Date:** 2026-11-27  
**Owner:** `dip-docs` maintainers  
**Related Repositories:** `dip-docs`, `dip-ui`, `DIPINDIA`

## 1. Context

`Digital-India-Project/dip-ui` (`@digital-india-project/dip-ui@0.4.0`) defines the shared Digital India Project visual design tokens (`src/lib/tokens/tokens.css`), semantic palette (`--dip-bg-canvas`, `--dip-bg-surface`, `--dip-accent`, `--dip-text-*`), light/dark color modes, typography (`Plus Jakarta Sans`, `Public Sans`, `Source Serif 4`, `JetBrains Mono`, `Noto Sans Devanagari`), radii, shadows, and reduced-motion rules. However, `@digital-india-project/dip-ui` is not published to a public or private npm registry.

## 2. Decision

Mirror the verified CSS custom properties and typography scale from `dip-ui` into `src/styles/dip-tokens.css` (imported via Tailwind v4 `@import "./styles/dip-tokens.css";` in `src/index.css`) rather than referencing an unpublished git dependency or unresolvable npm package at build time.

## 3. Rationale

- Guarantees deterministic `npm ci` and offline/CI Vite builds without external registry tokens or brittle git submodule fetches.
- Achieves immediate visual and dark-mode parity across all `dip-docs` interactive surfaces, tables, Mermaid diagrams, and search UI.
- Verified via contract tests (`tests/contract/manifest-and-ecosystem.test.ts`) to ensure required `--dip-*` light and dark custom properties remain present and aligned.

## 4. Consequences & Open Coordination

- **Token Sync Responsibility:** Until `@digital-india-project/dip-ui` is published as an installable package, changes to `dip-ui/src/lib/tokens/tokens.css` require re-synchronizing `src/styles/dip-tokens.css`.
- **Reversibility:** Once `@digital-india-project/dip-ui` is published, `src/styles/dip-tokens.css` can be replaced directly with `@import "@digital-india-project/dip-ui/tokens.css";` without changing component class names.
