import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Globe,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import {
  AudienceClass,
  DOCS,
  DocEntry,
  DocLanguage,
} from './data/docs';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { SearchModal } from './components/SearchModal';
import { ApiEndpointExplorer } from './components/ApiEndpointExplorer';
import { RolePermissionMatrix } from './components/RolePermissionMatrix';

const TOP_NAV_IDS = [
  'platform-overview',
  'getting-started',
  'roles-permissions',
  'endpoint-reference',
  'security',
];

const SECTIONS_ORDER = [
  'Platform Overview',
  'Getting Started',
  'User Guides & Roles',
  'Workflows & Services',
  'API & SDK',
  'Security & Operations',
  'Planning & Governance',
  'हिंदी दस्तावेज़ीकरण',
];

function getInitialDocId(): string {
  const hash = window.location.hash.replace(/^#/, '').split('/')[0];
  if (hash && DOCS.some((d) => d.id === hash)) {
    return hash;
  }
  return DOCS[0].id;
}

function getInitialTheme(): boolean {
  try {
    return (
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('dip-docs-theme') === 'dark'
    );
  } catch {
    return false;
  }
}

export function App() {
  const [activeDocId, setActiveDocId] = useState<string>(getInitialDocId);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw' | 'interactive'>('formatted');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);
  const [uiLang, setUiLang] = useState<DocLanguage>('en');
  const [audienceFilter, setAudienceFilter] = useState<'All' | AudienceClass>('All');

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
      items: DOCS.filter((d) => {
        if (d.section !== section) return false;
        if (audienceFilter !== 'All' && d.audienceClass !== audienceFilter) {
          return false;
        }
        return true;
      }),
    })).filter((g) => g.items.length > 0);
  }, [audienceFilter]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('dip-docs-theme', isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage failures
    }
  }, [isDark]);

  useEffect(() => {
    document.title = `${activeDoc.navLabel} — DIP Docs`;
    document.documentElement.lang = activeDoc.lang;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', activeDoc.summary);
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute(
        'href',
        `${window.location.origin}${window.location.pathname}#${activeDoc.id}`
      );
    }
  }, [activeDoc]);

  useEffect(() => {
    const handleHashChange = () => {
      const next = getInitialDocId();
      setActiveDocId(next);
      setViewMode('formatted');
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
    const target = DOCS.find((d) => d.id === docId);
    setActiveDocId(docId);
    if (target) {
      setUiLang(target.lang);
    }
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

  const handleLanguageChange = (nextLang: DocLanguage) => {
    setUiLang(nextLang);
    if (activeDoc.lang === nextLang) return;
    if (activeDoc.translationPairId) {
      handleSelectDoc(activeDoc.translationPairId);
    } else if (nextLang === 'hi') {
      // Keep user on current English page with explicit Translation Pending notice,
      // or let them navigate to Hindi Overview directly.
    } else {
      handleSelectDoc('overview');
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

  const showPendingHindiNotice = uiLang === 'hi' && activeDoc.lang === 'en';

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('overview')}
              className="font-serif text-xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
            >
              DIP Docs
            </button>
          </div>

          {/* Zone 2: 5 concise single-line navigation links */}
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
                  className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400 ${
                    isActive
                      ? 'border-blue-900 dark:border-blue-400 text-neutral-950 dark:text-neutral-50'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                  }`}
                >
                  {doc.navLabel}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 dark:bg-neutral-100 px-4 py-2 text-xs font-medium text-white dark:text-neutral-950 transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search Docs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 lg:hidden">
          <nav aria-label="Mobile documentation navigation" className="space-y-5">
            {groupedDocs.map((group) => (
              <div key={group.section}>
                <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
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
                          className={`flex w-full min-h-11 items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? 'bg-white dark:bg-neutral-950 font-semibold text-blue-900 dark:text-blue-400 shadow-xs'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span className="truncate">{doc.navLabel}</span>
                          <span className="ml-2 font-mono text-xs text-neutral-400">
                            {doc.audienceClass}
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
        <aside className="hidden lg:block w-68 shrink-0">
          <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            {/* Audience Scope Filter */}
            <div>
              <p className="mb-2 px-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Audience Filter
              </p>
              <div className="flex flex-wrap gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-1">
                {(['All', 'Public', 'Developer', 'Partner', 'Internal'] as const).map(
                  (cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setAudienceFilter(cls)}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                        audienceFilter === cls
                          ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                      }`}
                    >
                      {cls}
                    </button>
                  )
                )}
              </div>
            </div>

            <nav aria-label="Document repository index" className="space-y-6">
              {groupedDocs.map((group) => (
                <div key={group.section}>
                  <p className="mb-2 px-2.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
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
                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400 ${
                              isActive
                                ? 'bg-neutral-100 dark:bg-neutral-900 font-semibold text-blue-900 dark:text-blue-400'
                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-950 dark:hover:text-neutral-100'
                            }`}
                          >
                            <span className="truncate">{doc.navLabel}</span>
                            <span className="ml-2 font-mono text-[11px] text-neutral-400 dark:text-neutral-500 shrink-0">
                              {doc.lang === 'hi' ? 'HI' : doc.audienceClass[0]}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5 px-2.5">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Ecosystem Baseline
              </p>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-500 dark:text-neutral-400">Primary product</dt>
                  <dd className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    DIPINDIA
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-500 dark:text-neutral-400">Repositories</dt>
                  <dd className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                    10 tracked
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-500 dark:text-neutral-400">Documents</dt>
                  <dd className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                    {DOCS.length} pages
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>

        {/* Center Document Reading Canvas */}
        <main className="min-w-0 flex-1">
          <article className="mx-auto max-w-3xl">
            {/* Workspace Utility Strip: Breadcrumbs + Language & Theme Controls */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <button
                  type="button"
                  onClick={() => handleSelectDoc('overview')}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  DIP Docs
                </button>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span>{activeDoc.section}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {activeDoc.navLabel}
                </span>
              </nav>

              <div className="flex flex-wrap items-center gap-2">
                {/* Language Switcher */}
                <div
                  className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-1"
                  role="group"
                  aria-label="Documentation language"
                >
                  <Globe className="ml-1.5 h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      uiLang === 'en'
                        ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hi')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      uiLang === 'hi'
                        ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>

                {/* Light / Dark Theme Switch */}
                <button
                  type="button"
                  onClick={() => setIsDark((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
                  aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  {isDark ? (
                    <>
                      <Sun className="h-3.5 w-3.5" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-3.5 w-3.5" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Translation Pending Notice (Honest Bilingual Handling) */}
            {showPendingHindiNotice && (
              <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 px-4 py-3 text-xs text-neutral-800 dark:text-neutral-200">
                <span className="font-semibold text-amber-900 dark:text-amber-300">
                  Translation Pending — Authoritative English Version Shown:
                </span>{' '}
                इस पृष्ठ का समीक्षित हिंदी अनुवाद अभी लंबित है। सुरक्षा और तकनीकी सटीकता के लिए आधिकारिक अंग्रेज़ी संस्करण दिखाया जा रहा है।{' '}
                <button
                  type="button"
                  onClick={() => handleSelectDoc('hi-overview')}
                  className="font-medium text-blue-900 dark:text-blue-400 underline underline-offset-4"
                >
                  हिंदी अनुभाग देखें
                </button>
              </div>
            )}

            {/* Document Header (Zero-Pill Clean Metadata) */}
            <header className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  {activeDoc.filePath}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeDoc.status}</span>
                <span aria-hidden="true">·</span>
                <span>{activeDoc.audienceClass}</span>
                <span aria-hidden="true">·</span>
                <span>Owner: {activeDoc.owner}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeDoc.readMinutes} min read</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Verified {activeDoc.lastVerified}</span>
              </div>

              <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl text-balance">
                {activeDoc.title}
              </h1>

              <p className="mt-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                {activeDoc.summary}
              </p>

              {/* Document Workspace Toolbar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div
                  className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-1"
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
                        ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                    }`}
                  >
                    Formatted View
                  </button>
                  {activeDoc.interactiveModule && (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewMode === 'interactive'}
                      onClick={() => setViewMode('interactive')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        viewMode === 'interactive'
                          ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                      }`}
                    >
                      {activeDoc.interactiveModule === 'endpoint-explorer'
                        ? 'OpenAPI Explorer'
                        : 'Interactive Matrix'}
                    </button>
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'raw'}
                    onClick={() => setViewMode('raw')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      viewMode === 'raw'
                        ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                    }`}
                  >
                    Raw Markdown
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeDoc.translationPairId && (
                    <button
                      type="button"
                      onClick={() => handleSelectDoc(activeDoc.translationPairId!)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0"
                    >
                      {activeDoc.lang === 'en' ? 'Read in हिन्दी' : 'Read in English'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyRaw}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
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
              </div>
            </header>

            {/* Document Body */}
            <div className="pt-4">
              {viewMode === 'interactive' &&
              activeDoc.interactiveModule === 'endpoint-explorer' ? (
                <ApiEndpointExplorer />
              ) : viewMode === 'interactive' &&
                activeDoc.interactiveModule === 'rbac-matrix' ? (
                <RolePermissionMatrix />
              ) : viewMode === 'formatted' ? (
                <>
                  {activeDoc.interactiveModule === 'endpoint-explorer' && (
                    <ApiEndpointExplorer />
                  )}
                  {activeDoc.interactiveModule === 'rbac-matrix' && (
                    <RolePermissionMatrix />
                  )}
                  <MarkdownRenderer
                    doc={activeDoc}
                    isDark={isDark}
                    onNavigateDoc={handleSelectDoc}
                  />
                </>
              ) : (
                <div className="my-6 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900 px-4 py-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    {activeDoc.filePath}
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                    {activeDoc.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Previous / Next Document Navigation */}
            <nav
              aria-label="Document pagination"
              className="mt-14 grid grid-cols-1 gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-8 sm:grid-cols-2"
            >
              {prevDoc ? (
                <button
                  type="button"
                  onClick={() => handleSelectDoc(prevDoc.id)}
                  className="group flex flex-col items-start rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-left transition-colors hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Previous</span>
                  </span>
                  <span className="mt-1.5 font-serif text-base font-medium text-neutral-950 dark:text-neutral-50">
                    {prevDoc.navLabel}
                  </span>
                  <span className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
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
                  className="group flex flex-col items-end rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-right transition-colors hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1.5 font-serif text-base font-medium text-neutral-950 dark:text-neutral-50">
                    {nextDoc.navLabel}
                  </span>
                  <span className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
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
                <p className="mb-3 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  On this page
                </p>
                <ul className="space-y-2 border-l border-neutral-200 dark:border-neutral-800 pl-3.5">
                  {activeDoc.headings.map((heading) => (
                    <li
                      key={heading.id}
                      className={heading.level === 3 ? 'pl-3' : ''}
                    >
                      <a
                        href={`#${heading.id}`}
                        className="block text-xs leading-snug text-neutral-600 dark:text-neutral-400 transition-colors hover:text-blue-900 dark:hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-5">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Platform positioning
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                Digital India Project is a private digital services and technology
                platform. Documentation labels sandbox and planned capabilities
                explicitly.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-xs text-neutral-500 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-neutral-700 dark:text-neutral-200">
              Digital India Project
            </span>
            <span aria-hidden="true">·</span>
            <span>Private Digital Services Platform</span>
            <span aria-hidden="true">·</span>
            <span>DIP Docs Foundation</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleSelectDoc('platform-overview')}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('endpoint-reference')}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              API Reference
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('security')}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Security Policy
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('contributing-governance')}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Contributing
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('hi-overview')}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              हिन्दी
            </button>
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
