import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertTriangle,
  Check,
  Copy,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { DocEntry, resolveDocByHref, slugifyHeading } from '../data/docs';
import { MermaidBlock } from './MermaidBlock';

interface MarkdownRendererProps {
  doc: DocEntry;
  isDark: boolean;
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
    <div className="my-6 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900 px-4 py-2">
        <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
          {className ? className.replace('language-', '') : 'text'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
          aria-label="Copy block contents"
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
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        <code>{text}</code>
      </pre>
    </div>
  );
}

function CalloutBlock({ children }: { children?: React.ReactNode }) {
  const raw = flattenText(children).trim();
  const match = raw.match(/^\[!(NOTE|WARNING|SECURITY|PLANNED)\]\s*([\s\S]*)$/i);

  if (!match) {
    return (
      <blockquote className="my-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70 px-5 py-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {children}
      </blockquote>
    );
  }

  const kind = match[1].toUpperCase();
  const body = match[2].trim();

  const meta =
    kind === 'WARNING'
      ? {
          label: 'Warning',
          Icon: AlertTriangle,
          container:
            'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30',
          title: 'text-amber-900 dark:text-amber-300',
        }
      : kind === 'SECURITY'
      ? {
          label: 'Security Notice',
          Icon: ShieldAlert,
          container:
            'border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30',
          title: 'text-rose-900 dark:text-rose-300',
        }
      : {
          label: kind === 'PLANNED' ? 'Planned Capability' : 'Note',
          Icon: Info,
          container:
            'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30',
          title: 'text-blue-900 dark:text-blue-300',
        };

  const { Icon } = meta;

  return (
    <aside
      aria-label={meta.label}
      className={`my-6 rounded-lg border px-5 py-4 ${meta.container}`}
    >
      <div className={`flex items-center gap-2 text-xs font-semibold ${meta.title}`}>
        <Icon className="h-4 w-4 shrink-0" />
        <span>{meta.label}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {body}
      </p>
    </aside>
  );
}

export function MarkdownRenderer({
  doc,
  isDark,
  onNavigateDoc,
}: MarkdownRendererProps) {
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
    <div className="text-[15.5px] leading-[1.75] text-neutral-700 dark:text-neutral-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = nextHeadingId(children);
            return (
              <h2
                id={id}
                className="mt-10 mb-4 scroll-mt-24 border-b border-neutral-200 dark:border-neutral-800 pb-2.5 font-serif text-2xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50"
              >
                <a
                  href={`#${id}`}
                  className="hover:text-blue-900 dark:hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
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
                className="mt-7 mb-2.5 scroll-mt-24 font-sans text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
              >
                <a
                  href={`#${id}`}
                  className="hover:text-blue-900 dark:hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
                >
                  {children}
                </a>
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="my-4 text-neutral-700 dark:text-neutral-300">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-950 dark:text-neutral-50">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => <CalloutBlock>{children}</CalloutBlock>,
          ul: ({ children, className }) => {
            const isTaskList = className?.includes('contains-task-list');
            return (
              <ul
                className={
                  isTaskList
                    ? 'my-4 list-none space-y-2.5 pl-0'
                    : 'my-4 list-disc space-y-2 pl-6 marker:text-neutral-400 dark:marker:text-neutral-600'
                }
              >
                {children}
              </ul>
            );
          },
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 marker:font-mono marker:text-xs marker:text-neutral-500 dark:marker:text-neutral-400">
              {children}
            </ol>
          ),
          li: ({ children, className }) => {
            const isTaskItem = className?.includes('task-list-item');
            return (
              <li
                className={
                  isTaskItem
                    ? 'flex items-start gap-2.5 text-neutral-700 dark:text-neutral-300'
                    : 'text-neutral-700 dark:text-neutral-300'
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
                      ? 'border-blue-900 bg-blue-900 text-white dark:border-blue-500 dark:bg-blue-500 dark:text-neutral-950'
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
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

            const targetDoc = resolveDocByHref(href, doc.filePath);
            if (targetDoc) {
              const anchor = href.includes('#') ? href.split('#')[1] : undefined;
              return (
                <button
                  type="button"
                  onClick={() => onNavigateDoc(targetDoc.id, anchor)}
                  className="inline font-medium text-blue-900 dark:text-blue-400 underline decoration-blue-900/30 dark:decoration-blue-400/30 underline-offset-4 transition-colors hover:decoration-blue-900 dark:hover:decoration-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 dark:focus-visible:outline-blue-400"
                >
                  {children}
                </button>
              );
            }

            if (href.startsWith('#')) {
              return (
                <a
                  href={href}
                  className="font-medium text-blue-900 dark:text-blue-400 underline decoration-blue-900/30 dark:decoration-blue-400/30 underline-offset-4 hover:decoration-blue-900 dark:hover:decoration-blue-400"
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
                className="font-medium text-blue-900 dark:text-blue-400 underline decoration-blue-900/30 dark:decoration-blue-400/30 underline-offset-4 hover:decoration-blue-900 dark:hover:decoration-blue-400"
              >
                {children}
              </a>
            );
          },
          code: ({ className, children, ...props }) => {
            if (className === 'language-mermaid') {
              const chart = flattenText(children).replace(/\n$/, '');
              return <MermaidBlock chart={chart} isDark={isDark} />;
            }
            const isBlock =
              Boolean(className) || flattenText(children).includes('\n');
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                {...props}
                className="rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 font-mono text-[13px] text-neutral-900 dark:text-neutral-100"
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full border-collapse text-left text-sm tabular-nums">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-900/50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 align-top text-neutral-700 dark:text-neutral-300">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-8 border-neutral-200 dark:border-neutral-800" />
          ),
        }}
      >
        {contentWithoutH1}
      </ReactMarkdown>
    </div>
  );
}
