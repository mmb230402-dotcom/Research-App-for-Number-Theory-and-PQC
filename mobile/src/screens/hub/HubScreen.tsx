import { useMemo, useState, type ReactNode } from 'react';
import { BookOpenText, ChevronRight, Flame, GraduationCap, Newspaper, Settings2 } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { Card, ProgressBar, ProgressRing, SectionHeader, Badge } from '../../components/ui/primitives';
import { IconButton, Pressable } from '../../components/ui/Pressable';
import { InlineMd } from '../../components/Markdown';
import { SettingsSheet } from '../../components/SettingsSheet';
import { InstallCard } from '../../components/InstallCard';
import { DOMAINS } from '../../content/domains';
import { EXAM } from '../../content/exam';
import { PAPERS } from '../../content/papers';
import type { Domain } from '../../content/types';
import { useStore } from '../../lib/store';
import { leadText } from '../../lib/markdown';
import { greeting, hashStr, relDate } from '../../lib/format';
import { progress, progressStore, streak } from '../../state/progress';
import { settingsStore } from '../../state/settings';
import { notesStore, sortNotes } from '../../state/notes';
import { nav } from '../../state/nav';

const TOTAL_TOPICS = DOMAINS.reduce((n, d) => n + d.topics.length, 0);

const STATUS_TONE = { 'Open problem': 'amber', Conjecture: 'blue', 'Active research': 'sage' } as const;

export default function HubScreen() {
  const p = useStore(progressStore);
  const name = useStore(settingsStore, s => s.name);
  const field = useStore(settingsStore, s => s.field);
  const notes = useStore(notesStore);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mastered = Object.values(p.exam).filter(v => v === 'mastered').length;
  const days = streak(p.days);
  const lastNote = sortNotes(notes)[0];
  const nextQuestion = EXAM.find(q => p.exam[q.id] !== 'mastered');
  const lastPaper = PAPERS.find(x => x.id === p.read[p.read.length - 1]);

  // A deterministic "question of the day" drawn from all open research questions.
  const qotd = useMemo(() => {
    const all = DOMAINS.flatMap(d => d.questions.map(q => ({ d, q })));
    return all[hashStr(new Date().toDateString()) % all.length];
  }, []);

  const openDomain = (d: Domain) => {
    progress.setLastDomain(d.id);
    nav.push({ name: 'domain', id: d.id });
  };

  return (
    <Screen
      title="Arithmos"
      large
      subtitle={greeting() + (name ? ', ' + name : '') + ' · ' + field}
      actions={
        <IconButton label="Settings" onClick={() => setSettingsOpen(true)}>
          <Settings2 size={22} />
        </IconButton>
      }
    >
      <InstallCard />

      {/* Study progress */}
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Study progress</h2>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-amber-ink">
            <Flame size={15} /> {days ? days + '-day streak' : 'Start a streak today'}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat ring={p.studied.length / TOTAL_TOPICS} color="var(--latex-ink)" value={p.studied.length + '/' + TOTAL_TOPICS} label="Topics studied" />
          <Stat ring={mastered / EXAM.length} color="var(--sage-ink)" value={mastered + '/' + EXAM.length} label="Questions mastered" />
          <Stat ring={p.read.length / PAPERS.length} color="var(--amber-ink)" value={String(p.read.length)} label="Papers read" />
        </div>
      </Card>

      {/* Continue */}
      <SectionHeader title="Continue" />
      <div className="hscroll -mx-4 flex gap-3 px-4 pb-1">
        {lastNote && (
          <ContinueCard icon={<BookOpenText size={18} />} kicker={'Note · ' + relDate(lastNote.updated)} title={lastNote.title} onClick={() => nav.open('notes', { name: 'note', id: lastNote.id })} />
        )}
        {nextQuestion && (
          <ContinueCard icon={<GraduationCap size={18} />} kicker="Next exam question" title={nextQuestion.title} onClick={() => nav.open('prep', { name: 'question', id: nextQuestion.id })} />
        )}
        <ContinueCard
          icon={<Newspaper size={18} />}
          kicker={lastPaper ? 'Last paper read' : 'arXiv Gateway'}
          title={lastPaper ? lastPaper.title : 'Track keywords and scan new preprints'}
          onClick={() => (lastPaper ? nav.open('feed', { name: 'paper', id: lastPaper.id }) : nav.open('feed'))}
        />
      </div>

      {/* Domains */}
      <SectionHeader title="Research domains" />
      <div className="flex flex-col gap-3">
        {DOMAINS.map(d => {
          const done = p.studied.filter(s => s.startsWith(d.id + ':')).length;
          return (
            <Pressable key={d.id} onClick={() => openDomain(d)} pressScale={0.98} className="dc block w-full text-left" style={{ ['--dc' as string]: d.color }}>
              <Card className="flex gap-3.5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-math text-[26px]" style={{ background: 'var(--dc-soft)', color: 'var(--dc-ink)' }} aria-hidden>
                  {d.glyph}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="flex-1 text-[16px] font-semibold leading-snug text-ink">{d.name}</h3>
                    <ChevronRight size={18} className="shrink-0 text-ink-3" />
                  </div>
                  <InlineMd src={leadText(d.summary, 120)} as="p" className="md md-compact mt-1 line-clamp-2 text-[13.5px] text-ink-3" />
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={done / d.topics.length} color="var(--dc-ink)" label={d.short + ' topics studied'} />
                    <span className="shrink-0 text-[12px] font-medium tabular-nums text-ink-3">
                      {done}/{d.topics.length}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11.5px] text-ink-3">
                    <span className="rounded-full bg-surface-2 px-2 py-0.5">{d.cheat.length} formulas</span>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5">{d.questions.length} open questions</span>
                  </div>
                </div>
              </Card>
            </Pressable>
          );
        })}
      </div>

      {/* Question of the day */}
      <SectionHeader title="Open question of the day" />
      <Pressable onClick={() => openDomain(qotd.d)} pressScale={0.98} className="dc block w-full text-left" style={{ ['--dc' as string]: qotd.d.color }}>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[qotd.q.status]}>{qotd.q.status}</Badge>
            <span className="truncate text-[12px] font-medium" style={{ color: 'var(--dc-ink)' }}>
              {qotd.d.short}
            </span>
          </div>
          <InlineMd src={qotd.q.title} as="h3" className="mt-2 block text-[16px] font-semibold leading-snug text-ink" />
          <InlineMd src={leadText(qotd.q.md, 170)} as="p" className="md md-compact mt-1.5 text-[13.5px] text-ink-3" />
        </Card>
      </Pressable>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Screen>
  );
}

function Stat({ ring, color, value, label }: { ring: number; color: string; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface-2 px-1 py-3 text-center">
      <ProgressRing value={ring} color={color} size={52} stroke={5} sub={label} />
      <div className="mt-2 text-[15px] font-semibold tabular-nums text-ink">{value}</div>
      <div className="text-[11.5px] leading-tight text-ink-3">{label}</div>
    </div>
  );
}

function ContinueCard({ icon, kicker, title, onClick }: { icon: ReactNode; kicker: string; title: string; onClick: () => void }) {
  return (
    <Pressable onClick={onClick} pressScale={0.97} className="w-[240px] shrink-0 snap-start text-left">
      <Card className="flex h-full flex-col p-3.5">
        <div className="flex items-center gap-2 text-latex-ink">
          {icon}
          <span className="truncate text-[12px] font-semibold uppercase tracking-wide text-ink-3">{kicker}</span>
        </div>
        <InlineMd src={title} className="mt-2 line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink" />
      </Card>
    </Pressable>
  );
}
