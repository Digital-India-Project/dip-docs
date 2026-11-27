#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const errors = [];
const warnings = [];

function walk(dir, extFilter) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full, extFilter));
    } else if (!extFilter || extFilter(full)) {
      results.push(full);
    }
  }
  return results;
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[`*_~()[\]{}]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractHeadingSlugs(markdown) {
  const lines = markdown.split(/\r?\n/);
  const slugs = new Set();
  const seen = new Map();
  let inCode = false;
  let lastLevel = 0;
  let h1Count = 0;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      if (level === 1) h1Count += 1;
      if (lastLevel > 0 && level > lastLevel + 1) {
        // Heading skip check (warning for accessibility)
        warnings.push(`Heading jump h${lastLevel} -> h${level} (${match[2].trim()})`);
      }
      lastLevel = level;
      const raw = match[2].replace(/[`*_]/g, '').trim();
      let slug = slugifyHeading(raw);
      const c = seen.get(slug) ?? 0;
      seen.set(slug, c + 1);
      if (c > 0) slug = `${slug}-${c}`;
      slugs.add(slug);
    }
  }
  return { slugs, h1Count, inCode };
}

// 1. Collect Markdown files
const mdFiles = [path.join(ROOT, 'README.md'), ...walk(path.join(ROOT, 'docs'), (f) => f.endsWith('.md'))];
const mdHeadingMap = new Map();

for (const filePath of mdFiles) {
  const rel = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) {
    errors.push(`[empty] ${rel} is empty`);
    continue;
  }

  const { slugs, h1Count, inCode } = extractHeadingSlugs(content);
  mdHeadingMap.set(filePath, slugs);

  if (h1Count === 0) {
    errors.push(`[markdown] ${rel}: Missing top-level # H1 heading`);
  }
  if (inCode) {
    errors.push(`[markdown] ${rel}: Unclosed fenced code block`);
  }

  // Image alt-text accessibility check
  const imgMatches = [...content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  for (const m of imgMatches) {
    if (!m[1].trim()) {
      errors.push(`[a11y] ${rel}: Image missing descriptive alt text (${m[2]})`);
    }
  }
}

// 2. Broken internal link & anchor check
for (const filePath of mdFiles) {
  const rel = path.relative(ROOT, filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  // Strip fenced code blocks before checking links
  const stripped = raw.replace(/```[\s\S]*?```/g, '');
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const match of stripped.matchAll(linkRegex)) {
    const href = match[1].trim();
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:')
    ) {
      continue;
    }

    const [targetPart, anchorPart] = href.split('#');
    let resolvedFile = filePath;
    if (targetPart) {
      resolvedFile = path.resolve(path.dirname(filePath), targetPart);
      if (!fs.existsSync(resolvedFile)) {
        errors.push(`[broken-link] ${rel}: Target not found -> ${href}`);
        continue;
      }
    }

    if (anchorPart && resolvedFile.endsWith('.md')) {
      const targetSlugs = mdHeadingMap.get(resolvedFile);
      if (targetSlugs && !targetSlugs.has(anchorPart.toLowerCase())) {
        errors.push(`[broken-anchor] ${rel}: Anchor #${anchorPart} not found in ${path.relative(ROOT, resolvedFile)}`);
      }
    }
  }
}

// 3. Registry synchronization check (src/data/docs.ts references existing files)
const docsTsPath = path.join(ROOT, 'src/data/docs.ts');
if (fs.existsSync(docsTsPath)) {
  const docsTs = fs.readFileSync(docsTsPath, 'utf8');
  const importRegex = /from\s+['"](\.\.\/\.\.\/[^'"]+)\?raw['"]/g;
  const importedPaths = new Set();
  for (const m of docsTs.matchAll(importRegex)) {
    const target = path.resolve(path.dirname(docsTsPath), m[1]);
    importedPaths.add(target);
    if (!fs.existsSync(target)) {
      errors.push(`[registry] src/data/docs.ts imports missing file: ${m[1]}`);
    }
  }
  for (const mdFile of mdFiles) {
    if (!importedPaths.has(mdFile)) {
      errors.push(`[unregistered] Markdown file not registered in src/data/docs.ts: ${path.relative(ROOT, mdFile)}`);
    }
  }
}

// 4. Mermaid block syntax validation
const VALID_MERMAID_HEADERS = [
  'flowchart',
  'graph',
  'sequenceDiagram',
  'stateDiagram-v2',
  'stateDiagram',
  'erDiagram',
  'classDiagram',
  'gantt',
];
for (const filePath of mdFiles) {
  const rel = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const mermaidBlocks = [...content.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)];
  for (let i = 0; i < mermaidBlocks.length; i++) {
    const block = mermaidBlocks[i][1].trim();
    if (!block) {
      errors.push(`[mermaid] ${rel}: Empty mermaid block #${i + 1}`);
      continue;
    }
    const firstLine = block.split(/\r?\n/)[0].trim();
    const validHeader = VALID_MERMAID_HEADERS.some((h) => firstLine.startsWith(h));
    if (!validHeader) {
      errors.push(`[mermaid] ${rel}: Invalid diagram header '${firstLine}' in block #${i + 1}`);
    }
    const openParens = (block.match(/\[/g) || []).length;
    const closeParens = (block.match(/\]/g) || []).length;
    if (openParens !== closeParens) {
      errors.push(`[mermaid] ${rel}: Unbalanced [] brackets in mermaid block #${i + 1}`);
    }
  }
}

