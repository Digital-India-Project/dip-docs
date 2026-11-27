import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { DOCS, DocEntry } from './data/docs';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { SearchModal } from './components/SearchModal';

const TOP_NAV_IDS = [
  'overview',
  'project-plan',
  'architecture',
  'roadmap',
  'security',
];

const SECTIONS_ORDER = [
  'Foundation',
  'Planning & Governance',
  'System Design',
  'Trust & Compliance',
];

function getInitialDocId(): string {
  const hash = window.location.hash.replace(/^#/, '').split('/')[0];
  if (hash && DOCS.some((d) => d.id === hash)) {
    return hash;
  }
  return DOCS[0].id;
}

export function App() {
  const [activeDocId, setActiveDocId] = useState<string>(getInitialDocId);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const activeIndex = DOCS.findIndex((d) => d.id === activeDocId);
  const activeDoc: DocEntry = DOCS[activeIndex >= 0 ? activeIndex : 0];
  const prevDoc = activeIndex > 0 ? DOCS[activeIndex - 1] : null;
  const nextDoc =
    activeIndex >= 0 && activeIndex < DOCS.length - 1
      ? DOCS[activeIndex + 1]
      : null;

  const groupedDocs = useMemo(() => {
    return SECTIONS_ORDER.map((section) => ({
      section,
      items: DOCS.filter((d) => d.section === section),
    })).filter((g) => g.items.length > 0);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const next = getInitialDocId();
      setActiveDocId(next);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectDoc = (docId: string, anchor?: string) => {
    setActiveDocId(docId);
    setViewMode('formatted');
    setIsMobileMenuOpen(false);
    window.history.pushState(null, '', `#${docId}`);

    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyRaw = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeDoc.content).then(() => {
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 1800);
      });
    }
  };

  const topNavDocs = TOP_NAV_IDS.map((id) => DOCS.find((d) => d.id === id)).filter(
    (d): d is DocEntry => Boolean(d)
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden focus-visible:outline-2 focus-visible:outline-blue-900"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('overview')}
              className="font-serif text-xl font-semibold tracking-tight text-neutral-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900"
            >
              DIP Docs
            </button>
          </div>

          <nav
            aria-label="Primary documentation sections"
            className="hidden lg:flex items-center gap-6"
          >
            {topNavDocs.map((doc) => {
              const isActive = doc.id === activeDoc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectDoc(doc.id)}
                  className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 ${
                    isActive
                      ? 'border-blue-900 text-neutral-950'
                      : 'border-transparent text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {doc.navLabel}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search Docs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-4 lg:hidden">
          <nav aria-label="Mobile documentation navigation" className="space-y-5">
            {groupedDocs.map((group) => (
              <div key={group.section}>
                <p className="mb-2 text-xs font-semibold text-neutral-500">
                  {group.section}
                </p>
                <ul className="space-y-1">
                  {group.items.map((doc) => {
                    const isActive = doc.id === activeDoc.id;
                    return (
                      <li key={doc.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectDoc(doc.id)}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? 'bg-white font-semibold text-blue-900 shadow-xs'
                              : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                          }`}
                        >
                          <span>{doc.navLabel}</span>
                          <span className="font-mono text-xs text-neutral-400">
                            {doc.filePath.replace('docs/', '')}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main 3-Column Documentation Layout */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Left Navigation Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-7">
            <nav aria-label="Document repository index" className="space-y-6">
              {groupedDocs.map((group) => (
                <div key={group.section}>
                  <p className="mb-2 px-2.5 text-xs font-semibold text-neutral-500">
                    {group.section}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((doc) => {
                      const isActive = doc.id === activeDoc.id;
                      return (
                        <li key={doc.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectDoc(doc.id)}
                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-blue-900 ${
                              isActive
                                ? 'bg-neutral-100 font-semibold text-blue-900'
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                            }`}
                          >
                            <span className="truncate">{doc.navLabel}</span>
                            <span className="ml-2 font-mono text-[11px] text-neutral-400">
                              {doc.filePath === 'README.md' ? 'README' : doc.id}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-neutral-200 pt-5 px-2.5">
              <p className="text-xs font-semibold text-neutral-900">
                Source-of-truth baseline
              </p>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-500">Primary product</dt>
                  <dd className="font-mono font-medium text-neutral-800">
                    DIPINDIA
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-500">Repository</dt>
                  <dd className="font-mono text-neutral-800">dip-docs</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-500">Documents</dt>
                  <dd className="font-mono tabular-nums text-neutral-800">
                    {DOCS.length} files
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>

        {/* Center Document Reading Canvas */}
        <main className="min-w-0 flex-1">
          <article className="mx-auto max-w-3xl">
            {/* Document Header */}
            <header className="border-b border-neutral-200 pb-6">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                <span className="font-mono text-neutral-700">
                  {activeDoc.filePath}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeDoc.status}</span>
                <span aria-hidden="true">·</span>
                <span>{activeDoc.audience}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeDoc.readMinutes} min read</span>
              </div>

              <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl text-balance">
                {activeDoc.title}
              </h1>

              <p className="mt-3 text-base leading-relaxed text-neutral-600">
                {activeDoc.summary}
              </p>

              {/* Document Workspace Toolbar (below fold/title, not in top bar) */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div
                  className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 p-1"
                  role="tablist"
                  aria-label="Document view mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'formatted'}
                    onClick={() => setViewMode('formatted')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      viewMode === 'formatted'
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    Formatted View
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'raw'}
                    onClick={() => setViewMode('raw')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      viewMode === 'raw'
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    Raw Markdown
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyRaw}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-900"
                >
                  {copiedRaw ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Markdown Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Document Body */}
            <div className="pt-4">
              {viewMode === 'formatted' ? (
                <MarkdownRenderer
                  doc={activeDoc}
                  onNavigateDoc={handleSelectDoc}
                />
              ) : (
                <div className="my-6 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  <div className="border-b border-neutral-200 bg-neutral-100/70 px-4 py-2 font-mono text-xs text-neutral-600">
                    {activeDoc.filePath}
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-neutral-800 whitespace-pre-wrap">
                    {activeDoc.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Previous / Next Document Navigation */}
            <nav
              aria-label="Document pagination"
              className="mt-14 grid grid-cols-1 gap-4 border-t border-neutral-200 pt-8 sm:grid-cols-2"
            >
              {prevDoc ? (
                <button
                  type="button"
                  onClick={() => handleSelectDoc(prevDoc.id)}
                  className="group flex flex-col items-start rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-blue-900"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Previous</span>
                  </span>
                  <span className="mt-1.5 font-serif text-base font-medium text-neutral-950">
                    {prevDoc.navLabel}
                  </span>
                  <span className="mt-0.5 font-mono text-xs text-neutral-500">
                    {prevDoc.filePath}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextDoc && (
                <button
                  type="button"
                  onClick={() => handleSelectDoc(nextDoc.id)}
                  className="group flex flex-col items-end rounded-lg border border-neutral-200 p-4 text-right transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-blue-900"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1.5 font-serif text-base font-medium text-neutral-950">
                    {nextDoc.navLabel}
                  </span>
                  <span className="mt-0.5 font-mono text-xs text-neutral-500">
                    {nextDoc.filePath}
                  </span>
                </button>
              )}
            </nav>
          </article>
        </main>

        {/* Right Margin Table of Contents & Governance Notes */}
        <aside className="hidden xl:block w-60 shrink-0">
          <div className="sticky top-24 space-y-8">
            {activeDoc.headings.length > 0 && viewMode === 'formatted' && (
              <div>
                <p className="mb-3 text-xs font-semibold text-neutral-900">
                  On this page
                </p>
                <ul className="space-y-2 border-l border-neutral-200 pl-3.5">
                  {activeDoc.headings.map((heading) => (
                    <li
                      key={heading.id}
                      className={heading.level === 3 ? 'pl-3' : ''}
                    >
                      <a
                        href={`#${heading.id}`}
                        className="block text-xs leading-snug text-neutral-600 transition-colors hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-blue-900"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-5">
              <p className="text-xs font-semibold text-neutral-900">
                Governance policy
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                Documentation must reflect verified implementation, label planned
                work explicitly, and keep restricted operational details private.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50/70">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-neutral-700">
              Digital India Project
            </span>
            <span aria-hidden="true">·</span>
            <span>DIP Docs Planning Foundation</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {DOCS.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelectDoc(doc.id)}
                className="transition-colors hover:text-neutral-900"
              >
                {doc.navLabel}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectDoc={(docId) => handleSelectDoc(docId)}
      />
    </div>
  );
}

export default App;
