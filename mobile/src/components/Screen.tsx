import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { nav, navStore, scrollMemory, scrollTopSignal, type Tab } from '../state/nav';
import { useStore } from '../lib/store';
import { usePlatform } from '../state/settings';
import { Pressable } from './ui/Pressable';

/** Provided by the stack navigator to each screen layer. */
export interface RouteInfo {
  key: string;
  tab: Tab;
  isTop: boolean;
  isRoot: boolean;
  /** Title of the screen underneath, for the iOS back label. */
  backLabel?: string;
}
export const RouteContext = createContext<RouteInfo>({ key: 'root', tab: 'hub', isTop: true, isRoot: true });
export const useRoute = () => useContext(RouteContext);

interface ScreenProps {
  /** Plain-text title (compact bar, accessibility). */
  title: string;
  /** Rich title for the iOS large-title block (may contain math). */
  largeTitle?: ReactNode;
  /** iOS large title that collapses into the bar on scroll. */
  large?: boolean;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Sticky content pinned under the bar (filters, segmented controls). */
  pinned?: ReactNode;
  /** Fixed content above the tab bar (chat composer, editor toolbar). */
  footer?: ReactNode;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onScroll?: (el: HTMLDivElement) => void;
  children: ReactNode;
  padded?: boolean;
}

/**
 * A full-height screen with a platform-adaptive top bar and its own touch
 * scroller. iOS: translucent bar, centred title, large title, chevron back
 * with the previous title. Android: opaque top app bar, left title, arrow
 * back, elevation when content scrolls beneath it.
 */
export function Screen({ title, largeTitle, large, subtitle, actions, pinned, footer, scrollRef, onScroll, children, padded = true }: ScreenProps) {
  const route = useRoute();
  const platform = usePlatform();
  const ios = platform === 'ios';
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = scrollRef ?? ownRef;
  const [bucket, setBucket] = useState(0);
  const showLarge = ios && large;

  // Restore scroll position when the screen remounts; remember it on scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const y = scrollMemory.get(route.key);
    if (y) el.scrollTop = y;
  }, [route.key, ref]);

  // Re-tapping the active tab at its root scrolls to the top.
  useEffect(
    () =>
      scrollTopSignal.subscribe(() => {
        if (route.isTop && route.isRoot) ref.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }),
    [route.isTop, route.isRoot, ref]
  );

  const handleScroll = () => {
    const el = ref.current!;
    scrollMemory.set(route.key, el.scrollTop);
    const y = el.scrollTop;
    const b = y > (showLarge ? 38 : 2) ? 2 : y > 2 ? 1 : 0;
    if (b !== bucket) setBucket(b);
    onScroll?.(el);
  };

  const footerRef = useRef<HTMLDivElement>(null);
  useBottomInset('--footer-h', footer ? footerRef : null);

  const compactTitleVisible = !showLarge || bucket === 2;
  const elevated = bucket > 0;

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div ref={ref} onScroll={handleScroll} className="scroller relative min-h-0 flex-1" style={{ paddingBottom: footer ? 16 : 'calc(var(--tabbar-h) + 28px)' }}>
        {/* Top bar */}
        <header
          className={
            'sticky top-0 z-20 transition-[background-color,box-shadow,border-color] duration-200 ' +
            (ios
              ? (elevated || !showLarge ? 'bar-material border-b border-line ' : 'border-b border-transparent ')
              : 'bg-canvas ' + (elevated ? 'shadow-e2 bg-surface ' : ''))
          }
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className={'relative flex items-center px-1.5 ' + (ios ? 'h-11' : 'h-14 gap-1')}>
            <div className={'flex items-center ' + (ios ? 'min-w-[88px] flex-1' : '')}>
              {!route.isRoot && <BackButton ios={ios} label={route.backLabel} />}
            </div>
            <h1
              className={
                ios
                  ? 'pointer-events-none absolute inset-x-[96px] truncate text-center text-[17px] font-semibold text-ink transition-opacity duration-200 ' + (compactTitleVisible ? 'opacity-100' : 'opacity-0')
                  : 'min-w-0 flex-1 truncate pl-2 text-[21px] text-ink'
              }
              aria-hidden={showLarge ? true : undefined}
            >
              {title}
            </h1>
            <div className={'flex items-center justify-end ' + (ios ? 'min-w-[88px] flex-1' : '')}>{actions}</div>
          </div>
        </header>

        {showLarge && (
          <div className="px-4 pb-1 pt-0.5">
            <h1 className="font-display text-[33px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">{largeTitle ?? title}</h1>
            {subtitle && <div className="mt-1 text-[15px] text-ink-3">{subtitle}</div>}
          </div>
        )}
        {!showLarge && subtitle && large && <div className="px-4 pb-1 pt-1 text-[14.5px] text-ink-3">{subtitle}</div>}

        {pinned && (
          <div className={'sticky z-10 ' + (ios ? 'bar-material' : 'bg-canvas')} style={{ top: `calc(env(safe-area-inset-top) + ${ios ? 44 : 56}px)` }}>
            {pinned}
          </div>
        )}

        <div className={padded ? 'px-4' : ''}>{children}</div>
      </div>
      {footer && (
        <div className="bar-material relative z-20 shrink-0 border-t border-line" style={{ paddingBottom: 'var(--tabbar-h)' }}>
          <div ref={footerRef}>{footer}</div>
        </div>
      )}
    </div>
  );
}

