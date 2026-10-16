import { createStore, isStrArr } from '../lib/store';
import { computeFeed, type FeedSort } from '../lib/feed';
import type { DomainId, FeedPaper } from '../content/types';

export const DEFAULT_KEYWORDS = ['Module-LWE', 'Selberg Sieve', 'Isogeny', 'L-functions', 'CRYSTALS-Kyber'];
export const KEYWORD_SUGGESTIONS = ['Ring-LWE', 'GNFS', 'Class groups', 'Pairings', 'ECPP', 'Chebotarev', 'Zero density', 'NTRU', 'BKZ', 'Modular forms'];

export const keywordStore = createStore<string[]>(DEFAULT_KEYWORDS, {
  key: 'arithmos.m.keywords.v1',
  validate: (v): v is string[] => isStrArr(v) && v.length <= 12
});

export interface FeedState {
  domain: DomainId | 'all';
  sort: FeedSort;
  view: 'all' | 'saved';
  list: FeedPaper[];
  loading: boolean;
  loadingMore: boolean;
  visible: number;
}

export const PAGE_SIZE = 4;

export const feedStore = createStore<FeedState>({
  domain: 'all',
  sort: 'relevance',
  view: 'all',
  list: [],
  loading: true,
  loadingMore: false,
  visible: PAGE_SIZE
});

let token = 0;
let moreTimer: ReturnType<typeof setTimeout> | undefined;

/** Simulated network fetch: shows the skeleton for ~0.5–0.9 s, then the computed feed. */
export function refreshFeed() {
  const t = ++token;
  clearTimeout(moreTimer);
  feedStore.set(s => ({ ...s, loading: true, loadingMore: false }));
  setTimeout(() => {
    if (t !== token) return;
    const s = feedStore.get();
    feedStore.set({ ...s, list: computeFeed(keywordStore.get(), s.domain, s.sort), visible: PAGE_SIZE, loading: false });
  }, 550 + Math.random() * 350);
}

export function loadMore() {
  const s = feedStore.get();
  if (s.loading || s.loadingMore || s.visible >= s.list.length) return;
  feedStore.set({ ...s, loadingMore: true });
  moreTimer = setTimeout(() => {
    feedStore.set(x => ({ ...x, visible: Math.min(x.list.length, x.visible + PAGE_SIZE), loadingMore: false }));
  }, 500);
}

export function setFeedFilter(patch: Partial<Pick<FeedState, 'domain' | 'sort'>>) {
  feedStore.set(s => ({ ...s, ...patch }));
  refreshFeed();
}

export const setFeedView = (view: FeedState['view']) => feedStore.set(s => ({ ...s, view }));

export function addKeyword(kw: string) {
  keywordStore.set(k => [...k, kw]);
  refreshFeed();
}

export function removeKeyword(kw: string) {
  keywordStore.set(k => k.filter(x => x !== kw));
  refreshFeed();
}

refreshFeed();
