import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Code2, Copy, MessageSquareText, Sparkles } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { Badge, Card, ProgressBar, SearchField, Segmented, EmptyState, Button } from '../../components/ui/primitives';
import { IconButton, Pressable } from '../../components/ui/Pressable';
import { InlineMd, Markdown, TexBlock } from '../../components/Markdown';
import { DOMAINS } from '../../content/domains';
import type { DomainId, OpenQuestion } from '../../content/types';
import { useStore } from '../../lib/store';
import { progress, progressStore } from '../../state/progress';
import { askScholar, domainContext } from '../../state/actions';
import { copyText } from '../../state/toast';

type Section = 'overview' | 'cheat' | 'questions';
const STATUS_TONE = { 'Open problem': 'amber', Conjecture: 'blue', 'Active research': 'sage' } as const;

export default function DomainScreen({ id }: { id: DomainId }) {
  const d = DOMAINS.find(x => x.id === id) ?? DOMAINS[0];
  const studied = useStore(progressStore, p => p.studied);
  const [section, setSection] = useState<Section>('overview');
  const [open, setOpen] = useState<number | null>(0);
  const [filter, setFilter] = useState('');
  const [source, setSource] = useState<Record<number, boolean>>({});
  const done = d.topics.filter((_, i) => studied.includes(d.id + ':' + i)).length;

  const f = filter.trim().toLowerCase();
  const cheat = f ? d.cheat.filter(c => (c.label + ' ' + c.tex).toLowerCase().includes(f)) : d.cheat;

  const discussQuestion = (q: OpenQuestion) =>
    askScholar({ kind: 'theorem', label: q.title.replace(/\$/g, ''), text: q.md }, 'Explain this problem intuitively and where the difficulty lies.');

  return (
    <Screen
      title={d.short}
      large
      largeTitle={d.name}
      actions={
        <IconButton label={'Discuss ' + d.name + ' with Scholar'} onClick={() => askScholar(domainContext(d), 'Give me a research overview of ' + d.name + '.')}>
          <Sparkles size={21} />
        </IconButton>
      }
      pinned={
        <div className="px-4 py-2">
          <Segmented<Section>
            label="Domain sections"
            value={section}
            onChange={setSection}
            options={[
              { value: 'overview', label: 'Overview' },
              { value: 'cheat', label: 'Cheat sheet' },
              { value: 'questions', label: 'Questions' }
            ]}
          />
        </div>
      }
    >
      <div className="dc" style={{ ['--dc' as string]: d.color }}>
        {section === 'overview' && (
          <>
            <Card className="relative mt-2 overflow-hidden p-4">
              <span className="pointer-events-none absolute -right-3 -top-6 font-math text-[120px] leading-none opacity-[0.13]" style={{ color: 'var(--dc-ink)' }} aria-hidden>
                {d.glyph}
              </span>
              <Markdown src={d.summary} className="relative text-[15px]" />
              <div className="relative mt-4 flex items-center gap-3">
                <ProgressBar value={done / d.topics.length} color="var(--dc-ink)" label="Topics studied" />
                <span className="shrink-0 text-[12.5px] font-medium tabular-nums text-ink-3">
                  {done}/{d.topics.length} studied
                </span>
              </div>
            </Card>

            <div className="mt-4 flex flex-col gap-3">
              {d.topics.map((t, i) => {
                const isOpen = open === i;
                const isDone = studied.includes(d.id + ':' + i);
                return (
                  <Card key={t.title} className="overflow-hidden">
                    <Pressable onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} pressScale={0.99} className="flex w-full items-center gap-3 p-4 text-left">
                      <span
                        className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ' + (isDone ? 'bg-sage text-white' : 'bg-surface-2 text-ink-3')}
                        aria-label={isDone ? 'Studied' : 'Not studied yet'}
                      >
                        {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="flex-1 text-[15.5px] font-semibold leading-snug text-ink">{t.title}</span>
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-ink-3">
                        <ChevronDown size={19} />
                      </motion.span>
                    </Pressable>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            <Markdown src={t.md} />
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button tone={isDone ? 'tonal' : 'sage'} className="h-10 px-4 text-[14px]" icon={<Check size={16} />} onClick={() => progress.toggleStudied(d.id, i)}>
                                {isDone ? 'Studied' : 'Mark as studied'}
                              </Button>
                              <Button
                                tone="tonal"
                                className="h-10 px-4 text-[14px]"
                                icon={<MessageSquareText size={16} />}
                                onClick={() => askScholar({ kind: 'domain', label: d.short + ' · ' + t.title, text: t.md }, 'Simplify the key proof step here.')}
                              >
                                Ask Scholar
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {section === 'cheat' && (
          <div className="mt-2">
            <SearchField value={filter} onChange={setFilter} placeholder={'Filter ' + d.cheat.length + ' formulas'} label="Filter formulas" />
            <div className="mt-3 flex flex-col gap-3">
              {cheat.map((c, i) => (
                <Card key={c.label} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--dc-ink)' }} />
                    <h3 className="flex-1 text-[14px] font-semibold text-ink">{c.label}</h3>
                  </div>
                  <TexBlock src={c.tex} className="mt-1" />
                  <AnimatePresence initial={false}>
                    {source[i] && (
                      <motion.pre
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="hscroll overflow-hidden rounded-xl bg-surface-2 px-3 py-2 font-mono text-[12px] text-ink-2"
                      >
                        {c.tex}
                      </motion.pre>
                    )}
                  </AnimatePresence>
                  <div className="mt-2 flex gap-1 border-t border-line pt-2">
                    <Pressable onClick={() => copyText(c.tex, 'LaTeX copied')} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-latex-ink">
                      <Copy size={15} /> Copy LaTeX
                    </Pressable>
                    <Pressable onClick={() => setSource(s => ({ ...s, [i]: !s[i] }))} aria-pressed={!!source[i]} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-3">
                      <Code2 size={15} /> {source[i] ? 'Hide source' : 'Source'}
                    </Pressable>
                  </div>
                </Card>
              ))}
              {!cheat.length && <EmptyState icon={<Code2 size={24} />} title="No matching formulas" body={'Nothing in this cheat sheet matches “' + filter + '”.'} />}
            </div>
          </div>
        )}

        {section === 'questions' && (
          <div className="mt-2 flex flex-col gap-3">
            {d.questions.map(q => (
              <Card key={q.title} className="p-4">
                <Badge tone={STATUS_TONE[q.status]}>{q.status}</Badge>
                <InlineMd src={q.title} as="h3" className="mt-2 block text-[16px] font-semibold leading-snug text-ink" />
                <Markdown src={q.md} className="mt-2 text-[14.5px]" />
                <Button tone="tonal" className="mt-3 h-10 px-4 text-[14px]" icon={<Sparkles size={16} />} onClick={() => discussQuestion(q)}>
                  Discuss with Scholar
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
