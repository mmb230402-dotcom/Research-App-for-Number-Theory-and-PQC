import { createStore } from '../lib/store';

export type ToastKind = 'info' | 'ok' | 'error';
export interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
  action?: { label: string; run: () => void };
}

export const toastStore = createStore<Toast[]>([]);
let seq = 0;

export function toast(text: string, kind: ToastKind = 'info', action?: Toast['action'], ms = 3200) {
  const id = ++seq;
  // Keep at most two on screen; the newest replaces the oldest.
  toastStore.set(list => [...list.slice(-1), { id, text, kind, action }]);
  setTimeout(() => dismissToast(id), action ? Math.max(ms, 5000) : ms);
}

export const dismissToast = (id: number) => toastStore.set(list => list.filter(t => t.id !== id));

export async function copyText(text: string, label = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    toast(label, 'ok');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand?.('copy');
    ta.remove();
    toast(ok ? label : 'Copy failed: select the text manually', ok ? 'ok' : 'error');
  }
}
