import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { nav } from '../../state/nav';
import { usePlatform } from '../../state/settings';
import { Pressable } from './Pressable';

/**
 * Bottom sheet: the mobile replacement for dropdowns and modals.
 * Drag the handle (or the header) down to dismiss; the back button closes it
 * too, because opening it adds a history entry.
 */
export function Sheet({ open, onClose, title, children, footer, full }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode; full?: boolean }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const close = useCallback(() => closeRef.current(), []);

  // While open: own a history entry (so the back button closes the sheet) and make the app inert.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const release = nav.openOverlay(() => closeRef.current());
    const root = document.getElementById('root');
    openSheets++;
    root?.setAttribute('inert', '');
    return () => {
      release();
      if (--openSheets === 0) root?.removeAttribute('inert');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <SheetBody onClose={close} title={title} footer={footer} full={full}>
          {children}
        </SheetBody>
      )}
    </AnimatePresence>,
    document.body
  );
}

let openSheets = 0;

function SheetBody({ onClose, title, children, footer, full }: { onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode; full?: boolean }) {
  const controls = useDragControls();
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const platform = usePlatform();

  useEffect(() => {
    requestAnimationFrame(() => panel.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]); // onClose is stable (see Sheet)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={
          'absolute inset-x-0 bottom-0 mx-auto flex max-w-xl flex-col overflow-hidden bg-surface outline-none ' +
          (platform === 'android' ? 'rounded-t-[28px] shadow-e3 ' : 'rounded-t-[14px] ') +
          (full ? 'h-[92%]' : 'max-h-[88%]')
        }
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 420, damping: 40, mass: 0.9 }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.9 }}
        onDragEnd={onDragEnd}
      >
        <div className="shrink-0 cursor-grab touch-none select-none" onPointerDown={e => controls.start(e)}>
          <div className="flex justify-center pb-1 pt-2.5">
            <span className="h-[5px] w-9 rounded-full bg-line-strong" aria-hidden />
          </div>
          {title && (
            <h2 id={titleId} className={'px-5 pb-3 pt-1 text-[17px] font-semibold text-ink ' + (platform === 'android' ? 'text-left text-[20px] font-normal' : 'text-center')}>
              {title}
            </h2>
          )}
        </div>
        <div className="scroller min-h-0 flex-1 px-4 pb-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-line px-4 py-3">{footer}</div>}
      </motion.div>
    </div>
  );
}

export interface SheetAction {
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  checked?: boolean;
  run: () => void;
}

/** Action sheet: a list of actions in a bottom sheet (closes, then runs the action). */
export function ActionSheet({ open, onClose, title, actions }: { open: boolean; onClose: () => void; title?: string; actions: SheetAction[] }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <OptionList
        options={actions}
        onPick={a => {
          onClose();
          a.run();
        }}
      />
    </Sheet>
  );
}

export function OptionList({ options, onPick }: { options: SheetAction[]; onPick: (a: SheetAction) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface-2">
      {options.map((a, i) => (
        <Pressable
          key={a.label}
          onClick={() => onPick(a)}
          pressScale={0.99}
          className={
            'flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-[16px] ' +
            (i ? 'border-t border-line ' : '') +
            (a.destructive ? 'text-danger' : 'text-ink')
          }
        >
          {a.icon && <span className={a.destructive ? 'text-danger' : 'text-ink-3'}>{a.icon}</span>}
          <span className="flex-1">{a.label}</span>
          {a.checked && <Check size={19} className="text-latex-ink" aria-label="selected" />}
        </Pressable>
      ))}
    </div>
  );
}