function BackButton({ ios, label }: { ios: boolean; label?: string }) {
  if (ios) {
    return (
      <Pressable onClick={() => nav.back()} aria-label={'Back' + (label ? ' to ' + label : '')} pressScale={0.95} className="flex h-11 max-w-[140px] items-center pr-2 text-latex-ink">
        <ChevronLeft size={30} strokeWidth={2.2} className="-ml-1 shrink-0" />
        <span className="-ml-0.5 truncate text-[17px]">{label || 'Back'}</span>
      </Pressable>
    );
  }
  return (
    <Pressable onClick={() => nav.back()} aria-label="Back" pressScale={0.9} className="flex h-12 w-12 items-center justify-center rounded-full text-ink">
      <ArrowLeft size={24} />
    </Pressable>
  );
}

/** Floating action button (Material FAB on Android, round tinted button on iOS). */
export function Fab({ label, icon, onClick, extended }: { label: string; icon: ReactNode; onClick: () => void; extended?: boolean }) {
  const ios = usePlatform() === 'ios';
  useBottomInset('--fab-h', 72);
  return (
    <motion.div
      className="pointer-events-none fixed right-4 z-30"
      style={{ bottom: 'calc(var(--tabbar-h) + 16px)' }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      <Pressable
        onClick={onClick}
        aria-label={label}
        haptic
        className={
          'pointer-events-auto flex items-center gap-2 bg-latex font-semibold text-white ' +
          (ios ? 'h-14 rounded-full px-5 shadow-[0_8px_24px_rgba(26,54,93,.45)] ' : 'h-14 rounded-2xl px-4 shadow-e3 ') +
          (extended ? '' : 'w-14 justify-center px-0')
        }
      >
        {icon}
        {extended && <span className="text-[15px]">{label}</span>}
      </Pressable>
    </motion.div>
  );
}

/**
 * While this screen is the visible one, publish the height of its bottom
 * chrome (footer bar or FAB) as a CSS variable so toasts sit above it.
 */
function useBottomInset(name: '--footer-h' | '--fab-h', source: RefObject<HTMLElement | null> | number | null) {
  const route = useRoute();
  const focused = useStore(navStore, s => s.tab === route.tab) && route.isTop;
  useEffect(() => {
    if (!focused || source == null) return;
    const root = document.documentElement.style;
    let ro: ResizeObserver | undefined;
    if (typeof source === 'number') root.setProperty(name, source + 'px');
    else if (source.current) {
      const el = source.current;
      const set = () => root.setProperty(name, el.offsetHeight + 'px');
      set();
      ro = new ResizeObserver(set);
      ro.observe(el);
    }
    return () => {
      ro?.disconnect();
      root.setProperty(name, '0px');
    };
  }, [focused, source, name]);
}
