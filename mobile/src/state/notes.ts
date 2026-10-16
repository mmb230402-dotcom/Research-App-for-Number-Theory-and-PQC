import { createStore } from '../lib/store';
import { NEW_NOTE_BODY, deriveTitle, seedNotes, type Note } from '../content/seedNotes';

export { deriveTitle };

const KEY = 'arithmos.m.notes.v1';
const isNotes = (v: unknown): v is Note[] =>
  Array.isArray(v) && v.length > 0 && v.every(n => n && typeof n.id === 'string' && typeof n.title === 'string' && typeof n.body === 'string');

function load(): Note[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (isNotes(parsed)) return parsed;
  } catch {
    /* fall through to the seed notes */
  }
  return seedNotes();
}

export const notesStore = createStore<Note[]>(load);

/** Auto-save indicator: 'saving' while a write is pending, 'memory' if localStorage refused it. */
export const saveStore = createStore<{ state: 'saved' | 'saving' | 'memory'; at: number }>({ state: 'saved', at: Date.now() });

let timer: ReturnType<typeof setTimeout> | undefined;
function persist() {
  clearTimeout(timer);
  try {
    localStorage.setItem(KEY, JSON.stringify(notesStore.get()));
    saveStore.set({ state: 'saved', at: Date.now() });
  } catch {
    saveStore.set({ state: 'memory', at: Date.now() });
  }
}
function queueSave() {
  saveStore.set(s => (s.state === 'saving' ? s : { ...s, state: 'saving' }));
  clearTimeout(timer);
  timer = setTimeout(persist, 700);
}

// Another tab saved its notes: adopt them instead of overwriting them on this tab's next save.
window.addEventListener('storage', e => {
  if (e.key !== KEY || !e.newValue) return;
  try {
    const parsed: unknown = JSON.parse(e.newValue);
    if (isNotes(parsed)) notesStore.set(parsed);
  } catch {
    /* ignore */
  }
});
// Flush a pending save when the app is backgrounded (iOS may kill it without unload).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && saveStore.get().state === 'saving') persist();
});

export const notes = {
  get: (id: string) => notesStore.get().find(n => n.id === id),
  update(id: string, body: string) {
    notesStore.set(list => list.map(n => (n.id === id ? { ...n, body, title: deriveTitle(body), updated: Date.now() } : n)));
    queueSave();
  },
  create(body = NEW_NOTE_BODY): string {
    const id = 'n-' + Date.now().toString(36);
    notesStore.set(list => [{ id, title: deriveTitle(body), body, updated: Date.now() }, ...list]);
    queueSave();
    return id;
  },
  remove(id: string): { note: Note; index: number } | null {
    const list = notesStore.get();
    const index = list.findIndex(n => n.id === id);
    if (index < 0) return null;
    const note = list[index];
    const rest = list.filter(n => n.id !== id);
    notesStore.set(rest.length ? rest : [{ id: 'n-' + Date.now().toString(36), title: 'Untitled note', body: '# Untitled note\n', updated: Date.now() }]);
    persist();
    return { note, index };
  },
  restore(note: Note, index: number) {
    notesStore.set(list => {
      const next = list.filter(n => n.id !== note.id);
      next.splice(Math.min(index, next.length), 0, note);
      return next;
    });
    persist();
  },
  togglePin(id: string) {
    notesStore.set(list => list.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
    persist();
  },
  append(id: string, text: string) {
    const n = notes.get(id);
    if (n) notes.update(id, n.body + text);
  },
  reset() {
    notesStore.set(seedNotes());
    persist();
  }
};

/** Pinned first, then most recently edited. */
export const sortNotes = (list: Note[]) => [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.updated - a.updated);
