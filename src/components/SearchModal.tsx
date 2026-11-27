import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FileText, Search, X } from 'lucide-react';
import { DOCS, DocEntry } from '../data/docs';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc: (docId: string) => void;
}

interface SearchMatch {
  doc: DocEntry;
  snippet: string;
  matchedHeading?: string;
}

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo<SearchMatch[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return DOCS.map((doc) => ({
        doc,
        snippet: doc.summary,
      }));
    }

    const matches: SearchMatch[] = [];
    for (const doc of DOCS) {
      const titleMatch = doc.title.toLowerCase().includes(trimmed);
      const headingMatch = doc.headings.find((h) =>
        h.text.toLowerCase().includes(trimmed)
      );
      const bodyMatch = doc.content.toLowerCase().includes(trimmed);

      if (titleMatch || headingMatch || bodyMatch) {
        matches.push({
          doc,
          matchedHeading: headingMatch?.text,
          snippet: getExcerpt(doc.content, trimmed),
        });
      }
    }
    return matches;
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-950/40 px-4 pt-16 backdrop-blur-[2px] sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation titles, sections, or policy text..."
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-blue-900"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-neutral-100">
          {results.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-neutral-900">
                No matching documentation found
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Try searching for terms like DIPINDIA, OpenAPI, workstreams, or access control.
              </p>
            </div>
          ) : (
            results.map(({ doc, snippet, matchedHeading }) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  onSelectDoc(doc.id);
                  onClose();
                }}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="font-mono">{doc.filePath}</span>
                    {matchedHeading && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate text-blue-900">
                          {matchedHeading}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 font-serif text-base font-medium text-neutral-950">
                    {doc.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                    {snippet}
                  </p>
                </div>
                <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-neutral-400" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-500">
          <span>{results.length} document{results.length === 1 ? '' : 's'}</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
