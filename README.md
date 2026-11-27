# DIP Docs

**Role:** Canonical technical, developer, operational, and migration documentation for the Digital India Project ecosystem  
**Status:** Implemented documentation foundation (`development/documentation-foundation` review branch)  
**Primary product:** Existing `DIPINDIA` platform  
**Positioning:** Private digital services and technology platform (not a government entity or official portal)

## Mission

DIP Docs provides a trustworthy, bilingual-ready documentation system for the existing `DIPINDIA` platform and its modularization across the Digital India Project ecosystem repositories. Documentation reflects verified repository implementations, labels planned or sandbox capabilities explicitly, and never presents proposed features as production-active.

## Verified Ecosystem Repositories

| Repository | Scope & Verified Baseline | Documentation Supplied |
|---|---|---|
| `DIPINDIA` | Functional React + Cloudflare Worker portal (`worker/routes/*`, `src/lib/*`) | Product features, RBAC, workflows, 8 catalogue categories, portal endpoints |
| `dip-api` | Express `/api/v1` gateway in isolated `sandbox` adapter mode | OpenAPI 3.1.0 spec, auth/scope policy, idempotency, webhooks, error envelope |
| `dip-sdk` | `@digital-india/sdk` TypeScript client (`DIPClient` + legacy `ApiClient`) | Resource modules, retry/idempotency rules, pagination, webhook verification |
| `dip-core` | Pure domain library (zero I/O, integer paise money, `Result` types) | Domain vocabulary, state machines, pricing math, compatibility adapters |
| `dip-ui` | Shared React 19 + Tailwind CSS v4 component and token library | Accessible UI components, tokens, layouts, bilingual i18n helpers |
| `dip-security` | Security policy, RBAC, cryptography, and webhook verification modules | Authorization model, tenant isolation, threat model, API/webhook security |
| `dip-infrastructure` | React/Vite infra config console + Cloudflare/Docker/env templates | Environment standards, schema validation, sanitized config templates |
| `dip-automation` | Task, workflow, scheduler, queue, and event-bus engine (in-memory/YAML) | `jobs.yaml` schedules, human approvals, retry policies, DLQ, mock adapters |
| `dip-status` | Planning foundation README only (no implemented runtime verified) | Public service status principles, SLO/incident communication boundaries |
| `dip-docs` | React 19 + Vite 6 + Tailwind CSS v4 + Mermaid documentation portal | Centralized navigation, search, bilingual English/Hindi docs, CI validation |

## Information Architecture

- **Platform Overview:** [Platform Overview](docs/overview/platform-overview.md) · [Hindi Overview](docs/hi/README.md)
- **Getting Started:** [Orientation and Onboarding](docs/getting-started/orientation-and-onboarding.md)
- **User Documentation:** [Roles and Permissions](docs/user-guides/roles-and-permissions.md) · [Admin & Super Admin](docs/user-guides/admin-and-super-admin.md) · [Manager & Operator](docs/user-guides/manager-and-operator.md) · [Partner, Customer & Business](docs/user-guides/partner-customer-business.md)
- **Application Workflows:** [Application Lifecycle](docs/workflows/application-lifecycle.md)
- **Services & Products:** [Service Catalogue Guide](docs/services/service-catalogue.md)
- **API & SDK Reference:** [API Overview](docs/api/api-overview.md) · [Endpoint Reference](docs/api/endpoint-reference.md) · [SDK Guide](docs/sdk/sdk-guide.md)
- **Security & Integrations:** [Security & Privacy](docs/security/security-and-privacy.md) · [Integrations Overview](docs/integrations/integrations-overview.md)
- **Infrastructure & Automation:** [Infrastructure & Operations](docs/infrastructure/infrastructure-and-operations.md) · [Automation Platform](docs/automation/automation-platform.md)
- **Contribution & Planning:** [Contributing & Governance](docs/contributing/contributing-and-governance.md) · [Project Plan](docs/PROJECT_PLAN.md) · [Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md) · [Integration Contract](docs/INTEGRATION.md) · [Security Policy](docs/SECURITY.md)

## Local Commands

```bash
npm install
npm run dev
npm run docs:validate
npm run lint
npm run build
```

## Governance

All documentation changes use review branches (`development/documentation-foundation`). No direct pushes to `main` or `master`, no automated deployment, and no public domain/DNS changes occur without explicit owner approval. Never commit secrets, credentials, personal data, or unverified operational claims.
