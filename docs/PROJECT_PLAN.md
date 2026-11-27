# DIP Docs — Project Plan

**Status:** Proposed; site framework not selected  
**Primary source of current product truth:** DIPINDIA  
**Purpose:** Canonical documentation aggregation and publishing

## 1. Objective

Build a reliable documentation platform for Digital India Project customers, partners, developers and internal operators. It must document the existing DIPINDIA product accurately while tracking gradual modularization across the ecosystem repositories.

## 2. Goals

- Establish a canonical information architecture.
- Separate public, partner, developer and internal operational documentation.
- Document existing features and workflows before migration.
- Publish API/SDK references from approved contracts.
- Track versions, changes, deprecations and migration states.
- Add documentation quality checks and link validation.
- Keep sensitive operational information private.
- Make documentation searchable, accessible and maintainable.

## 3. Non-goals

- No replacement of DIPINDIA help pages or product UI without approval.
- No publishing of unverified capabilities.
- No public exposure of internal runbooks, endpoints or topology.
- No documentation platform deployment or DNS change without approval.
- No duplication of API specs as manually maintained conflicting copies.

## 4. Current baseline

The repository currently contains only a minimal README. No generator, site configuration, docs tree or publishing workflow was found in the initial inspection. Framework selection is intentionally deferred.

## 5. Workstreams

### WS1 — Information architecture
- Define audience, access level and content ownership.
- Organize product, user guides, developer, API, architecture, security, operations and migration content.
- Define navigation and search taxonomy.
- Define English/Hindi content strategy where appropriate.
- Avoid duplicating the same content across repositories.

Deliverables: content taxonomy, navigation map, ownership matrix.

### WS2 — Product and user documentation
- Inventory current DIPINDIA user journeys.
- Document registration assistance services, account creation, application submission, tracking, documents and payments as verified.
- Document customer/business, partner, operator, manager and admin experiences with correct access boundaries.
- Provide troubleshooting and support guidance.
- Clearly distinguish public user instructions from internal operational procedures.

Deliverables: user guide set and verified feature coverage matrix.

### WS3 — Developer and architecture documentation
- Document repository roles and dependency relationships.
- Document current runtime architecture and data ownership.
- Document auth, API, event, job and schema contracts.
- Maintain architecture decision records.
- Record migration status and compatibility.
- Link to implementation source and tests where possible.

Deliverables: architecture catalogue and developer onboarding.

### WS4 — API and SDK references
- Generate API reference from approved OpenAPI specs.
- Publish SDK quickstarts and examples from tested code.
- Document auth scopes, errors, rate limits, pagination and idempotency.
- Version API documentation.
- Never invent endpoints or scopes.

Deliverables: versioned API/SDK documentation.

### WS5 — Operations and security documentation
- Maintain internal runbooks and incident procedures.
- Document backup/restore, monitoring, deployment and rollback only after verification.
- Separate public status information from internal diagnostics.
- Keep secrets and customer information out of docs.
- Restrict internal docs appropriately.

Deliverables: internal operations library and security guide.

### WS6 — Documentation tooling and quality
- Select static site generator after requirements review.
- Add Markdown lint, link checking and build validation.
- Add code sample validation where practical.
- Add versioned documentation support.
- Add content owner and review date metadata.
- Add preview builds for review only; no production publication by default.

Deliverables: site build, CI checks and contribution guide.

### WS7 — Migration and release documentation
- Track feature IDs and extraction status.
- Maintain compatibility matrix across repositories.
- Publish deprecation and migration notices.
- Keep changelog entries tied to released versions.
- Document rollback and known limitations.

Deliverables: migration tracker and release notes.

## 6. Delivery phases

Phase 0: inventory current docs and content sources.  
Phase 1: define taxonomy, ownership and content policy.  
Phase 2: select generator and implement local docs build.  
Phase 3: migrate verified content and create developer guides.  
Phase 4: generate API/SDK references from contracts.  
Phase 5: add quality CI and preview workflow.  
Phase 6: publication readiness review and separate approval.

## 7. Priorities

**P0:** Source-of-truth rules, information architecture, DIPINDIA feature documentation, security/public-private boundaries, contribution standards.

**P1:** Site generator, user guides, developer docs, API references, versioned migration docs and CI.

**P2:** Search enhancements, localization expansion, interactive tutorials and doc analytics with privacy controls.

## 8. Acceptance criteria

- Every document has owner, audience, status and review date.
- Current vs planned behaviour is clearly labelled.
- API docs derive from approved specs.
- Code examples are tested or labelled illustrative.
- Public/private content is separated.
- Links and docs build pass CI.
- No secrets or personal data appear.
- Migration docs reflect actual implementation status.
- No public deployment occurs without approval.

## 9. Governance

Review branches only. No main push, merge, production publication, DNS or hosting changes without explicit approval.
