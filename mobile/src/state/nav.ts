/*
 * Mobile navigation: a bottom-tab navigator where every tab owns a push/pop
 * stack. Each push and each opened sheet adds a browser history entry, so the
 * Android back button/gesture and the iOS Safari edge swipe pop the stack or
 * close the sheet instead of leaving the app.
 */
import { createStore } from '../lib/store';
import type { DomainId } from '../content/types';

export type Tab = 'hub' | 'feed' | 'notes' | 'prep' | 'scholar';

export type Route =
  | { name: 'hub' }
  | { name: 'domain'; id: DomainId }
  | { name: 'feed' }
  | { name: 'paper'; id: string }
  | { name: 'notes' }
  | { name: 'note'; id: string }
  | { name: 'prep' }
  | { name: 'question'; id: string }
  | { name: 'scholar' };

export type StackEntry = Route & { key: string };

/** How the last stack change should animate. */
export type Transition = 'none' | 'push' | 'pop' | 'swipe';

interface NavState {
  tab: Tab;
  stacks: Record<Tab, StackEntry[]>;
  transition: Transition;
  /** Tabs mounted so far (tabs mount lazily and then keep their state). */
  visited: Tab[];
}

let keySeq = 0;
const entry = (r: Route): StackEntry => ({ ...r, key: r.name + '-' + ++keySeq });

export const TABS: Tab[] = ['hub', 'feed', 'notes', 'prep', 'scholar'];

export const navStore = createStore<NavState>({
  tab: 'hub',
  stacks: {
    hub: [entry({ name: 'hub' })],
    feed: [entry({ name: 'feed' })],
    notes: [entry({ name: 'notes' })],
    prep: [entry({ name: 'prep' })],
    scholar: [entry({ name: 'scholar' })]
  },
  transition: 'none',
  visited: ['hub']
});

/* ---------------------------------------------------------------- history */
let pending = 0; // history entries we pushed that have not been popped yet
const overlayClosers: (() => void)[] = [];
let swipeNext = false;

function pushHistory() {
  try {
    history.pushState({ arithmos: true }, '');
    pending++;
  } catch {
    /* sandboxed iframes may refuse; navigation still works without history */
  }
}

function popStack(transition: Transition) {
  navStore.set(s => {
    const stack = s.stacks[s.tab];
    if (stack.length <= 1) return s;
    return { ...s, transition, stacks: { ...s.stacks, [s.tab]: stack.slice(0, -1) } };
  });
}

let ignorePops = 0; // popstates caused by closing an overlay from the UI

window.addEventListener('popstate', () => {
  pending = Math.max(0, pending - 1);
  if (ignorePops > 0) {
    ignorePops--;
    return;
  }
  const close = overlayClosers.pop();
  if (close) {
    close();
    return;
  }
  const t: Transition = swipeNext ? 'swipe' : 'pop';
  swipeNext = false;
  popStack(t);
});

/** Scroll positions by stack key, restored when a screen remounts (e.g. on tab return). */
export const scrollMemory = new Map<string, number>();

/** Fired when the active tab is tapped again at its root: screens scroll to top. */
export const scrollTopSignal = createStore(0);

export const nav = {
  push(route: Route) {
    pushHistory();
    navStore.set(s => ({ ...s, transition: 'push', stacks: { ...s.stacks, [s.tab]: [...s.stacks[s.tab], entry(route)] } }));
  },
  /** Replace the top screen (e.g. "Next question") without growing the stack. */
  replace(route: Route) {
    navStore.set(s => ({ ...s, transition: 'none', stacks: { ...s.stacks, [s.tab]: [...s.stacks[s.tab].slice(0, -1), entry(route)] } }));
  },
  /** Back arrow, swipe-back and programmatic back all go through history when they can. */
  back(opts?: { swipe?: boolean }) {
    if (navStore.get().stacks[navStore.get().tab].length <= 1) return;
    if (pending > 0) {
      swipeNext = !!opts?.swipe;
      history.back();
    } else {
      popStack(opts?.swipe ? 'swipe' : 'pop');
    }
  },
  switchTab(tab: Tab) {
    const s = navStore.get();
    if (s.tab === tab) {
      // Re-tapping the active tab pops to its root, then scrolls to top (iOS and Material behaviour).
      if (s.stacks[tab].length > 1) {
        navStore.set({ ...s, transition: 'pop', stacks: { ...s.stacks, [tab]: s.stacks[tab].slice(0, 1) } });
      } else {
        scrollTopSignal.set(n => n + 1);
      }
      return;
    }
    navStore.set({ ...s, tab, transition: 'none', visited: s.visited.includes(tab) ? s.visited : [...s.visited, tab] });
  },
  /** Switch tab and push a route there (e.g. "Open in Reader" from another tab). */
  open(tab: Tab, route?: Route) {
    nav.switchTab(tab);
    if (route) nav.push(route);
  },
  /**
   * Register an open overlay (sheet/dialog). The back button then closes it.
   * Call the returned function when the overlay closes from the UI; it
   * consumes the overlay's history entry.
   */
  openOverlay(close: () => void): () => void {
    pushHistory();
    overlayClosers.push(close);
    let done = false;
    return () => {
      if (done) return;
      done = true;
      const i = overlayClosers.lastIndexOf(close);
      if (i < 0) return; // already closed by the back button
      overlayClosers.splice(i, 1);
      if (pending > 0) {
        ignorePops++;
        history.back();
      }
    };
  }
};
