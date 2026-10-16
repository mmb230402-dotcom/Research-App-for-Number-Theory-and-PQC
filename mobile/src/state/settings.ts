import { useEffect, useState } from 'react';
import { createStore, isObj, useStore } from '../lib/store';
import { detectPlatform, setHaptics, type Platform } from '../lib/platform';

export type ThemePref = 'system' | 'dark' | 'light';
export type PlatformPref = 'auto' | Platform;

export interface Settings {
  theme: ThemePref;
  platform: PlatformPref;
  haptics: boolean;
  /** Shown in the Hub greeting; a local profile stands in for authentication. */
  name: string;
  field: string;
  installDismissed: boolean;
}

const DEFAULTS: Settings = {
  theme: 'dark',
  platform: 'auto',
  haptics: true,
  name: '',
  field: 'Number theory & PQC',
  installDismissed: false
};

export const settingsStore = createStore<Settings>(DEFAULTS, {
  key: 'arithmos.m.settings.v1',
  validate: (v): v is Settings => isObj(v) && typeof v.theme === 'string' && typeof v.platform === 'string'
});
// Merge older saved shapes with new defaults.
settingsStore.set(s => ({ ...DEFAULTS, ...s }));
setHaptics(settingsStore.get().haptics);
settingsStore.subscribe(() => setHaptics(settingsStore.get().haptics));

export const updateSettings = (patch: Partial<Settings>) => settingsStore.set(s => ({ ...s, ...patch }));

const detected = detectPlatform();
export function usePlatform(): Platform {
  const pref = useStore(settingsStore, s => s.platform);
  return pref === 'auto' ? detected : pref;
}
export const detectedPlatform = detected;

/** Resolved light/dark theme, following the OS when the preference is "system". */
export function useResolvedTheme(): 'dark' | 'light' {
  const pref = useStore(settingsStore, s => s.theme);
  const [osLight, setOsLight] = useState(() => window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!mq) return;
    const on = (e: MediaQueryListEvent) => setOsLight(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return pref === 'system' ? (osLight ? 'light' : 'dark') : pref;
}
