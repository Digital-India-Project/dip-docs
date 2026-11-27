import readmeRaw from '../../README.md?raw';
import platformOverviewRaw from '../../docs/overview/platform-overview.md?raw';
import gettingStartedRaw from '../../docs/getting-started/orientation-and-onboarding.md?raw';
import rolesPermissionsRaw from '../../docs/user-guides/roles-and-permissions.md?raw';
import adminGuideRaw from '../../docs/user-guides/admin-and-super-admin.md?raw';
import managerOperatorRaw from '../../docs/user-guides/manager-and-operator.md?raw';
import partnerCustomerBusinessRaw from '../../docs/user-guides/partner-customer-business.md?raw';
import applicationLifecycleRaw from '../../docs/workflows/application-lifecycle.md?raw';
import serviceCatalogueRaw from '../../docs/services/service-catalogue.md?raw';
import apiOverviewRaw from '../../docs/api/api-overview.md?raw';
import endpointReferenceRaw from '../../docs/api/endpoint-reference.md?raw';
import sdkGuideRaw from '../../docs/sdk/sdk-guide.md?raw';
import securityPrivacyRaw from '../../docs/security/security-and-privacy.md?raw';
import integrationsOverviewRaw from '../../docs/integrations/integrations-overview.md?raw';
import infrastructureOperationsRaw from '../../docs/infrastructure/infrastructure-and-operations.md?raw';
import automationPlatformRaw from '../../docs/automation/automation-platform.md?raw';
import contributingGovernanceRaw from '../../docs/contributing/contributing-and-governance.md?raw';
import projectPlanRaw from '../../docs/PROJECT_PLAN.md?raw';
import architectureRaw from '../../docs/ARCHITECTURE.md?raw';
import roadmapRaw from '../../docs/ROADMAP.md?raw';
import integrationRaw from '../../docs/INTEGRATION.md?raw';
import securityRaw from '../../docs/SECURITY.md?raw';
import hiReadmeRaw from '../../docs/hi/README.md?raw';
import hiPlatformOverviewRaw from '../../docs/hi/platform-overview.md?raw';
import hiGettingStartedRaw from '../../docs/hi/getting-started.md?raw';
import hiUserGuidesRaw from '../../docs/hi/user-guides.md?raw';
import hiApplicationLifecycleRaw from '../../docs/hi/application-lifecycle.md?raw';
import hiServiceCatalogueRaw from '../../docs/hi/service-catalogue.md?raw';
import integrationContractsRaw from '../../docs/INTEGRATION_CONTRACTS.md?raw';
import compatibilityMatrixRaw from '../../docs/COMPATIBILITY_MATRIX.md?raw';
import implementationStatusRaw from '../../docs/IMPLEMENTATION_STATUS.md?raw';
import testReportRaw from '../../docs/TEST_REPORT.md?raw';
import adrIndexRaw from '../../docs/adr/README.md?raw';
import adr0001Raw from '../../docs/adr/0001-vite-react-documentation-runtime.md?raw';
import adr0002Raw from '../../docs/adr/0002-dip-ui-token-parity-without-runtime-coupling.md?raw';
import adr0003Raw from '../../docs/adr/0003-dipindia-source-of-truth-and-sandbox-labeling.md?raw';
import adr0004Raw from '../../docs/adr/0004-ci-contract-validation-and-manifest-sync.md?raw';
import openApiSpecJson from '../../docs/api/openapi.json';
import {
  type AudienceClass,
  type DocEntry,
  type DocHeading,
  type DocLanguage,
  type ImplementationStatus,
  estimateReadMinutes,
  extractHeadings,
  extractTitle,
  resolveDocFromList,
  slugifyHeading,
} from './docUtils';

export type {
  AudienceClass,
  DocEntry,
  DocHeading,
  DocLanguage,
  ImplementationStatus,
};
export { slugifyHeading };

export const OPENAPI_SPEC = openApiSpecJson;

