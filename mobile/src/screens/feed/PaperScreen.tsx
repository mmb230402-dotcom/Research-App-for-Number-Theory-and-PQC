import { useEffect, useState, type ReactNode } from 'react';
import { Bookmark, FileText, Quote, Share2, Sparkles, SearchX } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { Card, Badge, Button, EmptyState } from '../../components/ui/primitives';
import { IconButton } from '../../components/ui/Pressable';
import { ActionSheet } from '../../components/ui/Sheet';
import { InlineMd, Markdown } from '../../components/Markdown';
import { DOMAINS } from '../../content/domains';
import { useStore } from '../../lib/store';
import { bibtex, findPaper } from '../../lib/feed';
import { fmtPaperDate } from '../../lib/format';
import { plainTitle } from '../../lib/markdown';
import { keywordStore } from '../../state/feed';
import { progress, progressStore } from '../../state/progress';
import { notes, notesStore, sortNotes } from '../../state/notes';
import { sendPaperToScholar } from '../../state/actions';
import { copyText, toast } from '../../state/toast';

/** Paper reader: abstract, main result and context, with citation and Scholar actions. */
export default function PaperScreen({ id }: { id: string }) {
  const keywords = useStore(keywordStore);
  const saved = useStore(progressStore, p => p.saved.includes(id));
  const allNotes = useStore(notesStore);
  const [citeOpen, setCiteOpen] = useState(false);
  const paper = findPaper(id, keywords);

  useEffect(() => {
    if (paper) progress.markRead(paper.id);
  }, [paper?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!paper) {
    return (
      <Screen title="Paper">
        <EmptyState icon={<SearchX size={24} />} title="Paper unavailable" body="This simulated entry belonged to a keyword you no longer track." />
      </Screen>
    );
  }
  const d = DOMAINS.find(x => x.id === paper.domain)!;

  const share = async () => {
    const text = paper.title + ' — ' + paper.authors.join(', ') + ' (arXiv:' + paper.id + ', simulated entry)';
    try {
      if (navigator.share) {
        await navigator.share({ title: paper.title, text });
        return;
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
    copyText(text, 'Reference copied');
  };

  return (
    <Screen
      title={'arXiv:' + paper.id}
      actions={
        <>
          <IconButton label={saved ? 'Remove from reading list' : 'Save to reading list'} aria-pressed={saved} haptic className={saved ? 'text-amber-ink' : ''} onClick={() => progress.toggleSaved(paper.id)}>
            <Bookmark size={21} fill={saved ? 'currentColor' : 'none'} />
          </IconButton>
          <IconButton label="Share" onClick={share}>
            <Share2 size={21} />
          </IconButton>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 px-4 py-2.5">
          <Button tone="primary" className="h-11 px-3 text-[14.5px]" icon={<Sparkles size={17} />} onClick={() => sendPaperToScholar(paper)}>
            Send to Scholar
          </Button>
          <Button tone="tonal" className="h-11 px-3 text-[14.5px]" icon={<Quote size={17} />} onClick={() => setCiteOpen(true)}>
            Cite
          </Button>
        </div>
      }
    >
      <article className="dc pt-3" style={{ ['--dc' as string]: d.color }}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="!bg-[var(--dc-soft)] !text-[var(--dc-ink)]">{d.short}</Badge>
          {paper.cats.map(c => (
            <Badge key={c}>{c}</Badge>
          ))}
          {paper.generated && <Badge tone="amber">Simulated</Badge>}
        </div>
        <h1 className="mt-3 font-display text-[23px] font-bold leading-tight tracking-[-0.01em] text-ink">{paper.title}</h1>
        <p className="mt-2 text-[14.5px] text-ink-2">{paper.authors.join(', ')}</p>
        <p className="mt-1 text-[13px] text-ink-3">
          Submitted {fmtPaperDate(paper.date)} · <span className="font-mono">arXiv:{paper.id}</span>
        </p>

        <Section title="Abstract">
          <Markdown src={paper.abstract} />
        </Section>
        <Section title="Main result" accent>
          <Markdown src={paper.result} />
        </Section>
        <Section title="Context">
          <Markdown src={paper.context} />
        </Section>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {paper.keywords.map(k => (
            <span key={k} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] text-ink-2">
              {k}
            </span>
          ))}
        </div>
        <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-3">
          <FileText size={15} className="mt-0.5 shrink-0" />
          <InlineMd src="Synthetic entry produced by the offline feed simulator; titles, authors and identifiers do not refer to real preprints." />
        </p>
      </article>

      <ActionSheet
        open={citeOpen}
        onClose={() => setCiteOpen(false)}
        title="Cite this paper"
        actions={[
          { label: 'Copy BibTeX', run: () => copyText(bibtex(paper), 'BibTeX copied') },
          ...sortNotes(allNotes)
            .slice(0, 4)
            .map(n => ({
              label: 'Append to “' + plainTitle(n.title).slice(0, 40) + '”',
              run: () => {
                notes.append(n.id, '\n\n> **Reference.** ' + paper.authors.join(', ') + ', "' + paper.title + '", arXiv:' + paper.id + ' (simulated).\n');
                toast('Citation added to your note', 'ok');
              }
            }))
        ]}
      />
    </Screen>
  );
}

function Section({ title, children, accent }: { title: string; children: ReactNode; accent?: boolean }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">{title}</h2>
      {accent ? <Card className="border-l-4 p-4" style={{ borderLeftColor: 'var(--dc-ink)' }}>{children}</Card> : children}
    </section>
  );
}
