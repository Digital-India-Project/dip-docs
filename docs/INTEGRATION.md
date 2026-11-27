# DIP Docs — Cross-Repository Documentation Contract

## 1. Purpose

DIP Docs aggregates verified technical and product documentation across the Digital India Project ecosystem. Each repository remains responsible for its own implementation accuracy.

## 2. Repository responsibilities

| Repository | Documentation supplied |
|---|---|
| DIPINDIA | Current product features, routes, roles, workflows, data and integrations |
| dip-infrastructure | Infrastructure configuration, CI and environment standards |
| dip-security | Security contracts, threat models and secure coding |
| dip-core | Domain vocabulary, schemas and business rules |
| dip-ui | Component, token, layout and accessibility guides |
| dip-api | OpenAPI specs, provider contracts, auth and webhook guides |
| dip-sdk | SDK quickstarts, client methods and examples |
| dip-automation | Job/event catalogues, retries and runbooks |
| dip-status | Health definitions, incident communication and service status |

## 3. DIPINDIA-first documentation

DIPINDIA is the source of truth for current product behaviour during migration. New repository docs may describe proposed target modules but must label them as planned until implemented and verified.

Every migrated feature should link:
- Feature inventory ID.
- Existing DIPINDIA behaviour.
- New owning repository/module.
- Contract version.
- Migration status.
- Compatibility and deprecation notes.

## 4. API and schema integration

- Generate API reference from dip-api OpenAPI specs.
- Link to versioned schemas from dip-core.
- Document security requirements from dip-security.
- Link SDK examples to a tested SDK release.
- Do not manually maintain conflicting copies of machine-readable contracts.

## 5. Documentation change process

1. Identify owner and audience.
2. Verify implementation or contract source.
3. Update source repository documentation.
4. Update aggregate navigation/reference.
5. Run docs build/link checks.
6. Review public/private classification.
7. Approve and publish through separate release process.

## 6. Versioning and deprecation

- Align docs with package/API releases.
- Keep historical docs for supported versions.
- Mark deprecated behaviour with replacement and timeline.
- Do not remove old docs while consumers remain on supported versions.
- Record breaking changes and migration instructions.

## 7. Accuracy requirements

Documentation must distinguish implemented, tested, production-active, planned and experimental. A merged README alone is not proof of production readiness. When evidence is missing, state that status is unverified.