function buildDoc(config: {
  id: string;
  slug: string;
  filePath: string;
  navLabel: string;
  section: string;
  summary: string;
  audience: string;
  audienceClass: AudienceClass;
  owner: string;
  status: ImplementationStatus;
  lastVerified?: string;
  lang?: DocLanguage;
  translationPairId?: string;
  translationStatus?: 'English' | 'Reviewed Hindi';
  interactiveModule?: 'endpoint-explorer' | 'rbac-matrix';
  raw: string;
}): DocEntry {
  const lang = config.lang ?? 'en';
  return {
    id: config.id,
    slug: config.slug,
    filePath: config.filePath,
    navLabel: config.navLabel,
    title: extractTitle(config.raw, config.navLabel),
    section: config.section,
    summary: config.summary,
    audience: config.audience,
    audienceClass: config.audienceClass,
    owner: config.owner,
    status: config.status,
    lastVerified: config.lastVerified ?? '2026-11-27',
    lang,
    translationPairId: config.translationPairId,
    translationStatus:
      config.translationStatus ?? (lang === 'hi' ? 'Reviewed Hindi' : 'English'),
    interactiveModule: config.interactiveModule,
    content: config.raw,
    headings: extractHeadings(config.raw),
    readMinutes: estimateReadMinutes(config.raw),
  };
}

