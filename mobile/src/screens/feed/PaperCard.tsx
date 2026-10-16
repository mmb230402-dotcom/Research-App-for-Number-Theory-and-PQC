import { memo, useState } from 'react';
import { Bookmark, BookOpen, Eye, Sparkles } from 'lucide-react';
import { Card, Button } from '../../components/ui/primitives';
import { IconButton, Pressable } from '../../components/ui/Pressable';
import { InlineMd, Markdown } from '../../components/Markdown';
import { DOMAINS } from '../../content/domains';
import type { Paper } from '../../content/types';
import { previewText } from '../../lib/markdown';
import { fmtPaperDate } from '../../lib/format';

export const PaperCard = memo(function PaperCard({
  paper, matched, saved, read, onOpen, onSend, onToggleSave
}: {
  paper: Paper; matched?: string[]; saved: boolean; read: boolean;
  onOpen: () => void; onSend: () => void; onToggleSave: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const d = DOMAINS.find(x => x.id === paper.domain)!;
  const long = paper.abstract.length > 200;
  return (
    <Card className="dc relative overflow-hidden" style={{ ['--dc' as string]: d.color }}>
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: 'var(--dc-ink)' }} aria-hidden />
      <div className="p-4 pl-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-3">
          <span className="font-semibold" style={{ color: 'var(--dc-ink)' }}>
            {d.short}
          </span>
          <span aria-hidden>·</span>
          <span className="font-mono">arXiv:{paper.id}</span>
          <span aria-hidden>·</span>
          <span>{fmtPaperDate(paper.date)}</span>
          {read && (
            <span className="ml-auto inline-flex items-center gap-1 text-sage-ink" title="Opened in reader">
              <Eye size={13} /> Read
            </span>
          )}
        </div>
        <div className="mt-1 flex items-start gap-1">
          <Pressable onClick={onOpen} ripple={false} pressScale={0.99} className="block min-w-0 flex-1 pt-1.5 text-left">
            <h3 className="text-[16px] font-semibold leading-snug text-ink">{paper.title}</h3>
          </Pressable>
          <IconButton label={saved ? 'Remove from reading list' : 'Save to reading list'} aria-pressed={saved} onClick={onToggleSave} className={'-mr-2 ' + (saved ? 'text-amber-ink' : '')} haptic>
            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
          </IconButton>
        </div>
        <p className="mt-1 truncate text-[13px] text-ink-3">{paper.authors.join(', ')}</p>
        {!!matched?.length && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {matched.map(k => (
              <span key={k} className="rounded-full bg-latex/50 px-2 py-0.5 text-[11.5px] font-medium text-latex-ink">
                {k}
              </span>
            ))}
            {paper.generated && <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[11.5px] text-ink-3">simulated</span>}
          </div>
        )}
        <div className="mt-2.5 text-[14px]">
          {expanded ? <Markdown src={paper.abstract} className="text-[14px]" /> : <InlineMd src={previewText(paper.abstract, 200)} as="p" className="md md-compact text-ink-2" />}
          {long && (
            <button type="button" onClick={() => setExpanded(e => !e)} aria-expanded={expanded} className="mt-1 min-h-9 text-[13.5px] font-semibold text-latex-ink">
              {expanded ? 'Show less' : 'Read more…'}
            </button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button tone="primary" className="h-10 gap-1.5 px-2 text-[13.5px]" icon={<BookOpen size={16} />} onClick={onOpen}>
            Open in Reader
          </Button>
          <Button tone="tonal" className="h-10 gap-1.5 px-2 text-[13.5px]" icon={<Sparkles size={16} />} onClick={onSend}>
            Send to Scholar
          </Button>
        </div>
      </div>
    </Card>
  );
});

export function PaperSkeleton() {
  return (
    <Card className="p-4 pl-5" >
      <div className="skeleton h-3 w-40" />
      <div className="skeleton mt-3 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-4/5" />
      <div className="skeleton mt-3 h-3 w-1/2" />
      <div className="skeleton mt-4 h-3 w-full" />
      <div className="skeleton mt-2 h-3 w-full" />
      <div className="skeleton mt-2 h-3 w-2/3" />
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-10 flex-1 rounded-full" />
        <div className="skeleton h-10 flex-1 rounded-full" />
      </div>
    </Card>
  );
}
