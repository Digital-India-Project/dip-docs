import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { DocEntry, resolveDocByHref, slugifyHeading } from '../data/docs';

interface MarkdownRendererProps {
  doc: DocEntry;
  onNavigateDoc: (docId: string, anchor?: string) => void;
}

function flattenText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(flattenText).join('');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return flattenText(children.props.children);
  }
  return '';
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const text = flattenText(children).replace(/\n$/, '');

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/70 px-4 py-2">
        <span className="font-mono text-xs text-neutral-500">
          {className ? className.replace('language-', '') : 'diagram / text'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200/70 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          aria-label="Copy block contents"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-700" />
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
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-neutral-800">
        <code>{text}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ doc, onNavigateDoc }: MarkdownRendererProps) {
  const headingCounts = new Map<string, number>();

  const nextHeadingId = (rawChildren: React.ReactNode): string => {
    const text = flattenText(rawChildren);
    const base = slugifyHeading(text);
    const count = headingCounts.get(base) ?? 0;
    headingCounts.set(base, count + 1);
    return count > 0 ? `${base}-${count}` : base;
  };

  const contentWithoutH1 = doc.content.replace(/^#\s+.+\r?\n+/, '');

  return (
    <div className="text-[15.5px] leading-[1.75] text-neutral-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = nextHeadingId(children);
            return (
              <h2
                id={id}
                className="mt-10 mb-4 scroll-mt-24 border-b border-neutral-200 pb-2.5 font-serif text-2xl font-medium tracking-tight text-neutral-950"
              >
                <a
                  href={`#${id}`}
                  className="hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900"
                >
                  {children}
                </a>
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = nextHeadingId(children);
            return (
              <h3
                id={id}
                className="mt-7 mb-2.5 scroll-mt-24 font-sans text-lg font-semibold tracking-tight text-neutral-900"
              >
                <a
                  href={`#${id}`}
                  className="hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900"
                >
                  {children}
                </a>
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="my-4 text-neutral-700">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-950">{children}</strong>
          ),
          ul: ({ children, className }) => {
            const isTaskList = className?.includes('contains-task-list');
            return (
              <ul
                className={
                  isTaskList
                    ? 'my-4 list-none space-y-2.5 pl-0'
                    : 'my-4 list-disc space-y-2 pl-6 marker:text-neutral-400'
                }
              >
                {children}
              </ul>
            );
          },
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 marker:font-mono marker:text-xs marker:text-neutral-500">
              {children}
            </ol>
          ),
          li: ({ children, className }) => {
            const isTaskItem = className?.includes('task-list-item');
            return (
              <li
                className={
                  isTaskItem
                    ? 'flex items-start gap-2.5 text-neutral-700'
                    : 'text-neutral-700'
                }
              >
                {children}
              </li>
            );
          },
          input: ({ checked, type }) => {
            if (type === 'checkbox') {
              return (
                <span
                  aria-label={checked ? 'Completed item' : 'Pending item'}
                  className={`mt-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-neutral-300 bg-white'
                  }`}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
              );
            }
            return null;
          },
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;

            const targetDoc = resolveDocByHref(href);
            if (targetDoc) {
              const anchor = href.includes('#') ? href.split('#')[1] : undefined;
              return (
                <button
                  type="button"
                  onClick={() => onNavigateDoc(targetDoc.id, anchor)}
                  className="inline font-medium text-blue-900 underline decoration-blue-900/30 underline-offset-4 transition-colors hover:decoration-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  {children}
                </button>
              );
            }

            if (href.startsWith('#')) {
              return (
                <a
                  href={href}
                  className="font-medium text-blue-900 underline decoration-blue-900/30 underline-offset-4 hover:decoration-blue-900"
                >
                  {children}
                </a>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-900 underline decoration-blue-900/30 underline-offset-4 hover:decoration-blue-900"
              >
                {children}
              </a>
            );
          },
          code: ({ className, children, ...props }) => {
            const isBlock =
              Boolean(className) || flattenText(children).includes('\n');
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                {...props}
                className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] text-neutral-900"
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full border-collapse text-left text-sm tabular-nums">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-200 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-neutral-50/60">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-neutral-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 align-top text-neutral-700">{children}</td>
          ),
          hr: () => <hr className="my-8 border-neutral-200" />,
        }}
      >
        {contentWithoutH1}
      </ReactMarkdown>
    </div>
  );
}
