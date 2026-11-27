import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileText, Search, X } from 'lucide-react';
import { AudienceClass, DOCS, DocEntry } from '../data/docs';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc: (docId: string) => void;
}

interface SearchMatch {
  doc: DocEntry;
  snippet: string;
  matchedHeading?: string;
  score: number;
}

const AUDIENCE_FILTERS: Array<'All' | AudienceClass> = [
  'All',
  'Public',
  'Developer',
  'Partner',
  'Internal',
];

function getExcerpt(content: string, query: string): string {
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

export function SearchModal({ isOpen, onClose, onSelectDoc }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'All' | AudienceClass>('All');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setAudienceFilter('All');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const results = useMemo<SearchMatch[]>(() => {
    const trimmed = query.trim().toLowerCase();
    const scopedDocs =
      audienceFilter === 'All'
        ? DOCS
        : DOCS.filter((d) => d.audienceClass === audienceFilter);

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
  }, [query, audienceFilter]);

  useEffect(() => {
    setActiveIdx(0);
  }, [results.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' && results.length > 0) {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp' && results.length > 0) {
        e.preventDefault();
        setActiveIdx((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results[activeIdx]) {
        e.preventDefault();
        onSelectDoc(results[activeIdx].doc.id);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectDoc, results, activeIdx]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-950/50 px-4 pt-12 backdrop-blur-[2px] sm:pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search English or Hindi docs, endpoints, roles, or workflows..."
            className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2">
          {AUDIENCE_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setAudienceFilter(filter)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                audienceFilter === filter
                  ? 'bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {results.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                No matching documentation found
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Try searching for terms like DIPClient, Idempotency-Key, RBAC, Cashfree, or आवेदन.
              </p>
            </div>
          ) : (
            results.map(({ doc, snippet, matchedHeading }, idx) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  onSelectDoc(doc.id);
                  onClose();
                }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`flex w-full items-start justify-between gap-4 px-5 py-3.5 text-left transition-colors focus-visible:outline-none ${
                  idx === activeIdx
                    ? 'bg-neutral-100/80 dark:bg-neutral-900'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="font-mono">{doc.filePath}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.audienceClass}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.status}</span>
                    {matchedHeading && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate text-blue-900 dark:text-blue-400">
                          {matchedHeading}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 font-serif text-base font-medium text-neutral-950 dark:text-neutral-50">
                    {doc.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {snippet}
                  </p>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-neutral-400" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="tabular-nums">
            {results.length} document{results.length === 1 ? '' : 's'}
          </span>
          <span>Use ↑↓ to navigate · Enter to open · Esc to close</span>
        </div>
      </div>
    </div>
  );
}
