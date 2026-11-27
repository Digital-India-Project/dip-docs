import readmeRaw from '../../README.md?raw';
import projectPlanRaw from '../../docs/PROJECT_PLAN.md?raw';
import architectureRaw from '../../docs/ARCHITECTURE.md?raw';
import roadmapRaw from '../../docs/ROADMAP.md?raw';
import integrationRaw from '../../docs/INTEGRATION.md?raw';
import securityRaw from '../../docs/SECURITY.md?raw';

export interface DocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface DocEntry {
  id: string;
  slug: string;
  filePath: string;
  navLabel: string;
  title: string;
  section: string;
  summary: string;
  audience: string;
  status: string;
  content: string;
  headings: DocHeading[];
  readMinutes: number;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~()[\]{}]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractHeadings(markdown: string): DocHeading[] {
  const lines = markdown.split(/\r?\n/);
  const headings: DocHeading[] = [];
  let inCodeBlock = false;
  const seenIds = new Map<string, number>();

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const rawText = match[2].replace(/[`*_]/g, '').trim();
      let id = slugifyHeading(rawText);
      const count = seenIds.get(id) ?? 0;
      seenIds.set(id, count + 1);
      if (count > 0) {
        id = `${id}-${count}`;
      }
      headings.push({ id, text: rawText, level });
    }
  }

  return headings;
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function estimateReadMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function buildDoc(config: {
  id: string;
  slug: string;
  filePath: string;
  navLabel: string;
  section: string;
  summary: string;
  audience: string;
  status: string;
  raw: string;
}): DocEntry {
  return {
    id: config.id,
    slug: config.slug,
    filePath: config.filePath,
    navLabel: config.navLabel,
    title: extractTitle(config.raw, config.navLabel),
    section: config.section,
    summary: config.summary,
    audience: config.audience,
    status: config.status,
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
    section: 'Foundation',
    summary:
      'Mission, current baseline, documentation domains, source-of-truth policy, and target directory structure.',
    audience: 'All audiences',
    status: 'Planning foundation',
    raw: readmeRaw,
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
    status: 'Proposed',
    raw: projectPlanRaw,
  }),
  buildDoc({
    id: 'architecture',
    slug: 'docs/ARCHITECTURE.md',
    filePath: 'docs/ARCHITECTURE.md',
    navLabel: 'Architecture',
    section: 'System Design',
    summary:
      'Content aggregation model, source hierarchy, audience separation, versioning, OpenAPI strategy, and CI validation.',
    audience: 'Developers & architects',
    status: 'Planning foundation',
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
    status: 'Active checklist',
    raw: roadmapRaw,
  }),
  buildDoc({
    id: 'integration',
    slug: 'docs/INTEGRATION.md',
    filePath: 'docs/INTEGRATION.md',
    navLabel: 'Integration Contract',
    section: 'System Design',
    summary:
      'Cross-repository documentation ownership across DIPINDIA and ecosystem modules, API/schema contracts, and change workflow.',
    audience: 'Repository owners & developers',
    status: 'Contract baseline',
    raw: integrationRaw,
  }),
  buildDoc({
    id: 'security',
    slug: 'docs/SECURITY.md',
    filePath: 'docs/SECURITY.md',
    navLabel: 'Security Policy',
    section: 'Trust & Compliance',
    summary:
      'Content classification (Public, Partner, Internal, Restricted), prohibited content, access controls, and incident response.',
    audience: 'Platform & security engineers',
    status: 'Mandatory policy',
    raw: securityRaw,
  }),
];

export function resolveDocByHref(href: string): DocEntry | undefined {
  const normalized = href.replace(/^\.?\//, '').split('#')[0];
  return DOCS.find(
    (doc) =>
      doc.slug.toLowerCase() === normalized.toLowerCase() ||
      doc.filePath.toLowerCase() === normalized.toLowerCase() ||
      doc.id.toLowerCase() === normalized.toLowerCase()
  );
}