export const DOCS: DocEntry[] = [
  buildDoc({
    id: 'overview',
    slug: 'README.md',
    filePath: 'README.md',
    navLabel: 'Overview',
    section: 'Platform Overview',
    summary:
      'Ecosystem documentation baseline, verified 10-repository inventory, source-of-truth policy, and local validation commands.',
    audience: 'All audiences',
    audienceClass: 'Public',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    translationPairId: 'hi-overview',
    raw: readmeRaw,
  }),
  buildDoc({
    id: 'platform-overview',
    slug: 'docs/overview/platform-overview.md',
    filePath: 'docs/overview/platform-overview.md',
    navLabel: 'Platform Overview',
    section: 'Platform Overview',
    summary:
      'Introduction, private service positioning, ecosystem architecture diagram, verified glossary, and FAQ.',
    audience: 'All audiences',
    audienceClass: 'Public',
    owner: 'dip-docs & DIPINDIA',
    status: 'Implemented and verified',
    translationPairId: 'hi-platform-overview',
    raw: platformOverviewRaw,
  }),
  buildDoc({
    id: 'getting-started',
    slug: 'docs/getting-started/orientation-and-onboarding.md',
    filePath: 'docs/getting-started/orientation-and-onboarding.md',
    navLabel: 'Getting Started',
    section: 'Getting Started',
    summary:
      'Role orientation, customer/partner/operator/business onboarding, local developer setup, and troubleshooting.',
    audience: 'Users, Partners, Developers',
    audienceClass: 'Public',
    owner: 'dip-docs & DIPINDIA',
    status: 'Implemented and verified',
    translationPairId: 'hi-getting-started',
    raw: gettingStartedRaw,
  }),
  buildDoc({
    id: 'roles-permissions',
    slug: 'docs/user-guides/roles-and-permissions.md',
    filePath: 'docs/user-guides/roles-and-permissions.md',
    navLabel: 'Roles & Permissions',
    section: 'User Guides & Roles',
    summary:
      'Verified 7-role RBAC matrix and 22 PermissionCode grants from DIPINDIA alongside dip-api JWT scopes.',
    audience: 'All role owners & security engineers',
    audienceClass: 'Public',
    owner: 'DIPINDIA & dip-security',
    status: 'Implemented and verified',
    translationPairId: 'hi-user-guides',
    interactiveModule: 'rbac-matrix',
    raw: rolesPermissionsRaw,
  }),
  buildDoc({
    id: 'admin-guide',
    slug: 'docs/user-guides/admin-and-super-admin.md',
    filePath: 'docs/user-guides/admin-and-super-admin.md',
    navLabel: 'Admin & Super Admin',
    section: 'User Guides & Roles',
    summary:
      'Platform administration, RBAC configuration, audit logs, backups, catalogue sync, and payment reconciliation.',
    audience: 'Super Admins & Administrators',
    audienceClass: 'Internal',
    owner: 'DIPINDIA',
    status: 'Implemented and verified',
    raw: adminGuideRaw,
  }),
  buildDoc({
    id: 'manager-operator-guide',
    slug: 'docs/user-guides/manager-and-operator.md',
    filePath: 'docs/user-guides/manager-and-operator.md',
    navLabel: 'Manager & Operator',
    section: 'User Guides & Roles',
    summary:
      'SLA queues, team assignment, escalations, operator KYC verification gate, and application processing workflows.',
    audience: 'Managers & Operators',
    audienceClass: 'Internal',
    owner: 'DIPINDIA',
    status: 'Implemented and verified',
    raw: managerOperatorRaw,
  }),
  buildDoc({
    id: 'partner-customer-business',
    slug: 'docs/user-guides/partner-customer-business.md',
    filePath: 'docs/user-guides/partner-customer-business.md',
    navLabel: 'Partner, Customer & B2B',
    section: 'User Guides & Roles',
    summary:
      'Partner assisted filings and payout wallets, customer Doc Vault and tracking, and B2B API key/bulk workflows.',
    audience: 'Partners, Customers, Business Users',
    audienceClass: 'Partner',
    owner: 'DIPINDIA',
    status: 'Implemented and verified',
    translationPairId: 'hi-user-guides',
    raw: partnerCustomerBusinessRaw,
  }),
  buildDoc({
    id: 'application-lifecycle',
    slug: 'docs/workflows/application-lifecycle.md',
    filePath: 'docs/workflows/application-lifecycle.md',
    navLabel: 'Application Lifecycle',
    section: 'Workflows & Services',
    summary:
      'Verified 24 ApplicationStatus states, 14 canonical statuses, ALLOWED_TRANSITIONS diagram, and 5-stage progress model.',
    audience: 'Developers, Operators, Customers',
    audienceClass: 'Public',
    owner: 'DIPINDIA & dip-core',
    status: 'Implemented and verified',
    translationPairId: 'hi-application-lifecycle',
    raw: applicationLifecycleRaw,
  }),
  buildDoc({
    id: 'service-catalogue',
    slug: 'docs/services/service-catalogue.md',
    filePath: 'docs/services/service-catalogue.md',
    navLabel: 'Service Catalogue',
    section: 'Workflows & Services',
    summary:
      'Verified 8 catalogue categories (CAT_A–CAT_H), submission journey, upload rules, and support escalation.',
    audience: 'Customers, Partners, Operators',
    audienceClass: 'Public',
    owner: 'DIPINDIA',
    status: 'Implemented and verified',
    translationPairId: 'hi-service-catalogue',
    raw: serviceCatalogueRaw,
  }),
  buildDoc({
    id: 'api-overview',
    slug: 'docs/api/api-overview.md',
    filePath: 'docs/api/api-overview.md',
    navLabel: 'API Overview',
    section: 'API & SDK',
    summary:
      'Bearer JWT auth, scopes, /api/v1 versioning, ErrorEnvelope, pagination, rate limits, Idempotency-Key, and webhooks.',
    audience: 'Developers & API Consumers',
    audienceClass: 'Developer',
    owner: 'dip-api',
    status: 'Mock or sandbox only',
    raw: apiOverviewRaw,
  }),
  buildDoc({
    id: 'endpoint-reference',
    slug: 'docs/api/endpoint-reference.md',
    filePath: 'docs/api/endpoint-reference.md',
    navLabel: 'Endpoint Reference',
    section: 'API & SDK',
    summary:
      'Verified 26 /api/v1 gateway routes, OpenAPI 3.1.0 interactive explorer, and DIPINDIA worker route compatibility matrix.',
    audience: 'Developers & API Consumers',
    audienceClass: 'Developer',
    owner: 'dip-api & DIPINDIA',
    status: 'Mock or sandbox only',
    interactiveModule: 'endpoint-explorer',
    raw: endpointReferenceRaw,
  }),
  buildDoc({
    id: 'sdk-guide',
    slug: 'docs/sdk/sdk-guide.md',
    filePath: 'docs/sdk/sdk-guide.md',
    navLabel: 'SDK Guide',
    section: 'API & SDK',
    summary:
      '@digital-india/sdk installation, DIPClient modules, retries, idempotency, browser/Node usage, and webhook verification.',
    audience: 'TypeScript & JavaScript Developers',
    audienceClass: 'Developer',
    owner: 'dip-sdk',
    status: 'Implemented and verified',
    raw: sdkGuideRaw,
  }),
  buildDoc({
    id: 'integrations-overview',
    slug: 'docs/integrations/integrations-overview.md',
    filePath: 'docs/integrations/integrations-overview.md',
    navLabel: 'Integrations Status',
    section: 'API & SDK',
    summary:
      'Verified vs sandbox vs planned status for Cashfree, API Sathi, API Setu, DigiLocker, Entity Locker, GST/PAN, and messaging.',
    audience: 'Developers, Partners, Architects',
    audienceClass: 'Developer',
    owner: 'DIPINDIA & dip-api',
    status: 'Interface or contract only',
    raw: integrationsOverviewRaw,
  }),
  buildDoc({
    id: 'security-privacy',
    slug: 'docs/security/security-and-privacy.md',
    filePath: 'docs/security/security-and-privacy.md',
    navLabel: 'Security & Privacy',
    section: 'Security & Operations',
    summary:
      'Authentication, tenant isolation, magic-byte upload checks, SSRF protection, HMAC webhooks, and disclosure.',
    audience: 'Platform & Security Engineers',
    audienceClass: 'Internal',
    owner: 'dip-security & DIPINDIA',
    status: 'Implemented and verified',
    raw: securityPrivacyRaw,
  }),
  buildDoc({
    id: 'security',
    slug: 'docs/SECURITY.md',
    filePath: 'docs/SECURITY.md',
    navLabel: 'Security Policy',
    section: 'Security & Operations',
    summary:
      'Content classification (Public, Partner, Internal, Restricted), prohibited content, access control, and incident response.',
    audience: 'All maintainers & contributors',
    audienceClass: 'Public',
    owner: 'dip-docs & dip-security',
    status: 'Implemented and verified',
    raw: securityRaw,
  }),
  buildDoc({
    id: 'infrastructure-operations',
    slug: 'docs/infrastructure/infrastructure-and-operations.md',
    filePath: 'docs/infrastructure/infrastructure-and-operations.md',
    navLabel: 'Infrastructure & Ops',
    section: 'Security & Operations',
    summary:
      'Sanitized runtime environments, Cloudflare/Docker templates, backup verification, logging, and dip-status principles.',
    audience: 'Platform Engineers & Release Managers',
    audienceClass: 'Internal',
    owner: 'dip-infrastructure & dip-status',
    status: 'Interface or contract only',
    raw: infrastructureOperationsRaw,
  }),
  buildDoc({
    id: 'automation-platform',
    slug: 'docs/automation/automation-platform.md',
    filePath: 'docs/automation/automation-platform.md',
    navLabel: 'Automation Platform',
    section: 'Security & Operations',
    summary:
      'dip-automation TaskEngine, human-approval WorkflowEngine, jobs.yaml cron schedules, retries, idempotency, and DLQ.',
    audience: 'Backend & Platform Engineers',
    audienceClass: 'Developer',
    owner: 'dip-automation',
    status: 'Mock or sandbox only',
    raw: automationPlatformRaw,
  }),
  buildDoc({
    id: 'contributing-governance',
    slug: 'docs/contributing/contributing-and-governance.md',
    filePath: 'docs/contributing/contributing-and-governance.md',
    navLabel: 'Contributing & Style',
    section: 'Planning & Governance',
    summary:
      'Documentation style guide, 7 status classifications, page template, bilingual rules, branching, and CI validation.',
    audience: 'Maintainers & Contributors',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: contributingGovernanceRaw,
  }),
  buildDoc({
    id: 'project-plan',
    slug: 'docs/PROJECT_PLAN.md',
    filePath: 'docs/PROJECT_PLAN.md',
    navLabel: 'Project Plan',
    section: 'Planning & Governance',
    summary:
      'Objective, goals, non-goals, seven delivery workstreams (WS1–WS7), phases, priorities, and acceptance criteria.',
    audience: 'Maintainers & contributors',
    audienceClass: 'Internal',
    owner: 'dip-docs',
    status: 'Planned',
    raw: projectPlanRaw,
  }),
  buildDoc({
    id: 'architecture',
    slug: 'docs/ARCHITECTURE.md',
    filePath: 'docs/ARCHITECTURE.md',
    navLabel: 'Docs Architecture',
    section: 'Planning & Governance',
    summary:
      'Content aggregation model, source hierarchy, audience separation, versioning, OpenAPI strategy, and CI validation.',
    audience: 'Developers & architects',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: architectureRaw,
  }),
  buildDoc({
    id: 'roadmap',
    slug: 'docs/ROADMAP.md',
    filePath: 'docs/ROADMAP.md',
    navLabel: 'Roadmap',
    section: 'Planning & Governance',
    summary:
      'Milestones D0 through D8 across P0, P1, and P2 priorities, plus the publication readiness gate.',
    audience: 'Maintainers & release managers',
    audienceClass: 'Internal',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: roadmapRaw,
  }),
  buildDoc({
    id: 'integration',
    slug: 'docs/INTEGRATION.md',
    filePath: 'docs/INTEGRATION.md',
    navLabel: 'Integration Contract',
    section: 'Planning & Governance',
    summary:
      'Cross-repository documentation ownership across DIPINDIA and all 9 ecosystem modules.',
    audience: 'Repository owners & developers',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: integrationRaw,
  }),
  buildDoc({
    id: 'integration-contracts',
    slug: 'docs/INTEGRATION_CONTRACTS.md',
    filePath: 'docs/INTEGRATION_CONTRACTS.md',
    navLabel: 'Integration Contracts',
    section: 'Planning & Governance',
    summary:
      'Shared ecosystem architecture decisions, open coordination items, consumed/provided contracts, and compatibility risks.',
    audience: 'Repository owners & architects',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: integrationContractsRaw,
  }),
  buildDoc({
    id: 'compatibility-matrix',
    slug: 'docs/COMPATIBILITY_MATRIX.md',
    filePath: 'docs/COMPATIBILITY_MATRIX.md',
    navLabel: 'Compatibility Matrix',
    section: 'Planning & Governance',
    summary:
      'Verified package versions, commit SHAs, runtime compatibility, and observed contract drift across all 10 repositories.',
    audience: 'Release managers & architects',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: compatibilityMatrixRaw,
  }),
  buildDoc({
    id: 'implementation-status',
    slug: 'docs/IMPLEMENTATION_STATUS.md',
    filePath: 'docs/IMPLEMENTATION_STATUS.md',
    navLabel: 'Implementation Status',
    section: 'Planning & Governance',
    summary:
      'Source-code module inventory, verified readiness classification, and explicit repository limitations.',
    audience: 'Maintainers & QA engineers',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: implementationStatusRaw,
  }),
  buildDoc({
    id: 'test-report',
    slug: 'docs/TEST_REPORT.md',
    filePath: 'docs/TEST_REPORT.md',
    navLabel: 'Test & QA Report',
    section: 'Planning & Governance',
    summary:
      'Execution coverage separating unit tests, contract checks, security scans, type/build checks, and untested live E2E layers.',
    audience: 'QA engineers & maintainers',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: testReportRaw,
  }),
  // Architecture Decision Records
  buildDoc({
    id: 'adr-index',
    slug: 'docs/adr/README.md',
    filePath: 'docs/adr/README.md',
    navLabel: 'ADR Index',
    section: 'Architecture Decisions',
    summary:
      'Index of recorded architecture decision records for dip-docs and cross-repository coordination.',
    audience: 'Architects & maintainers',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: adrIndexRaw,
  }),
  buildDoc({
    id: 'adr-0001',
    slug: 'docs/adr/0001-vite-react-documentation-runtime.md',
    filePath: 'docs/adr/0001-vite-react-documentation-runtime.md',
    navLabel: 'ADR-0001 Runtime',
    section: 'Architecture Decisions',
    summary:
      'Decision to preserve the Vite + React 19 documentation runtime while extracting Node-testable utilities.',
    audience: 'Architects & maintainers',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: adr0001Raw,
  }),
  buildDoc({
    id: 'adr-0002',
    slug: 'docs/adr/0002-dip-ui-token-parity-without-runtime-coupling.md',
    filePath: 'docs/adr/0002-dip-ui-token-parity-without-runtime-coupling.md',
    navLabel: 'ADR-0002 dip-ui Tokens',
    section: 'Architecture Decisions',
    summary:
      'Decision to mirror dip-ui semantic light/dark CSS tokens locally until registry packages publish.',
    audience: 'Frontend & UI engineers',
    audienceClass: 'Developer',
    owner: 'dip-docs & dip-ui',
    status: 'Implemented and verified',
    raw: adr0002Raw,
  }),
  buildDoc({
    id: 'adr-0003',
    slug: 'docs/adr/0003-dipindia-source-of-truth-and-sandbox-labeling.md',
    filePath: 'docs/adr/0003-dipindia-source-of-truth-and-sandbox-labeling.md',
    navLabel: 'ADR-0003 Truth Policy',
    section: 'Architecture Decisions',
    summary:
      'Decision enforcing DIPINDIA source-of-truth provenance and explicit sandbox/planned labeling.',
    audience: 'Technical writers & architects',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: adr0003Raw,
  }),
  buildDoc({
    id: 'adr-0004',
    slug: 'docs/adr/0004-ci-contract-validation-and-manifest-sync.md',
    filePath: 'docs/adr/0004-ci-contract-validation-and-manifest-sync.md',
    navLabel: 'ADR-0004 CI Contracts',
    section: 'Architecture Decisions',
    summary:
      'Decision automating Markdown link, OpenAPI, manifest, secret, and node:test verification in CI.',
    audience: 'DevOps & maintainers',
    audienceClass: 'Developer',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    raw: adr0004Raw,
  }),
  // Hindi Bilingual Docs
  buildDoc({
    id: 'hi-overview',
    slug: 'docs/hi/README.md',
    filePath: 'docs/hi/README.md',
    navLabel: 'परिचय (Overview)',
    section: 'हिंदी दस्तावेज़ीकरण',
    summary:
      'डिजिटल इंडिया प्रोजेक्ट दस्तावेज़ीकरण का हिंदी परिचय, प्रमुख अनुभाग और अनुवाद नीति।',
    audience: 'सभी उपयोगकर्ता',
    audienceClass: 'Public',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    lang: 'hi',
    translationPairId: 'overview',
    translationStatus: 'Reviewed Hindi',
    raw: hiReadmeRaw,
  }),
  buildDoc({
    id: 'hi-platform-overview',
    slug: 'docs/hi/platform-overview.md',
    filePath: 'docs/hi/platform-overview.md',
    navLabel: 'प्लेटफ़ॉर्म अवलोकन',
    section: 'हिंदी दस्तावेज़ीकरण',
    summary:
      'निजी प्लेटफ़ॉर्म स्थिति, प्रमुख क्षमताएं, और DIPINDIA की सत्यापित हिंदी शब्दावली।',
    audience: 'सभी उपयोगकर्ता',
    audienceClass: 'Public',
    owner: 'dip-docs & DIPINDIA',
    status: 'Implemented and verified',
    lang: 'hi',
    translationPairId: 'platform-overview',
    translationStatus: 'Reviewed Hindi',
    raw: hiPlatformOverviewRaw,
  }),
  buildDoc({
    id: 'hi-getting-started',
    slug: 'docs/hi/getting-started.md',
    filePath: 'docs/hi/getting-started.md',
    navLabel: 'शुरुआत कैसे करें',
    section: 'हिंदी दस्तावेज़ीकरण',
    summary:
      'ग्राहक, पार्टनर, ऑपरेटर और व्यावसायिक उपयोगकर्ताओं के लिए ऑनबोर्डिंग और समस्या निवारण।',
    audience: 'ग्राहक, पार्टनर, ऑपरेटर',
    audienceClass: 'Public',
    owner: 'dip-docs & DIPINDIA',
    status: 'Implemented and verified',
    lang: 'hi',
    translationPairId: 'getting-started',
    translationStatus: 'Reviewed Hindi',
    raw: hiGettingStartedRaw,
  }),
  buildDoc({
    id: 'hi-user-guides',
    slug: 'docs/hi/user-guides.md',
    filePath: 'docs/hi/user-guides.md',
    navLabel: 'उपयोगकर्ता मार्गदर्शिका',
    section: 'हिंदी दस्तावेज़ीकरण',
    summary:
      'ग्राहक, पार्टनर, B2B व्यवसाय, ऑपरेटर और मैनेजर भूमिकाओं की प्रमाणित मार्गदर्शिका।',
    audience: 'ग्राहक, पार्टनर, ऑपरेटर, मैनेजर',
    audienceClass: 'Public',
    owner: 'DIPINDIA',
    status: 'Implemented and verified',
    lang: 'hi',
    translationPairId: 'roles-permissions',
    translationStatus: 'Reviewed Hindi',
    raw: hiUserGuidesRaw,
  }),
  buildDoc({
    id: 'hi-application-lifecycle',
    slug: 'docs/hi/application-lifecycle.md',
    filePath: 'docs/hi/application-lifecycle.md',
    navLabel: 'आवेदन जीवनचक्र',
    section: 'हिंदी दस्तावेज़ीकरण',
    summary:
      'पांच-चरणीय आवेदन प्रगति मॉडल और सभी मुख्य आवेदन स्थितियों का विवरण।',
    audience: 'ग्राहक, पार्टनर, ऑपरेटर',
    audienceClass: 'Public',
    owner: 'DIPINDIA',
    status: 'Implemented and verified',
    lang: 'hi',
    translationPairId: 'application-lifecycle',
    translationStatus: 'Reviewed Hindi',
    raw: hiApplicationLifecycleRaw,
  }),
  buildDoc({
    id: 'hi-service-catalogue',
    slug: 'docs/hi/service-catalogue.md',
    filePath: 'docs/hi/service-catalogue.md',
    navLabel: 'सेवा कैटलॉग',
    section: 'हिंदी दस्तावेज़ीकरण',
    summary:
      'CAT_A से CAT_H तक की सभी 8 सत्यापित सेवा श्रेणियों और उप-श्रेणियों का परिचय।',
    audience: 'ग्राहक, पार्टनर, व्यावसायिक उपयोगकर्ता',
    audienceClass: 'Public',
    owner: 'DIPINDIA',
    status: 'Implemented and verified',
    lang: 'hi',
    translationPairId: 'service-catalogue',
    translationStatus: 'Reviewed Hindi',
    raw: hiServiceCatalogueRaw,
  }),
];

export function resolveDocByHref(href: string, currentFilePath?: string): DocEntry | undefined {
  return resolveDocFromList(DOCS, href, currentFilePath);
}
