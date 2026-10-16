import { memo, useMemo, type MouseEvent } from 'react';
import { md, mdInline, tex } from '../lib/markdown';
import { copyText } from '../state/toast';

function onCodeCopy(e: MouseEvent<HTMLElement>) {
  const btn = (e.target as HTMLElement).closest('.code-copy');
  if (!btn) return;
  const pre = btn.closest('.codeblock')?.querySelector('pre');
  if (pre) copyText(pre.textContent || '', 'Code copied');
}

/** Markdown + LaTeX block. Content is sanitized in lib/markdown before it reaches the DOM. */
export const Markdown = memo(function Markdown({ src, className = '' }: { src: string; className?: string }) {
  const html = useMemo(() => md(src), [src]);
  return <div className={'md ' + className} onClick={onCodeCopy} dangerouslySetInnerHTML={{ __html: html }} />;
});

/** Inline Markdown (titles, previews): no wrapping paragraph. */
export const InlineMd = memo(function InlineMd({ src, className = '', as: Tag = 'span' }: { src: string; className?: string; as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div' }) {
  const html = useMemo(() => mdInline(src), [src]);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

/** A single display formula that scrolls horizontally when wider than the screen. */
export const TexBlock = memo(function TexBlock({ src, className = '' }: { src: string; className?: string }) {
  const html = useMemo(() => tex(src, true), [src]);
  return <div className={'katex-block text-ink ' + className} dangerouslySetInnerHTML={{ __html: html }} />;
});
