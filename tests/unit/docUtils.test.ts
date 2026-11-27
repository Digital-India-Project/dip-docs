import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateReadMinutes,
  extractHeadings,
  extractTitle,
  getExcerpt,
  isSafeHref,
  normalizePosixPath,
  resolveDocFromList,
  searchDocs,
  slugifyHeading,
  type DocEntry,
} from '../../src/data/docUtils.ts';

function makeDoc(overrides: Partial<DocEntry>): DocEntry {
  return {
    id: 'sample-doc',
    slug: 'docs/sample.md',
    filePath: 'docs/sample.md',
    navLabel: 'Sample Doc',
    title: 'Sample Documentation Page',
    section: 'Platform Overview',
    summary: 'Verified overview of sample workflows.',
    audience: 'All',
    audienceClass: 'Public',
    owner: 'dip-docs',
    status: 'Implemented and verified',
    lastVerified: '2026-11-27',
    lang: 'en',
    translationStatus: 'English',
    content: '# Sample Documentation Page\n\n## Workflow Stages\n\nDetails on Idempotency-Key handling.',
    headings: [
      { id: 'workflow-stages', text: 'Workflow Stages', level: 2 },
    ],
    readMinutes: 1,
    ...overrides,
  };
}

describe('slugifyHeading', () => {
  it('normalizes ASCII headings with punctuation and backticks', () => {
    assert.equal(
      slugifyHeading('1. Verified `/api/v1` Endpoints & Auth'),
      '1-verified-apiv1-endpoints-auth'
    );
  });

  it('preserves Devanagari Unicode letters for Hindi anchor links', () => {
    const slug = slugifyHeading('1. प्लेटफ़ॉर्म अवलोकन');
    assert.ok(slug.startsWith('1-'));
    assert.ok(slug.length > 3);
  });
});

describe('extractHeadings', () => {
  it('extracts h2/h3 headings, disambiguates duplicates, and ignores fenced code blocks', () => {
    const md = [
      '# Top H1 Ignored Here',
      '',
      '## Overview',
      '',
      '### Details',
      '',
      '```bash',
      '## Fake Heading Inside Code Block',
      '```',
      '',
      '## Overview',
      '#### Level 4 Ignored',
    ].join('\n');

    const headings = extractHeadings(md);
    assert.deepEqual(headings, [
      { id: 'overview', text: 'Overview', level: 2 },
      { id: 'details', text: 'Details', level: 3 },
      { id: 'overview-1', text: 'Overview', level: 2 },
    ]);
  });
});

describe('extractTitle & estimateReadMinutes', () => {
  it('extracts first level-1 heading or falls back cleanly', () => {
    assert.equal(extractTitle('# Digital India Project\nBody', 'Fallback'), 'Digital India Project');
    assert.equal(extractTitle('## Only H2\nBody', 'Fallback'), 'Fallback');
  });

  it('estimates at least 1 minute for short or empty content', () => {
    assert.equal(estimateReadMinutes(''), 1);
    assert.equal(estimateReadMinutes('word '.repeat(420)), 2);
  });
});

describe('normalizePosixPath & resolveDocFromList', () => {
  const docs = [
    makeDoc({
      id: 'overview',
      slug: 'README.md',
      filePath: 'README.md',
    }),
    makeDoc({
      id: 'endpoint-reference',
      slug: 'docs/api/endpoint-reference.md',
      filePath: 'docs/api/endpoint-reference.md',
    }),
    makeDoc({
      id: 'adr-index',
      slug: 'docs/adr/README.md',
      filePath: 'docs/adr/README.md',
    }),
  ];

  it('normalizes relative POSIX path segments safely', () => {
    assert.equal(normalizePosixPath(['docs', 'adr', '..', 'api', 'openapi.json']), 'docs/api/openapi.json');
  });

  it('resolves relative Markdown links and anchors across directories', () => {
    const target = resolveDocFromList(
      docs,
      '../api/endpoint-reference.md#verified-apiv1-gateway-endpoints',
      'docs/adr/README.md'
    );
    assert.equal(target?.id, 'endpoint-reference');
  });

  it('returns undefined when target document does not exist in registry', () => {
    assert.equal(resolveDocFromList(docs, 'docs/nonexistent.md', 'README.md'), undefined);
  });
});

describe('isSafeHref', () => {
  it('allows https, http, mailto, relative paths, and anchors', () => {
    assert.equal(isSafeHref('https://github.com/Digital-India-Project/dip-docs'), true);
    assert.equal(isSafeHref('http://localhost:3000/api/v1/health'), true);
    assert.equal(isSafeHref('mailto:security@example.invalid'), true);
    assert.equal(isSafeHref('../api/endpoint-reference.md'), true);
    assert.equal(isSafeHref('#section-1'), true);
  });

  it('rejects javascript, data, and empty href protocols', () => {
    assert.equal(isSafeHref('javascript:alert(1)'), false);
    assert.equal(isSafeHref('JAVASCRIPT:void(0)'), false);
    assert.equal(isSafeHref('data:text/html,<script>alert(1)</script>'), false);
    assert.equal(isSafeHref(''), false);
    assert.equal(isSafeHref(undefined), false);
  });
});

describe('searchDocs & getExcerpt', () => {
  const docs = [
    makeDoc({
      id: 'doc-public',
      title: 'Platform Overview',
      navLabel: 'Overview',
      audienceClass: 'Public',
      summary: 'High-level guide to citizen services.',
      content: '# Platform Overview\n\nCitizen application submission guide.',
    }),
    makeDoc({
      id: 'doc-dev',
      title: 'API Overview and Idempotency',
      navLabel: 'API Overview',
      audienceClass: 'Developer',
      summary: 'Developer API contract and Bearer JWT rules.',
      headings: [{ id: 'idempotency', text: 'Idempotency-Key Rules', level: 2 }],
      content: '# API Overview\n\nAll POST requests require an Idempotency-Key header.',
    }),
  ];

  it('ranks title/heading matches ahead of summary-only matches and filters by audience', () => {
    const allResults = searchDocs(docs, 'Idempotency', 'All');
    assert.equal(allResults.length, 1);
    assert.equal(allResults[0].doc.id, 'doc-dev');
    assert.equal(allResults[0].matchedHeading, 'Idempotency-Key Rules');

    const publicOnly = searchDocs(docs, 'Idempotency', 'Public');
    assert.equal(publicOnly.length, 0);
  });

  it('returns excerpts surrounding the matched keyword', () => {
    const excerpt = getExcerpt('Alpha Beta Gamma Idempotency Delta Epsilon', 'idempotency');
    assert.ok(excerpt.includes('Idempotency'));
  });
});
