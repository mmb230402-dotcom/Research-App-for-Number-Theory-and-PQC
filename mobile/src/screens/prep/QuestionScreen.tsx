import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookMarked, CheckCircle2, ChevronDown, ChevronRight, Lightbulb, RotateCcw, SearchX, Timer } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { Badge, Card, DifficultyMeter, EmptyState, Button } from '../../components/ui/primitives';
import { Pressable } from '../../components/ui/Pressable';
import { InlineMd, Markdown } from '../../components/Markdown';
import { DOMAINS } from '../../content/domains';
import { EXAM, EXAM_CATEGORIES } from '../../content/exam';
import { useStore } from '../../lib/store';
import { progress, progressStore } from '../../state/progress';
import { askScholar } from '../../state/actions';
import { nav } from '../../state/nav';
import { toast } from '../../state/toast';
import { haptic } from '../../lib/platform';
import { filteredQuestions } from './prepFilter';

export default function QuestionScreen({ id }: { id: string }) {
  const q = EXAM.find(x => x.id === id);
  const mark = useStore(progressStore, p => p.exam[id]);
  const [showOutline, setShowOutline] = useState(false);
  const timer = useStopwatch();

  if (!q) {
    return (
      <Screen title="Question">
        <EmptyState icon={<SearchX size={24} />} title="Question not found" body="It may have been removed from the bank." />
      </Screen>
    );
  }
  const d = DOMAINS.find(x => x.id === q.domain)!;
  const cat = EXAM_CATEGORIES.find(c => c.id === q.cat)!;
  const list = filteredQuestions();
  const idx = list.findIndex(x => x.id === q.id);
  const next = list.length > 1 ? list[(idx + 1) % list.length] : undefined;

  const setMark = (m: 'review' | 'mastered') => {
    const nextMark = mark === m ? null : m;
    progress.markExam(q.id, nextMark);
    haptic(12);
    if (nextMark === 'mastered') toast('Marked as mastered', 'ok');
    else if (nextMark === 'review') toast('Added to your review pile', 'info');
  };

  return (
    <Screen
      title={cat.label}
      footer={
        <div className="flex gap-2 px-4 py-2.5">
          <Button tone={mark === 'review' ? 'primary' : 'tonal'} className={'h-11 flex-1 px-3 text-[14.5px] ' + (mark === 'review' ? '!bg-amber' : '')} icon={<RotateCcw size={17} />} onClick={() => setMark('review')}>
            {mark === 'review' ? 'Reviewing' : 'Needs review'}
          </Button>
          <Button tone={mark === 'mastered' ? 'sage' : 'tonal'} className="h-11 flex-1 px-3 text-[14.5px]" icon={<CheckCircle2 size={17} />} onClick={() => setMark('mastered')}>
            {mark === 'mastered' ? 'Mastered' : 'Mastered it'}
          </Button>
        </div>
      }
    >
      <article className="dc pt-3" style={{ ['--dc' as string]: d.color }}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="!bg-[var(--dc-soft)] !text-[var(--dc-ink)]">{d.short}</Badge>
          <Badge>{cat.label}</Badge>
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[12.5px] tabular-nums text-ink-3" aria-label="Time on this question">
            <Timer size={14} /> {timer}
          </span>
        </div>
        <InlineMd src={q.title} as="h1" className="mt-3 block font-display text-[22px] font-bold leading-tight text-ink" />
        {q.org && <p className="mt-1.5 text-[13px] text-ink-3">{q.org}</p>}
        <div className="mt-2.5">
          <DifficultyMeter level={q.difficulty} />
        </div>

        <Card className="mt-4 p-4">
          <h2 className="mb-2 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">{q.cat === 'jobs' ? 'Posting' : 'Problem'}</h2>
          <Markdown src={q.statement} />
        </Card>

        <Card className="mt-3 overflow-hidden">
          <Pressable onClick={() => setShowOutline(s => !s)} aria-expanded={showOutline} pressScale={0.99} className="flex w-full items-center gap-3 p-4 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/25 text-sage-ink">
              <Lightbulb size={17} />
            </span>
            <span className="flex-1 text-[15.5px] font-semibold text-ink">{q.cat === 'jobs' ? 'Application strategy' : 'View outline solution'}</span>
            <motion.span animate={{ rotate: showOutline ? 180 : 0 }} className="text-ink-3">
              <ChevronDown size={19} />
            </motion.span>
          </Pressable>
          <AnimatePresence initial={false}>
            {showOutline && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 38 }} className="overflow-hidden">
                <div className="border-t border-line px-4 pb-4 pt-3">
                  <Markdown src={q.outline} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Button
          tone="ghost"
          className="mt-2 px-1"
          icon={<Lightbulb size={17} />}
          onClick={() => askScholar({ kind: 'question', label: q.title.replace(/\$/g, ''), text: q.statement }, 'Give me a hint for the first step, without the full solution.')}
        >
          Ask Scholar for a hint
        </Button>

        <section className="mt-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">
            <BookMarked size={14} /> References
          </h2>
          <ul className="flex flex-col gap-2">
            {q.refs.map(r => (
              <li key={r} className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-[13.5px] leading-snug text-ink-2">
                <InlineMd src={r} className="md md-compact" />
              </li>
            ))}
          </ul>
        </section>

        {next && (
          <Pressable onClick={() => nav.replace({ name: 'question', id: next.id })} pressScale={0.98} className="mt-5 block w-full text-left">
            <Card className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">Next question</div>
                <InlineMd src={next.title} className="mt-0.5 block truncate text-[15px] font-semibold text-ink" />
              </div>
              <ChevronRight size={20} className="text-ink-3" />
            </Card>
          </Pressable>
        )}
      </article>
    </Screen>
  );
}

/** mm:ss since the question opened, as a gentle exam-conditions timer. */
function useStopwatch() {
  const start = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor((now - start.current) / 1000);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
