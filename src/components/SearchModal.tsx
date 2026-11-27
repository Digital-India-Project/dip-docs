import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileText, Search, X } from 'lucide-react';
import { AudienceClass, DOCS } from '../data/docs';
import { searchDocs, type SearchMatch } from '../data/docUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc: (docId: string) => void;
}

const AUDIENCE_FILTERS: Array<'All' | AudienceClass> = [
  'All',
  'Public',
  'Developer',
  'Partner',
  'Internal',
];

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
    return searchDocs(DOCS, query, audienceFilter);
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-12 backdrop-blur-[2px] sm:pt-20"
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[var(--dip-radius-lg)] border border-[var(--dip-border-strong)] bg-[var(--dip-bg-surface)] shadow-[var(--dip-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--dip-border)] px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-[var(--dip-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search English or Hindi docs, endpoints, roles, or workflows..."
            className="w-full bg-transparent text-sm text-[var(--dip-text-primary)] placeholder:text-[var(--dip-text-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--dip-radius-sm)] p-1.5 text-[var(--dip-text-muted)] transition-colors hover:bg-[var(--dip-bg-subtle)] hover:text-[var(--dip-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] px-4 py-2">
          {AUDIENCE_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setAudienceFilter(filter)}
              className={`rounded-[var(--dip-radius-md)] px-2.5 py-1 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                audienceFilter === filter
                  ? 'bg-[var(--dip-accent)] text-[var(--dip-accent-fg)] shadow-[var(--dip-shadow-sm)]'
                  : 'text-[var(--dip-text-secondary)] hover:bg-[var(--dip-bg-surface)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto divide-y divide-[var(--dip-border)]">
          {results.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-[var(--dip-text-primary)]">
                No matching documentation found
              </p>
              <p className="mt-1 text-xs text-[var(--dip-text-muted)]">
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
                className={`flex w-full items-start justify-between gap-4 px-5 py-3.5 text-left transition-colors focus-visible:outline-none cursor-pointer ${
                  idx === activeIdx
                    ? 'bg-[var(--dip-bg-subtle)]'
                    : 'hover:bg-[var(--dip-bg-subtle)]/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--dip-text-muted)]">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--dip-text-muted)]" />
                    <span className="font-mono">{doc.filePath}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.audienceClass}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.status}</span>
                    {matchedHeading && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate text-[var(--dip-accent-text)]">
                          {matchedHeading}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-base text-[var(--dip-text-primary)]">
                    {doc.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--dip-text-secondary)]">
                    {snippet}
                  </p>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[var(--dip-text-muted)]" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] px-4 py-2.5 text-xs text-[var(--dip-text-muted)]">
          <span className="dip-tabular">
            {results.length} document{results.length === 1 ? '' : 's'}
          </span>
          <span>Use ↑↓ to navigate · Enter to open · Esc to close</span>
        </div>
      </div>
    </div>
  );
}
