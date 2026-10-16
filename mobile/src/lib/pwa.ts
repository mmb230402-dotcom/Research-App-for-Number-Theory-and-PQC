import { createStore } from './store';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Android Chrome's deferred install prompt (null until the browser offers one). */
export const installStore = createStore<BeforeInstallPromptEvent | null>(null);

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installStore.set(e as BeforeInstallPromptEvent);
});
window.addEventListener('appinstalled', () => installStore.set(null));

export async function promptInstall(): Promise<boolean> {
  const evt = installStore.get();
  if (!evt) return false;
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  installStore.set(null);
  return outcome === 'accepted';
}

/** Register the Workbox service worker (offline precache). Silent where SWs are unavailable. */
export async function registerServiceWorker(onOfflineReady: () => void) {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV || import.meta.env.VITE_NO_SW) return;
  try {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: true, onOfflineReady });
  } catch {
    /* sandboxed or insecure context: the app still works online */
  }
}
