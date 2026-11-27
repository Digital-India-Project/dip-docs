# Contributing, Style Guide, and Documentation Governance

**Audience:** Maintainers, Technical Writers, Developers  
**Access Class:** Public / Developer  
**Owner:** `dip-docs` maintainers  
**Implementation Status:** Implemented and verified (`dip-docs`)  
**Last Verified:** 2026-11-27

## 1. Repository Map and Ownership

Each Digital India Project repository owns its source-level contracts and implementation accuracy, while `dip-docs` aggregates, cross-links, and validates the ecosystem documentation. See [Integration Contract](../INTEGRATION.md) for the complete 10-repository responsibility table.

## 2. Required Page Metadata and Status Taxonomy

Every documentation page must state its **Audience**, **Access Class** (`Public`, `Developer`, `Partner`, `Internal`, `Restricted`), **Owner**, **Last Verified** date, and one of the seven standard **Implementation Status** classifications:

1. `Implemented and verified` — Confirmed in running code and tests.
2. `Implemented but not fully verified` — Present in source; partial test or environment verification.
3. `Interface or contract only` — Types, schemas, or adapters exist without live backing.
4. `Mock or sandbox only` — Synthetic data or non-production sandbox adapters only.
5. `Planned` — Design or roadmap intent only; no runtime implementation.
6. `Blocked by dependency` — Waiting on upstream repo, credentials, or external approval.
7. `Deprecated` — Maintained for backwards compatibility with a documented replacement.

## 3. Page Template

```markdown
# Page Title

**Audience:** Target reader roles  
**Access Class:** Public | Developer | Partner | Internal  
**Owner:** Owning repository maintainers  
**Implementation Status:** One of the 7 standard statuses  
**Last Verified:** YYYY-MM-DD

## 1. Purpose and Prerequisites
Explain what this guide covers and what readers need before starting.

## 2. Verified Behavior / Instructions
Document only verified endpoints, permissions, workflows, or commands.

## 3. Limitations and Related Links
State known constraints and link to authoritative source pages.
```

## 4. Branching, Review, and Release Policy

- **Work branches:** Create feature or documentation branches (`development/*` or `review/*`).
- **Protected branches:** Never push directly to `main` or `master` and never self-merge pull requests.
- **No unapproved deployment:** CI runs validation and preview builds only; public deployment requires separate owner approval.
- **Bilingual Rules (English / Hindi):** Maintain equivalent page structure and verified terminology (`nameHi`, `labelHi`). Never present unreviewed machine translations of critical security, privacy, or legal guidance as reviewed Hindi content—leave those marked `Translation Pending` with an explicit notice linking to the authoritative English text.

## 5. Automated Documentation Validation (`npm run docs:validate`)

Before opening a pull request, run:

```bash
npm run docs:validate
npm run lint
npm run build
```

`scripts/validate-docs.mjs` automatically verifies:
- Every documentation file in the navigation registry exists on disk.
- Internal file links and `#heading` anchors resolve cleanly.
- Markdown headings follow accessible hierarchy and code fences close properly.
- `docs/api/openapi.json` is valid OpenAPI 3.1.0 matching the verified `/api/v1` catalogue.
- Mermaid diagrams declare valid diagram types with balanced syntax.
- `public/sitemap.xml` stays synchronized with public documentation routes.
- No secrets, private keys, real PII, or prohibited government-endorsement claims appear anywhere in the repository.
