import { useEffect, type RefObject } from 'react';
import { animate, useMotionValue } from 'framer-motion';

const TRIGGER = 64;

/**
 * Pull-to-refresh on a scroll container: pulling down at the top grows an
 * indicator (returned motion value, in px); releasing past the threshold runs
 * onRefresh. Touch listeners are passive, so native scrolling is never blocked.
 */
export function usePullToRefresh(ref: RefObject<HTMLElement | null>, onRefresh: () => void, busy: boolean) {
  const pull = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startY = 0;
    let tracking = false;
    const start = (e: TouchEvent) => {
      tracking = el.scrollTop <= 0 && !busy;
      startY = e.touches[0].clientY;
    };
    const move = (e: TouchEvent) => {
      if (!tracking) return;
      const dy = e.touches[0].clientY - startY;
      if (el.scrollTop > 0 || dy <= 0) {
        pull.set(0);
        return;
      }
      pull.set(Math.min(110, dy * 0.5));
    };
    const end = () => {
      if (!tracking) return;
      tracking = false;
      if (pull.get() >= TRIGGER) {
        animate(pull, 52, { type: 'spring', stiffness: 400, damping: 35 });
        onRefresh();
      } else {
        animate(pull, 0, { type: 'spring', stiffness: 400, damping: 35 });
      }
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', end, { passive: true });
    el.addEventListener('touchcancel', end, { passive: true });
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, [ref, onRefresh, busy, pull]);

  // Collapse the indicator once the refresh finishes.
  useEffect(() => {
    if (!busy && pull.get() > 0) animate(pull, 0, { type: 'spring', stiffness: 400, damping: 35 });
  }, [busy, pull]);

  return { pull, trigger: TRIGGER };
}
