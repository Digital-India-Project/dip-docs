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
  GET: 'text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40',
  POST: 'text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40',
  PATCH: 'text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40',
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
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-medium text-neutral-950 dark:text-neutral-50">
              {OPENAPI_SPEC.info.title}
            </h2>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              OpenAPI {OPENAPI_SPEC.openapi} · Version {OPENAPI_SPEC.info.version} ·{' '}
              <span className="tabular-nums">{operations.length} operations</span>
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 p-1">
            {(['all', 'authenticated', 'public'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthFilter(mode)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                  authFilter === mode
                    ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
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
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedTag === tag
                  ? 'border-blue-900 bg-blue-900 text-white dark:border-blue-500 dark:bg-blue-500 dark:text-neutral-950'
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            No endpoints match the selected filters
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Reset tag or authentication filters to view all verified /api/v1 operations.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          {filtered.map((op) => (
            <div key={`${op.method}-${op.path}`} className="p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold ${
                      METHOD_STYLES[op.method] ??
                      'border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {op.method}
                  </span>
                  <code className="font-mono text-xs sm:text-sm font-medium text-neutral-950 dark:text-neutral-100">
                    {op.path}
                  </code>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="inline-flex items-center gap-1">
                    {op.requiresAuth ? (
                      <>
                        <Lock className="h-3 w-3 text-blue-900 dark:text-blue-400" />
                        <span>Bearer JWT</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                        <span>Public</span>
                      </>
                    )}
                  </span>
                  {op.requiresIdempotency && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                        Idempotency-Key
                      </span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {op.summary}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
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