// 5. OpenAPI 3.1.0 validation
const openApiPath = path.join(ROOT, 'docs/api/openapi.json');
if (!fs.existsSync(openApiPath)) {
  errors.push('[openapi] Missing docs/api/openapi.json');
} else {
  try {
    const spec = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
    if (spec.openapi !== '3.1.0') {
      errors.push(`[openapi] Expected openapi 3.1.0, got ${spec.openapi}`);
    }
    if (!spec.info?.title || !spec.info?.version) {
      errors.push('[openapi] Missing info.title or info.version');
    }
    const pathKeys = Object.keys(spec.paths || {});
    if (pathKeys.length < 15) {
      errors.push(`[openapi] Expected full route catalogue in openapi.json, found ${pathKeys.length} paths`);
    }
    for (const p of pathKeys) {
      if (!p.startsWith('/')) {
        errors.push(`[openapi] Path must start with '/': ${p}`);
      }
    }
  } catch (err) {
    errors.push(`[openapi] Invalid JSON: ${err.message}`);
  }
}

// 6. Duplicate paragraph check across English docs
const seenParagraphs = new Map();
for (const filePath of mdFiles) {
  const rel = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8').replace(/```[\s\S]*?```/g, '');
  const paragraphs = content.split(/\r?\n\s*\r?\n/);
  for (const p of paragraphs) {
    const norm = p.trim().replace(/\s+/g, ' ');
    if (norm.length < 180 || norm.startsWith('#') || norm.startsWith('|')) continue;
    const hash = crypto.createHash('sha256').update(norm).digest('hex');
    if (seenParagraphs.has(hash)) {
      warnings.push(`[duplicate] Long paragraph duplicated between ${seenParagraphs.get(hash)} and ${rel}`);
    } else {
      seenParagraphs.set(hash, rel);
    }
  }
}

// 7. Secret & Prohibited Branding Scan
const scanFiles = [
  ...mdFiles,
  ...walk(path.join(ROOT, 'src'), (f) => /\.(ts|tsx|css|json)$/.test(f)),
  ...walk(path.join(ROOT, 'scripts'), (f) => /\.(js|mjs|ts)$/.test(f)),
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'integration/manifest.json'),
].filter((f) => fs.existsSync(f));

const SECRET_PATTERNS = [
  { name: 'Private Key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'GitHub PAT', regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { name: 'AWS Key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Live Secret Key', regex: /\b(sk_live|cf_live|rk_live)_[A-Za-z0-9]{12,}\b/ },
  { name: 'Banned Emblem Reference', regex: /ashoka\s+chakra/i },
];

for (const filePath of scanFiles) {
  const rel = path.relative(ROOT, filePath);
  if (rel === 'scripts/validate-docs.mjs' || rel === 'docs/contributing/contributing-and-governance.md') continue;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pat of SECRET_PATTERNS) {
    if (pat.regex.test(content)) {
      errors.push(`[security-scan] ${rel}: Matched prohibited pattern (${pat.name})`);
    }
  }
}

// 8. Sitemap & SEO metadata check
const sitemapPath = path.join(ROOT, 'public/sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  errors.push('[seo] Missing public/sitemap.xml');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  if (!sitemap.includes('<urlset') || !sitemap.includes('#overview')) {
    errors.push('[seo] public/sitemap.xml missing expected urlset entries');
  }
}

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const requiredMeta of ['<title>', 'name="description"', 'property="og:title"', 'name="twitter:card"', 'application/ld+json']) {
  if (!indexHtml.includes(requiredMeta)) {
    errors.push(`[seo] index.html missing ${requiredMeta}`);
  }
}

// 9. Integration Manifest validation
const manifestPath = path.join(ROOT, 'integration/manifest.json');
if (!fs.existsSync(manifestPath)) {
  errors.push('[manifest] Missing integration/manifest.json');
} else {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const key of [
      'repositoryName',
      'repositoryVersion',
      'packageName',
      'runtimeRequirements',
      'frameworkRequirements',
      'publicExports',
      'apiContractsConsumed',
      'apiContractsProvided',
      'authenticationDependencies',
      'databaseDependencies',
      'infrastructureDependencies',
      'environmentVariables',
      'relatedRepositoryVersions',
      'compatibilityStatus',
      'knownBlockers',
    ]) {
      if (!(key in manifest)) {
        errors.push(`[manifest] Missing required field '${key}' in integration/manifest.json`);
      }
    }
  } catch (err) {
    errors.push(`[manifest] Invalid JSON in integration/manifest.json: ${err.message}`);
  }
}

console.log(`DIP Docs Validation Summary:`);
console.log(`- Markdown files checked: ${mdFiles.length}`);
console.log(`- Warnings: ${warnings.length}`);
for (const w of warnings) console.log(`  WARN: ${w}`);
console.log(`- Errors: ${errors.length}`);
for (const e of errors) console.error(`  ERR: ${e}`);

if (errors.length > 0) {
  process.exit(1);
}
console.log('All documentation quality, link, OpenAPI, Mermaid, SEO, and security checks passed.');
