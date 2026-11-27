# DIP Docs — Architecture

## 1. Role

DIP Docs is the documentation aggregation and publishing layer. Repositories remain owners of implementation details and contracts; DIP Docs curates verified content, links, and versioned guides.

## 2. Content architecture

```text
               Documentation readers
                        |
                        v
                 DIP Docs website
                        |
      +-----------------+------------------+
      |                 |                  |
      v                 v                  v
 Public docs       Partner docs       Internal docs
      |                 |                  |
      +-----------------+------------------+
                        |
                 Content/navigation
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
      Product       Developer      Operations
      guides        API/SDK        security/runbooks
          |
          v
   Verified source repositories
```

Access controls must be enforced at the hosting/repository layer for internal content. Hiding a navigation link is not access control.

## 3. Content source hierarchy

1. Verified implementation and tests.
2. Versioned API/schema contracts.
3. Approved architecture decisions.
4. Maintainer-reviewed repository documentation.
5. Product/support content approved by the business owner.

When sources conflict, do not silently choose one. Record the discrepancy and request owner resolution.

## 4. Audience separation

- Public: product overview, user guides, support, public API overview.
- Partner: onboarding, integration, B2B usage and approved service terms.
- Developer: API reference, SDKs, examples, webhooks and versioning.
- Internal: architecture, operations, incident, security and deployment runbooks.

Use separate site sections or access-controlled spaces where necessary.

## 5. Versioning

- Version technical docs with the relevant product/API/SDK release.
- Mark current and archived versions.
- Include effective date and review owner.
- Maintain migration/deprecation notes.
- Avoid silently rewriting historical behaviour docs.

## 6. API documentation

OpenAPI specs in dip-api are the source of truth. Generate reference pages from the spec. Add narrative guides separately for auth, rate limits, pagination, errors and examples. Validate code snippets against SDK versions.

## 7. Site generator selection

Evaluate Docusaurus, MkDocs and alternatives against:
- Markdown/MDX support.
- Versioned docs.
- Search.
- Access control compatibility.
- English/Hindi localization.
- OpenAPI integration.
- Accessibility.
- Build speed and maintenance.
- Hosting and free-tier constraints.

Do not select a tool based only on familiarity. Record an ADR with decision and trade-offs.

## 8. Content metadata

Each page should include:
- Title and summary.
- Audience/access class.
- Product/repository owner.
- Status: current, planned, experimental, deprecated or archived.
- Last verified date.
- Applicable version.
- Related feature IDs and source links.

## 9. CI and publication

Review CI should:
- Validate Markdown.
- Check links where feasible.
- Build the site.
- Validate OpenAPI references.
- Check snippets where practical.
- Detect accidental secrets.
- Generate preview artifacts only.

No production deployment or public publishing job should run from this planning branch.

## 10. Privacy and security

Never publish secrets, personal data, customer screenshots, internal credentials, unredacted logs or private endpoints. Internal runbooks require access controls. Public status and documentation must not reveal sensitive topology.
