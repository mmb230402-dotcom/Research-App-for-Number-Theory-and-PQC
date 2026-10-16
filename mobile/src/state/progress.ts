import { createStore, isObj, isStrArr } from '../lib/store';
import type { DomainId } from '../content/types';

export type ExamMark = 'review' | 'mastered';

/** Study progress, stored locally in place of a backend account. */
export interface Progress {
  /** Topics marked studied, as "domainId:topicIndex". */
  studied: string[];
  exam: Record<string, ExamMark>;
  /** Papers opened in the reader. */
  read: string[];
  /** Reading list. */
  saved: string[];
  lastDomain: DomainId;
  /** ISO dates (YYYY-MM-DD) with any study activity, for the streak. */
  days: string[];
}

const DEFAULTS: Progress = { studied: [], exam: {}, read: [], saved: [], lastDomain: 'ant', days: [] };

export const progressStore = createStore<Progress>(DEFAULTS, {
  key: 'arithmos.m.progress.v1',
  validate: (v): v is Progress => isObj(v) && isStrArr(v.studied) && isObj(v.exam) && isStrArr(v.read) && isStrArr(v.saved)
});
progressStore.set(p => ({ ...DEFAULTS, ...p }));

const today = () => new Date().toLocaleDateString('en-CA');

function touch(p: Progress): Progress {
  const d = today();
  return p.days.includes(d) ? p : { ...p, days: [...p.days, d].slice(-120) };
}

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

export const progress = {
  toggleStudied(domain: DomainId, i: number) {
    progressStore.set(p => touch({ ...p, studied: toggle(p.studied, domain + ':' + i) }));
  },
  markExam(id: string, mark: ExamMark | null) {
    progressStore.set(p => {
      const exam = { ...p.exam };
      if (mark) exam[id] = mark;
      else delete exam[id];
      return touch({ ...p, exam });
    });
  },
  markRead(id: string) {
    progressStore.set(p => (p.read.includes(id) ? p : touch({ ...p, read: [...p.read, id] })));
  },
  toggleSaved(id: string): boolean {
    const was = progressStore.get().saved.includes(id);
    progressStore.set(p => ({ ...p, saved: toggle(p.saved, id) }));
    return !was;
  },
  setLastDomain(id: DomainId) {
    if (progressStore.get().lastDomain !== id) progressStore.set(p => ({ ...p, lastDomain: id }));
  },
  reset() {
    progressStore.set(DEFAULTS);
  }
};

/** Consecutive days with activity, ending today or yesterday. */
export function streak(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(d.toLocaleDateString('en-CA'))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(d.toLocaleDateString('en-CA'))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
