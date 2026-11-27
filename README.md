# DIP Docs

**Role:** Canonical technical, developer, operational and migration documentation for the Digital India Project ecosystem  
**Status:** Planning foundation; documentation platform not yet selected  
**Primary product:** Existing DIPINDIA platform

## Mission

DIP Docs provides a trustworthy documentation system for the existing DIPINDIA platform and its gradual evolution into a multi-repository ecosystem. Documentation must reflect verified implementation, distinguish current behaviour from planned work, and never imply that a proposed feature is already deployed.

## Current baseline

The repository currently contains only a minimal README. No documentation generator, site configuration, content tree or deployment workflow has been verified.

## Documentation audiences

- Customers and business users (public help content only).
- Operators, partners, managers and administrators (role-scoped guides).
- Developers and API consumers.
- Platform/security engineers.
- Support and incident responders.
- Internal maintainers and release managers.

## Documentation domains

- Product capabilities and user journeys.
- System architecture and data ownership.
- Authentication, roles and permissions.
- Service catalogue, forms and application workflows.
- API reference and SDK guides.
- Integrations and provider contracts.
- Infrastructure, deployment and environment operations.
- Security, privacy and data handling.
- Troubleshooting, runbooks and incidents.
- Migration status and release notes.

## Source-of-truth policy

- DIPINDIA is the source of truth for current product behaviour until a capability is formally migrated.
- Each repository owns its implementation-level docs and versioned contracts.
- DIP Docs aggregates and links to approved, verified documentation.
- A README or roadmap is not proof that a feature is implemented.
- Public docs must not expose internal endpoints, secrets, private topology or customer data.
- Planned, experimental, deprecated and production-active states must be labelled.

## Target structure

```text
.
├── README.md
├── docs/
│   ├── product/
│   ├── user-guides/
│   ├── developer/
│   ├── architecture/
│   ├── api/
│   ├── security/
│   ├── operations/
│   ├── migration/
│   └── releases/
├── versioned/
├── snippets/
└── site-config/
```

Choose Docusaurus, MkDocs or another generator only after requirements and hosting constraints are reviewed.

## Documents

- [Project plan](docs/PROJECT_PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Security](docs/SECURITY.md)
- [Integration](docs/INTEGRATION.md)

## Governance

All docs changes use review branches. No deployment, public publication or domain/DNS changes without explicit approval. Never publish secrets, personal data or unverified operational claims.
