import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useStore } from '../lib/store';
import { dismissToast, toastStore } from '../state/toast';
import { usePlatform } from '../state/settings';

/** Snackbar stack above the tab bar. */
export function Toasts() {
  const toasts = useStore(toastStore);
  const android = usePlatform() === 'android';
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(var(--tabbar-h) + var(--footer-h, 0px) + var(--fab-h, 0px) + 12px)' }}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, i) => Math.abs(i.offset.x) > 80 && dismissToast(t.id)}
            className={
              'pointer-events-auto flex w-full max-w-md items-center gap-3 px-4 py-3 text-[14.5px] ' +
              (android ? 'rounded-lg bg-surface-3 text-ink shadow-e3' : 'bar-material rounded-2xl border border-line text-ink shadow-e2')
            }
          >
            {t.kind === 'ok' ? (
              <CheckCircle2 size={18} className="shrink-0 text-sage-ink" />
            ) : t.kind === 'error' ? (
              <TriangleAlert size={18} className="shrink-0 text-danger" />
            ) : (
              <Info size={18} className="shrink-0 text-latex-ink" />
            )}
            <span className="flex-1">{t.text}</span>
            {t.action && (
              <button
                type="button"
                className="-my-2 min-h-11 shrink-0 px-2 font-semibold text-latex-ink"
                onClick={() => {
                  t.action!.run();
                  dismissToast(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
