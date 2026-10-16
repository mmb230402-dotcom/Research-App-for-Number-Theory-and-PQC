export type Platform = 'ios' | 'android';

/** Detect the host OS from the user agent. iPadOS reports itself as macOS, so touch support disambiguates. */
export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'ios';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  // Desktop browsers: Chromium-family browsers get Material, Safari/Firefox get the iOS look.
  return /Chrome|Chromium|Edg\//.test(ua) ? 'android' : 'ios';
}

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIOSDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

/** Short haptic tick where supported (Android Chrome); iOS Safari has no Vibration API. */
let hapticsOn = true;
export const setHaptics = (on: boolean) => {
  hapticsOn = on;
};
export function haptic(pattern: number | number[] = 8) {
  if (!hapticsOn) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
