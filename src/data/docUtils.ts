export type AudienceClass = 'Public' | 'Developer' | 'Partner' | 'Internal';

export type ImplementationStatus =
  | 'Implemented and verified'
  | 'Implemented but not fully verified'
  | 'Interface or contract only'
  | 'Mock or sandbox only'
  | 'Planned'
  | 'Blocked by dependency'
  | 'Deprecated';

export type DocLanguage = 'en' | 'hi';

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
  audienceClass: AudienceClass;
  owner: string;
  status: ImplementationStatus;
  lastVerified: string;
  lang: DocLanguage;
  translationPairId?: string;
  translationStatus: 'English' | 'Reviewed Hindi';
  interactiveModule?: 'endpoint-explorer' | 'rbac-matrix';
  content: string;
  headings: DocHeading[];
  readMinutes: number;
}

export interface SearchMatch {
  doc: DocEntry;
  snippet: string;
  matchedHeading?: string;
  score: number;
}

export const AUDIENCE_CLASSES: readonly AudienceClass[] = [
  'Public',
  'Developer',
  'Partner',
  'Internal',
];

export const IMPLEMENTATION_STATUSES: readonly ImplementationStatus[] = [
  'Implemented and verified',
  'Implemented but not fully verified',
  'Interface or contract only',
  'Mock or sandbox only',
  'Planned',
  'Blocked by dependency',
  'Deprecated',
];

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~()[\]{}]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function extractHeadings(markdown: string): DocHeading[] {
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

export function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

export function estimateReadMinutes(markdown: string): number {
  const trimmed = markdown.trim();
  if (!trimmed) return 1;
  const words = trimmed.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function normalizePosixPath(parts: string[]): string {
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

export function resolveDocFromList(
  docs: readonly DocEntry[],
  href: string,
  currentFilePath?: string
): DocEntry | undefined {
  const cleanHref = href.split('#')[0].trim();
  if (!cleanHref) return undefined;

  const candidates = new Set<string>([cleanHref.replace(/^\.?\//, '')]);

  if (currentFilePath) {
    const dirParts = currentFilePath.split('/').slice(0, -1);
    const resolved = normalizePosixPath([...dirParts, ...cleanHref.split('/')]);
    if (resolved) candidates.add(resolved);
  }

  for (const candidate of candidates) {
    const match = docs.find(
      (doc) =>
        doc.slug.toLowerCase() === candidate.toLowerCase() ||
        doc.filePath.toLowerCase() === candidate.toLowerCase() ||
        doc.id.toLowerCase() === candidate.toLowerCase()
    );
    if (match) return match;
  }

  return undefined;
}

export function isSafeHref(href: string | undefined): boolean {
  if (!href) return false;
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true;
  }
  const lower = trimmed.toLowerCase();
  return (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('mailto:')
  );
}

export function getExcerpt(content: string, query: string): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) {
    return content
      .replace(/^#.*$/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 140);
  }
  const start = Math.max(0, idx - 55);
  const end = Math.min(content.length, idx + query.length + 95);
  const raw = content.slice(start, end).replace(/\s+/g, ' ').trim();
  return `${start > 0 ? '…' : ''}${raw}${end < content.length ? '…' : ''}`;
}

export function searchDocs(
  docs: readonly DocEntry[],
  query: string,
  audienceFilter: 'All' | AudienceClass = 'All'
): SearchMatch[] {
  const trimmed = query.trim().toLowerCase();
  const scopedDocs =
    audienceFilter === 'All'
      ? docs
      : docs.filter((d) => d.audienceClass === audienceFilter);

  if (!trimmed) {
    return scopedDocs.map((doc) => ({
      doc,
      snippet: doc.summary,
      score: 0,
    }));
  }

  const matches: SearchMatch[] = [];
  for (const doc of scopedDocs) {
    let score = 0;
    if (doc.title.toLowerCase().includes(trimmed)) score += 100;
    if (doc.navLabel.toLowerCase().includes(trimmed)) score += 80;
    const headingMatch = doc.headings.find((h) =>
      h.text.toLowerCase().includes(trimmed)
    );
    if (headingMatch) score += 50;
    if (doc.summary.toLowerCase().includes(trimmed)) score += 35;
    if (doc.content.toLowerCase().includes(trimmed)) score += 15;

    if (score > 0) {
      matches.push({
        doc,
        matchedHeading: headingMatch?.text,
        snippet: getExcerpt(doc.content, trimmed),
        score,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}
