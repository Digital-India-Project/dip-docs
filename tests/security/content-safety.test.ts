import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function collectFiles(dir: string, predicate: (f: string) => boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, predicate));
    } else if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

describe('Repository Security & Content Safety Invariants', () => {
  const sourceFiles = [
    ...collectFiles(path.join(ROOT, 'src'), (f) => /\.(ts|tsx|css|json)$/.test(f)),
    ...collectFiles(path.join(ROOT, 'docs'), (f) => /\.(md|json)$/.test(f)),
    path.join(ROOT, 'README.md'),
    path.join(ROOT, 'integration/manifest.json'),
    path.join(ROOT, 'index.html'),
  ];

  it('contains zero private keys, live secret prefixes, or GitHub PAT tokens', () => {
    const patterns = [
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
      /\bAKIA[0-9A-Z]{16}\b/,
      /\b(sk_live|cf_live|rk_live)_[A-Za-z0-9]{12,}\b/,
    ];
    for (const file of sourceFiles) {
      const text = fs.readFileSync(file, 'utf8');
      for (const re of patterns) {
        assert.equal(
          re.test(text),
          false,
          `Prohibited credential pattern ${re} detected in ${path.relative(ROOT, file)}`
        );
      }
    }
  });

  it('avoids dangerouslySetInnerHTML across React components', () => {
    const tsxFiles = collectFiles(path.join(ROOT, 'src'), (f) => /\.tsx$/.test(f));
    for (const file of tsxFiles) {
      const text = fs.readFileSync(file, 'utf8');
      assert.equal(
        text.includes('dangerouslySetInnerHTML'),
        false,
        `Unsafe raw HTML binding dangerouslySetInnerHTML found in ${path.relative(ROOT, file)}`
      );
    }
  });

  it('enforces H1 accessibility headings and rejects empty image alt text in all Markdown docs', () => {
    const mdFiles = [
      path.join(ROOT, 'README.md'),
      ...collectFiles(path.join(ROOT, 'docs'), (f) => f.endsWith('.md')),
    ];
    for (const file of mdFiles) {
      const text = fs.readFileSync(file, 'utf8');
      assert.match(text, /^#\s+.+/m, `Missing top-level H1 heading in ${path.relative(ROOT, file)}`);
      for (const img of text.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
        assert.ok(
          img[1].trim().length > 0,
          `Missing image alt text in ${path.relative(ROOT, file)} (${img[2]})`
        );
      }
    }
  });
});
