import { useMemo, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { OPENAPI_SPEC } from '../data/docs';

interface OperationRow {
  method: string;
  path: string;
  summary: string;
  tags: string[];
  requiresAuth: boolean;
  requiresIdempotency: boolean;
  parameters: Array<{ name: string; in: string; required?: boolean }>;
  responses: Record<string, { description?: string }>;
}

const METHOD_STYLES: Record<string, string> = {
  GET: 'text-[var(--dip-info)] border-[var(--dip-info)]/30 bg-[var(--dip-info-soft)]',
  POST: 'text-[var(--dip-success)] border-[var(--dip-success)]/30 bg-[var(--dip-success-soft)]',
  PATCH: 'text-[var(--dip-warning)] border-[var(--dip-warning)]/30 bg-[var(--dip-warning-soft)]',
};

export function ApiEndpointExplorer() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [authFilter, setAuthFilter] = useState<'all' | 'authenticated' | 'public'>('all');

  const operations = useMemo<OperationRow[]>(() => {
    const rows: OperationRow[] = [];
    const paths = OPENAPI_SPEC.paths as Record<
      string,
      Record<
        string,
        {
          summary?: string;
          tags?: string[];
          security?: unknown[];
          parameters?: Array<{ name: string; in: string; required?: boolean }>;
          responses?: Record<string, { description?: string }>;
        }
      >
    >;

    for (const [pathKey, methodsObj] of Object.entries(paths)) {
      for (const [method, op] of Object.entries(methodsObj)) {
        const params = op.parameters ?? [];
        rows.push({
          method: method.toUpperCase(),
          path: `/api/v1${pathKey}`,
          summary: op.summary ?? '',
          tags: op.tags ?? ['General'],
          requiresAuth: Boolean(op.security && op.security.length > 0),
          requiresIdempotency: params.some(
            (p) => p.in === 'header' && p.name.toLowerCase() === 'idempotency-key'
          ),
          parameters: params,
          responses: op.responses ?? {},
        });
      }
    }
    return rows;
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const op of operations) {
      for (const t of op.tags) set.add(t);
    }
    return Array.from(set);
  }, [operations]);

  const filtered = useMemo(() => {
    return operations.filter((op) => {
      if (selectedTag !== 'All' && !op.tags.includes(selectedTag)) return false;
      if (authFilter === 'authenticated' && !op.requiresAuth) return false;
      if (authFilter === 'public' && op.requiresAuth) return false;
      return true;
    });
  }, [operations, selectedTag, authFilter]);

  return (
    <section
      aria-label="Interactive OpenAPI 3.1.0 Explorer"
      className="my-6 space-y-5"
    >
      <div className="rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-semibold text-lg text-[var(--dip-text-primary)]">
              {OPENAPI_SPEC.info.title}
            </h2>
            <p className="mt-1 text-xs text-[var(--dip-text-muted)]">
              OpenAPI {OPENAPI_SPEC.openapi} · Version {OPENAPI_SPEC.info.version} ·{' '}
              <span className="dip-tabular">{operations.length} operations</span>
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-surface)] p-1">
            {(['all', 'authenticated', 'public'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthFilter(mode)}
                className={`rounded-[var(--dip-radius-sm)] px-2.5 py-1 text-xs font-medium capitalize transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                  authFilter === mode
                    ? 'bg-[var(--dip-bg-subtle)] text-[var(--dip-text-primary)] font-semibold'
                    : 'text-[var(--dip-text-muted)] hover:text-[var(--dip-text-primary)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filter endpoints by tag">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`rounded-[var(--dip-radius-md)] border px-2.5 py-1 text-xs font-medium transition-colors duration-[var(--dip-duration-fast)] whitespace-nowrap shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'border-transparent bg-[var(--dip-accent)] text-[var(--dip-accent-fg)] shadow-[var(--dip-shadow-sm)]'
                  : 'border-[var(--dip-border)] bg-[var(--dip-bg-surface)] text-[var(--dip-text-secondary)] hover:border-[var(--dip-border-strong)] hover:bg-[var(--dip-bg-subtle)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-surface)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--dip-text-primary)]">
            No endpoints match the selected filters
          </p>
          <p className="mt-1 text-xs text-[var(--dip-text-muted)]">
            Reset tag or authentication filters to view all verified /api/v1 operations.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--dip-border)] rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-surface)]">
          {filtered.map((op) => (
            <div key={`${op.method}-${op.path}`} className="p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`rounded-[var(--dip-radius-sm)] border px-2 py-0.5 font-mono text-xs font-semibold ${
                      METHOD_STYLES[op.method] ??
                      'border-[var(--dip-border)] text-[var(--dip-text-primary)]'
                    }`}
                  >
                    {op.method}
                  </span>
                  <code className="font-mono text-xs sm:text-sm font-medium text-[var(--dip-text-primary)]">
                    {op.path}
                  </code>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--dip-text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    {op.requiresAuth ? (
                      <>
                        <Lock className="h-3 w-3 text-[var(--dip-accent-text)]" />
                        <span>Bearer JWT</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3 text-[var(--dip-success)]" />
                        <span>Public</span>
                      </>
                    )}
                  </span>
                  {op.requiresIdempotency && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-[var(--dip-text-secondary)]">
                        Idempotency-Key
                      </span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-[var(--dip-text-secondary)]">
                {op.summary}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--dip-text-muted)]">
                <span>Tag: {op.tags.join(', ')}</span>
                <span>
                  Responses: {Object.keys(op.responses).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
