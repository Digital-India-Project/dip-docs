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
          fontFamily: "'Public Sans', 'DM Sans', sans-serif",
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
    <figure className="my-6 overflow-hidden rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--dip-border)] bg-[var(--dip-bg-surface)] px-4 py-2">
        <span className="font-mono text-xs text-[var(--dip-text-muted)]">
          Mermaid Diagram
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSource((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-[var(--dip-radius-sm)] px-2 py-1 text-xs font-medium text-[var(--dip-text-secondary)] transition-colors duration-[var(--dip-duration-fast)] hover:bg-[var(--dip-bg-subtle)] hover:text-[var(--dip-text-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
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
            className="inline-flex items-center gap-1.5 rounded-[var(--dip-radius-sm)] px-2 py-1 text-xs font-medium text-[var(--dip-text-secondary)] transition-colors duration-[var(--dip-duration-fast)] hover:bg-[var(--dip-bg-subtle)] hover:text-[var(--dip-text-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
            aria-label="Copy Mermaid diagram source"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--dip-success)]" />
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
        <div className="p-4 bg-[var(--dip-bg-subtle)]">
          {error && (
            <p className="mb-2 text-xs text-[var(--dip-warning)]">
              Diagram preview fallback: {error}
            </p>
          )}
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-[var(--dip-text-primary)]">
            <code>{chart}</code>
          </pre>
        </div>
      ) : (
        <div
          className="overflow-x-auto bg-[var(--dip-bg-surface)] p-4 sm:p-6 flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
          aria-label="Rendered architecture or workflow diagram"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </figure>
  );
}
