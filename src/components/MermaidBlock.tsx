import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';
import { Check, Code2, Copy, Eye } from 'lucide-react';

interface MermaidBlockProps {
  chart: string;
  isDark: boolean;
}

export function MermaidBlock({ chart, isDark }: MermaidBlockProps) {
  const uniqueId = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function renderDiagram() {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: isDark ? 'dark' : 'neutral',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        });
        const renderId = `mermaid_${uniqueId}_${isDark ? 'd' : 'l'}`;
        const result = await mermaid.render(renderId, chart);
        if (!cancelled) {
          setSvg(result.svg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to render diagram');
        }
      }
    }
    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [chart, isDark, uniqueId]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(chart).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900 px-4 py-2">
        <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
          Mermaid Diagram
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSource((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors hover:bg-neutral-200/70 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
          >
            {showSource ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>View Diagram</span>
              </>
            ) : (
              <>
                <Code2 className="h-3.5 w-3.5" />
                <span>View Source</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors hover:bg-neutral-200/70 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
            aria-label="Copy Mermaid diagram source"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showSource || error ? (
        <div className="p-4">
          {error && (
            <p className="mb-2 text-xs text-amber-800 dark:text-amber-300">
              Diagram preview fallback: {error}
            </p>
          )}
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200">
            <code>{chart}</code>
          </pre>
        </div>
      ) : (
        <div
          className="overflow-x-auto bg-white dark:bg-neutral-950 p-4 sm:p-6 flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
          aria-label="Rendered architecture or workflow diagram"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </figure>
  );
}
