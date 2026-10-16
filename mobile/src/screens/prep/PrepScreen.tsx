import { useMemo } from 'react';
import { Briefcase, CheckCircle2, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { Card, Chip, DifficultyMeter, ProgressRing, Button, Badge } from '../../components/ui/primitives';
import { Pressable } from '../../components/ui/Pressable';
import { InlineMd } from '../../components/Markdown';
import { DOMAINS } from '../../content/domains';
import { EXAM, EXAM_CATEGORIES } from '../../content/exam';
import type { DomainId, ExamCategoryId } from '../../content/types';
import { useStore } from '../../lib/store';
import { progressStore } from '../../state/progress';
import { nav } from '../../state/nav';
import { prepFilterStore } from './prepFilter';

export default function PrepScreen() {
  const filter = useStore(prepFilterStore);
  const marks = useStore(progressStore, p => p.exam);
  const cat = EXAM_CATEGORIES.find(c => c.id === filter.cat)!;
  const inCat = useMemo(() => EXAM.filter(q => q.cat === filter.cat), [filter.cat]);
  const items = inCat.filter(q => filter.domain === 'all' || q.domain === filter.domain);
  const mastered = inCat.filter(q => marks[q.id] === 'mastered').length;
  const review = inCat.filter(q => marks[q.id] === 'review').length;
  const domainsHere = DOMAINS.filter(d => inCat.some(q => q.domain === d.id));

  const random = () => {
    const pool = items.filter(q => marks[q.id] !== 'mastered');
    const pick = (pool.length ? pool : items)[Math.floor(Math.random() * (pool.length || items.length))];
    if (pick) nav.push({ name: 'question', id: pick.id });
  };

  return (
    <Screen
      title="Exam Prep"
      large
      subtitle="Qualifiers, interviews and postdoc scenarios"
      pinned={
        <div className="hscroll flex gap-2 px-4 py-2.5" role="tablist" aria-label="Question categories">
          {EXAM_CATEGORIES.map(c => (
            <Chip key={c.id} active={c.id === filter.cat} onClick={() => prepFilterStore.set({ cat: c.id as ExamCategoryId, domain: 'all' })}>
              {c.id === 'jobs' && <Briefcase size={14} />}
              {c.label}
            </Chip>
          ))}
        </div>
      }
    >
      <Card className="mt-3 flex items-center gap-4 p-4">
        <ProgressRing value={inCat.length ? mastered / inCat.length : 0} size={64} stroke={6} label={mastered + '/' + inCat.length} sub={cat.label + ' mastered'} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[15.5px] font-semibold text-ink">{cat.label}</h2>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-3">{cat.blurb}</p>
          <div className="mt-2 flex gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1 text-sage-ink">
              <CheckCircle2 size={13} /> {mastered} mastered
            </span>
            <span className="inline-flex items-center gap-1 text-amber-ink">
              <RotateCcw size={13} /> {review} to review
            </span>
          </div>
        </div>
      </Card>

      <div className="mt-3 flex items-center gap-2">
        <div className="hscroll -ml-4 flex flex-1 gap-2 pl-4" aria-label="Filter by domain">
          <Chip active={filter.domain === 'all'} onClick={() => prepFilterStore.set(f => ({ ...f, domain: 'all' }))}>
            All
          </Chip>
          {domainsHere.map(d => (
            <Chip key={d.id} active={filter.domain === d.id} onClick={() => prepFilterStore.set(f => ({ ...f, domain: d.id as DomainId }))}>
              {d.short}
            </Chip>
          ))}
        </div>
      </div>

      <Button tone="tonal" className="mt-3 w-full" icon={<Shuffle size={17} />} onClick={random} disabled={!items.length}>
        Random question
      </Button>

      <div className="mt-4 flex flex-col gap-3">
        {items.map(q => {
          const d = DOMAINS.find(x => x.id === q.domain)!;
          const mark = marks[q.id];
          return (
            <Pressable key={q.id} onClick={() => nav.push({ name: 'question', id: q.id })} pressScale={0.98} className="dc block w-full text-left" style={{ ['--dc' as string]: d.color }}>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--dc-ink)' }}>
                    {d.short}
                  </span>
                  <span className="ml-auto">
                    {mark === 'mastered' ? <Badge tone="sage">Mastered</Badge> : mark === 'review' ? <Badge tone="amber">Reviewing</Badge> : <Badge>New</Badge>}
                  </span>
                </div>
                <div className="mt-1.5 flex items-start gap-2">
                  <InlineMd src={q.title} as="h3" className="flex-1 text-[16px] font-semibold leading-snug text-ink" />
                  <ChevronRight size={18} className="mt-0.5 shrink-0 text-ink-3" />
                </div>
                {q.org && <p className="mt-1 text-[12.5px] text-ink-3">{q.org}</p>}
                <div className="mt-2.5">
                  <DifficultyMeter level={q.difficulty} />
                </div>
              </Card>
            </Pressable>
          );
        })}
      </div>
    </Screen>
  );
}
