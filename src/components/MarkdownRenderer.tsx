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
    <div className="my-6 overflow-hidden rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)]">
      <div className="flex items-center justify-between border-b border-[var(--dip-border)] bg-[var(--dip-bg-surface)] px-4 py-2">
        <span className="font-mono text-xs text-[var(--dip-text-muted)]">
          {className ? className.replace('language-', '') : 'text'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-[var(--dip-radius-sm)] px-2 py-1 text-xs font-medium text-[var(--dip-text-secondary)] transition-colors duration-[var(--dip-duration-fast)] hover:bg-[var(--dip-bg-subtle)] hover:text-[var(--dip-text-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
          aria-label="Copy block contents"
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
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-[var(--dip-text-primary)]">
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
      <blockquote className="my-6 rounded-[var(--dip-radius-md)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] px-5 py-4 text-sm leading-relaxed text-[var(--dip-text-secondary)]">
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
          container: 'bg-[var(--dip-warning-soft)] border-[var(--dip-warning)]/30',
          title: 'text-[var(--dip-warning)]',
        }
      : kind === 'SECURITY'
      ? {
          label: 'Security Notice',
          Icon: ShieldAlert,
          container: 'bg-[var(--dip-danger-soft)] border-[var(--dip-danger)]/30',
          title: 'text-[var(--dip-danger)]',
        }
      : {
          label: kind === 'PLANNED' ? 'Planned Capability' : 'Note',
          Icon: Info,
          container: 'bg-[var(--dip-info-soft)] border-[var(--dip-info)]/30',
          title: 'text-[var(--dip-info)]',
        };

  const { Icon } = meta;

  return (
    <aside
      aria-label={meta.label}
      className={`my-6 rounded-[var(--dip-radius-md)] border px-5 py-4 ${meta.container}`}
    >
      <div className={`flex items-center gap-2 text-xs font-semibold ${meta.title}`}>
        <Icon className="h-4 w-4 shrink-0" />
        <span>{meta.label}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--dip-text-secondary)]">
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
    <div className="text-[15px] leading-[1.7] text-[var(--dip-text-secondary)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = nextHeadingId(children);
            return (
              <h2
                id={id}
                className="mt-10 mb-4 scroll-mt-24 border-b border-[var(--dip-border)] pb-2.5 text-[22px] font-semibold tracking-tight text-[var(--dip-text-primary)]"
              >
                <a
                  href={`#${id}`}
                  className="hover:text-[var(--dip-accent-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dip-focus-ring)]"
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
                className="mt-7 mb-2.5 scroll-mt-24 text-[17px] font-semibold tracking-tight text-[var(--dip-text-primary)]"
              >
                <a
                  href={`#${id}`}
                  className="hover:text-[var(--dip-accent-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dip-focus-ring)]"
                >
                  {children}
                </a>
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="my-4 text-[var(--dip-text-secondary)]">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--dip-text-primary)]">
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
                    : 'my-4 list-disc space-y-2 pl-6 marker:text-[var(--dip-text-muted)]'
                }
              >
                {children}
              </ul>
            );
          },
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-2 pl-6 marker:font-mono marker:text-xs marker:text-[var(--dip-text-muted)]">
              {children}
            </ol>
          ),
          li: ({ children, className }) => {
            const isTaskItem = className?.includes('task-list-item');
            return (
              <li
                className={
                  isTaskItem
                    ? 'flex items-start gap-2.5 text-[var(--dip-text-secondary)]'
                    : 'text-[var(--dip-text-secondary)]'
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
                  className={`mt-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--dip-radius-sm)] border ${
                    checked
                      ? 'border-[var(--dip-accent)] bg-[var(--dip-accent)] text-[var(--dip-accent-fg)]'
                      : 'border-[var(--dip-border-strong)] bg-[var(--dip-bg-surface)]'
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
                  className="inline font-medium text-[var(--dip-accent-text)] underline decoration-[var(--dip-accent-text)]/35 underline-offset-4 transition-colors hover:decoration-[var(--dip-accent-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dip-focus-ring)] cursor-pointer"
                >
                  {children}
                </button>
              );
            }

            if (href.startsWith('#')) {
              return (
                <a
                  href={href}
                  className="font-medium text-[var(--dip-accent-text)] underline decoration-[var(--dip-accent-text)]/35 underline-offset-4 hover:decoration-[var(--dip-accent-text)]"
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
                className="font-medium text-[var(--dip-accent-text)] underline decoration-[var(--dip-accent-text)]/35 underline-offset-4 hover:decoration-[var(--dip-accent-text)]"
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
                className="rounded-[var(--dip-radius-sm)] border border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--dip-text-primary)]"
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-[var(--dip-radius-md)] border border-[var(--dip-border)]">
              <table className="w-full border-collapse text-left text-sm dip-tabular">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-[var(--dip-border)] bg-[var(--dip-bg-subtle)] text-xs font-semibold text-[var(--dip-text-secondary)]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[var(--dip-border)] bg-[var(--dip-bg-surface)]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-[var(--dip-bg-subtle)]/50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-[var(--dip-text-primary)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 align-top text-[var(--dip-text-secondary)]">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-8 border-[var(--dip-border)]" />
          ),
        }}
      >
        {contentWithoutH1}
      </ReactMarkdown>
    </div>
  );
}
