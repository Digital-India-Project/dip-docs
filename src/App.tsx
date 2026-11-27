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
    } else if (nextLang === 'en') {
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
    <div className="min-h-screen bg-[var(--dip-bg-canvas)] text-[var(--dip-text-primary)] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract with dip-ui surface, border, and crimson accent */}
      <header className="sticky top-0 z-30 border-b border-[var(--dip-border)] bg-[var(--dip-bg-surface)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--dip-radius-md)] text-[var(--dip-text-secondary)] hover:bg-[var(--dip-bg-subtle)] hover:text-[var(--dip-text-primary)] lg:hidden focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('overview')}
              className="text-xl font-bold tracking-tight text-[var(--dip-text-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
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
                  className={`text-sm font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 pb-0.5 border-b-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer ${
                    isActive
                      ? 'border-[var(--dip-accent)] text-[var(--dip-text-primary)]'
                      : 'border-transparent text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
                  }`}
                >
                  {doc.navLabel}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action using dip-ui accent button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-[var(--dip-radius-md)] bg-[var(--dip-accent)] px-4 py-1.5 text-xs font-medium text-[var(--dip-accent-fg)] shadow-[var(--dip-shadow-sm)] transition-colors duration-[var(--dip-duration-fast)] hover:bg-[var(--dip-accent-hover)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search Docs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-b border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] px-4 py-4 lg:hidden">
          <nav aria-label="Mobile documentation navigation" className="space-y-5">
            {groupedDocs.map((group) => (
              <div key={group.section}>
                <p className="mb-2 text-xs font-semibold text-[var(--dip-text-muted)]">
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
                          className={`flex w-full min-h-11 items-center justify-between rounded-[var(--dip-radius-md)] px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[var(--dip-bg-surface)] font-semibold text-[var(--dip-accent-text)] shadow-[var(--dip-shadow-sm)]'
                              : 'text-[var(--dip-text-secondary)] hover:bg-[var(--dip-bg-surface)]/70 hover:text-[var(--dip-text-primary)]'
                          }`}
                        >
                          <span className="truncate">{doc.navLabel}</span>
                          <span className="ml-2 font-mono text-xs text-[var(--dip-text-muted)]">
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
              <p className="mb-2 px-1 text-xs font-semibold text-[var(--dip-text-muted)]">
                Audience Filter
              </p>
              <div className="flex flex-wrap gap-1 rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] p-1">
                {(['All', 'Public', 'Developer', 'Partner', 'Internal'] as const).map(
                  (cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setAudienceFilter(cls)}
                      className={`rounded-[var(--dip-radius-sm)] px-2 py-1 text-[11px] font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                        audienceFilter === cls
                          ? 'bg-[var(--dip-bg-surface)] text-[var(--dip-text-primary)] shadow-[var(--dip-shadow-sm)]'
                          : 'text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
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
                  <p className="mb-2 px-2.5 text-xs font-semibold text-[var(--dip-text-muted)]">
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
                            className={`flex w-full items-center justify-between rounded-[var(--dip-radius-md)] px-2.5 py-2 text-left text-sm transition-colors duration-[var(--dip-duration-fast)] focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer ${
                              isActive
                                ? 'bg-[var(--dip-accent-soft)] font-semibold text-[var(--dip-accent-text)]'
                                : 'text-[var(--dip-text-secondary)] hover:bg-[var(--dip-bg-subtle)] hover:text-[var(--dip-text-primary)]'
                            }`}
                          >
                            <span className="truncate">{doc.navLabel}</span>
                            <span className="ml-2 font-mono text-[11px] text-[var(--dip-text-muted)] shrink-0">
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

            <div className="border-t border-[var(--dip-border)] pt-5 px-2.5">
              <p className="text-xs font-semibold text-[var(--dip-text-primary)]">
                Ecosystem Baseline
              </p>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-[var(--dip-text-muted)]">Primary product</dt>
                  <dd className="font-mono font-medium text-[var(--dip-text-primary)]">
                    DIPINDIA
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-[var(--dip-text-muted)]">Design system</dt>
                  <dd className="font-mono text-[var(--dip-text-primary)]">dip-ui</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-[var(--dip-text-muted)]">Repositories</dt>
                  <dd className="font-mono dip-tabular text-[var(--dip-text-primary)]">
                    10 tracked
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-[var(--dip-text-muted)]">Documents</dt>
                  <dd className="font-mono dip-tabular text-[var(--dip-text-primary)]">
                    {DOCS.length} pages
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>

        {/* Center Document Reading Canvas */}
        <main className="min-w-0 flex-1">
          <article className="mx-auto max-w-3xl rounded-[var(--dip-radius-lg)] border border-[var(--dip-border)] bg-[var(--dip-bg-surface)] p-6 sm:p-8 shadow-[var(--dip-shadow-sm)]">
            {/* Workspace Utility Strip: Breadcrumbs + Language & Theme Controls */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--dip-border)] pb-4">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--dip-text-muted)]">
                <button
                  type="button"
                  onClick={() => handleSelectDoc('overview')}
                  className="hover:text-[var(--dip-text-primary)] cursor-pointer"
                >
                  DIP Docs
                </button>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span>{activeDoc.section}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-[var(--dip-text-primary)]">
                  {activeDoc.navLabel}
                </span>
              </nav>

              <div className="flex flex-wrap items-center gap-2">
                {/* Language Switcher */}
                <div
                  className="inline-flex items-center gap-1 rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] p-1"
                  role="group"
                  aria-label="Documentation language"
                >
                  <Globe className="ml-1.5 h-3.5 w-3.5 text-[var(--dip-text-muted)]" />
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`rounded-[var(--dip-radius-sm)] px-2.5 py-1 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                      uiLang === 'en'
                        ? 'bg-[var(--dip-bg-surface)] text-[var(--dip-text-primary)] shadow-[var(--dip-shadow-sm)]'
                        : 'text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hi')}
                    className={`rounded-[var(--dip-radius-sm)] px-2.5 py-1 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                      uiLang === 'hi'
                        ? 'bg-[var(--dip-bg-surface)] text-[var(--dip-text-primary)] shadow-[var(--dip-shadow-sm)]'
                        : 'text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>

                {/* Light / Dark Theme Switch */}
                <button
                  type="button"
                  onClick={() => setIsDark((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-[var(--dip-radius-md)] border border-[var(--dip-border-strong)] bg-[var(--dip-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--dip-text-primary)] transition-colors duration-[var(--dip-duration-fast)] hover:bg-[var(--dip-bg-subtle)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
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

            {/* Translation Pending Notice (dip-ui warning token styling) */}
            {showPendingHindiNotice && (
              <div className="mb-6 rounded-[var(--dip-radius-md)] border border-[var(--dip-warning)]/30 bg-[var(--dip-warning-soft)] px-4 py-3 text-xs text-[var(--dip-text-primary)]">
                <span className="font-semibold text-[var(--dip-warning)]">
                  Translation Pending — Authoritative English Version Shown:
                </span>{' '}
                इस पृष्ठ का समीक्षित हिंदी अनुवाद अभी लंबित है। सुरक्षा और तकनीकी सटीकता के लिए आधिकारिक अंग्रेज़ी संस्करण दिखाया जा रहा है।{' '}
                <button
                  type="button"
                  onClick={() => handleSelectDoc('hi-overview')}
                  className="font-medium text-[var(--dip-accent-text)] underline underline-offset-4 cursor-pointer"
                >
                  हिंदी अनुभाग देखें
                </button>
              </div>
            )}

            {/* Document Header (Zero-Pill Clean Metadata) */}
            <header className="border-b border-[var(--dip-border)] pb-6">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--dip-text-muted)]">
                <span className="font-mono text-[var(--dip-text-secondary)]">
                  {activeDoc.filePath}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeDoc.status}</span>
                <span aria-hidden="true">·</span>
                <span>{activeDoc.audienceClass}</span>
                <span aria-hidden="true">·</span>
                <span>Owner: {activeDoc.owner}</span>
                <span aria-hidden="true">·</span>
                <span className="dip-tabular">{activeDoc.readMinutes} min read</span>
                <span aria-hidden="true">·</span>
                <span className="dip-tabular">Verified {activeDoc.lastVerified}</span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--dip-text-primary)] sm:text-[34px] text-balance">
                {activeDoc.title}
              </h1>

              <p className="mt-3 text-base leading-relaxed text-[var(--dip-text-secondary)]">
                {activeDoc.summary}
              </p>

              {/* Document Workspace Toolbar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div
                  className="inline-flex items-center gap-1 rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] p-1"
                  role="tablist"
                  aria-label="Document view mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'formatted'}
                    onClick={() => setViewMode('formatted')}
                    className={`rounded-[var(--dip-radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                      viewMode === 'formatted'
                        ? 'bg-[var(--dip-bg-surface)] text-[var(--dip-text-primary)] shadow-[var(--dip-shadow-sm)]'
                        : 'text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
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
                      className={`rounded-[var(--dip-radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                        viewMode === 'interactive'
                          ? 'bg-[var(--dip-bg-surface)] text-[var(--dip-text-primary)] shadow-[var(--dip-shadow-sm)]'
                          : 'text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
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
                    className={`rounded-[var(--dip-radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                      viewMode === 'raw'
                        ? 'bg-[var(--dip-bg-surface)] text-[var(--dip-text-primary)] shadow-[var(--dip-shadow-sm)]'
                        : 'text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
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
                      className="inline-flex items-center gap-1.5 rounded-[var(--dip-radius-md)] border border-[var(--dip-border-strong)] bg-[var(--dip-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--dip-text-primary)] transition-colors duration-[var(--dip-duration-fast)] hover:bg-[var(--dip-bg-subtle)] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {activeDoc.lang === 'en' ? 'Read in हिन्दी' : 'Read in English'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyRaw}
                    className="inline-flex items-center gap-1.5 rounded-[var(--dip-radius-md)] border border-[var(--dip-border-strong)] bg-[var(--dip-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--dip-text-primary)] transition-colors duration-[var(--dip-duration-fast)] hover:bg-[var(--dip-bg-subtle)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[var(--dip-success)]" />
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
                <div className="my-6 overflow-hidden rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)]">
                  <div className="border-b border-[var(--dip-border)] bg-[var(--dip-bg-surface)] px-4 py-2 font-mono text-xs text-[var(--dip-text-muted)]">
                    {activeDoc.filePath}
                  </div>
                  <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-[var(--dip-text-primary)] whitespace-pre-wrap">
                    {activeDoc.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Previous / Next Document Navigation */}
            <nav
              aria-label="Document pagination"
              className="mt-14 grid grid-cols-1 gap-4 border-t border-[var(--dip-border)] pt-8 sm:grid-cols-2"
            >
              {prevDoc ? (
                <button
                  type="button"
                  onClick={() => handleSelectDoc(prevDoc.id)}
                  className="group flex flex-col items-start rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-canvas)] p-4 text-left transition-colors duration-[var(--dip-duration-fast)] hover:border-[var(--dip-border-strong)] hover:bg-[var(--dip-bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--dip-text-muted)]">
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Previous</span>
                  </span>
                  <span className="mt-1.5 text-base font-semibold text-[var(--dip-text-primary)]">
                    {prevDoc.navLabel}
                  </span>
                  <span className="mt-0.5 font-mono text-xs text-[var(--dip-text-muted)]">
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
                  className="group flex flex-col items-end rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-canvas)] p-4 text-right transition-colors duration-[var(--dip-duration-fast)] hover:border-[var(--dip-border-strong)] hover:bg-[var(--dip-bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--dip-text-muted)]">
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1.5 text-base font-semibold text-[var(--dip-text-primary)]">
                    {nextDoc.navLabel}
                  </span>
                  <span className="mt-0.5 font-mono text-xs text-[var(--dip-text-muted)]">
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
                <p className="mb-3 text-xs font-semibold text-[var(--dip-text-primary)]">
                  On this page
                </p>
                <ul className="space-y-2 border-l border-[var(--dip-border)] pl-3.5">
                  {activeDoc.headings.map((heading) => (
                    <li
                      key={heading.id}
                      className={heading.level === 3 ? 'pl-3' : ''}
                    >
                      <a
                        href={`#${heading.id}`}
                        className="block text-xs leading-snug text-[var(--dip-text-muted)] transition-colors hover:text-[var(--dip-accent-text)] focus-visible:outline-2 focus-visible:outline-[var(--dip-focus-ring)]"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-[var(--dip-border)] pt-5">
              <p className="text-xs font-semibold text-[var(--dip-text-primary)]">
                Platform positioning
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--dip-text-muted)]">
                Digital India Project is a private digital services and technology
                platform. Documentation labels sandbox and planned capabilities
                explicitly.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[var(--dip-border)] bg-[var(--dip-bg-surface)]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-xs text-[var(--dip-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[var(--dip-text-primary)]">
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
              className="transition-colors hover:text-[var(--dip-text-primary)] cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('endpoint-reference')}
              className="transition-colors hover:text-[var(--dip-text-primary)] cursor-pointer"
            >
              API Reference
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('security')}
              className="transition-colors hover:text-[var(--dip-text-primary)] cursor-pointer"
            >
              Security Policy
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('contributing-governance')}
              className="transition-colors hover:text-[var(--dip-text-primary)] cursor-pointer"
            >
              Contributing
            </button>
            <button
              type="button"
              onClick={() => handleSelectDoc('hi-overview')}
              className="transition-colors hover:text-[var(--dip-text-primary)] cursor-pointer"
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
