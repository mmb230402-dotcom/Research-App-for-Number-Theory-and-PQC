import { useSyncExternalStore } from 'react';

/**
 * Minimal external store with optional localStorage persistence.
 * Persisted stores validate what they read, fall back to their initial
 * value on malformed data, and adopt writes made by other tabs.
 */
export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(fn: () => void): () => void;
  /** Whether the last write reached localStorage (false: kept in memory only). */
  persisted(): boolean;
}

export function createStore<T>(initial: T | (() => T), opts?: { key: string; validate: (v: unknown) => v is T }): Store<T> {
  const listeners = new Set<() => void>();
  let ok = true;
  let state: T = (() => {
    if (opts) {
      try {
        const raw = localStorage.getItem(opts.key);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (opts.validate(parsed)) return parsed;
        }
      } catch {
        /* storage unavailable or malformed: use the initial value */
      }
    }
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  })();

  const emit = () => listeners.forEach(fn => fn());

  if (opts && typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
      if (e.key !== opts.key || !e.newValue) return;
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        if (opts.validate(parsed)) {
          state = parsed;
          emit();
        }
      } catch {
        /* ignore malformed data from another tab */
      }
    });
  }

  return {
    get: () => state,
    set(next) {
      const value = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      if (Object.is(value, state)) return;
      state = value;
      if (opts) {
        try {
          localStorage.setItem(opts.key, JSON.stringify(state));
          ok = true;
        } catch {
          ok = false;
        }
      }
      emit();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    persisted: () => ok
  };
}

export function useStore<T>(store: Store<T>): T;
export function useStore<T, S>(store: Store<T>, select: (s: T) => S): S;
export function useStore<T, S>(store: Store<T>, select?: (s: T) => S): T | S {
  return useSyncExternalStore(
    store.subscribe,
    () => (select ? select(store.get()) : store.get()),
    () => (select ? select(store.get()) : store.get())
  );
}

/* Small validators for persisted shapes */
export const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
export const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');
