import { createStore } from '../../lib/store';
import type { DomainId, ExamCategoryId } from '../../content/types';
import { EXAM } from '../../content/exam';

/** Category/domain filter, shared with the question screen for "Next question". */
export const prepFilterStore = createStore<{ cat: ExamCategoryId; domain: DomainId | 'all' }>({ cat: 'qual', domain: 'all' });

export function filteredQuestions() {
  const f = prepFilterStore.get();
  return EXAM.filter(q => q.cat === f.cat && (f.domain === 'all' || q.domain === f.domain));
}
