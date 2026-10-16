import { motion } from 'framer-motion';
import { BookOpenText, GraduationCap, LayoutGrid, Newspaper, Sparkles, type LucideIcon } from 'lucide-react';
import { useStore } from '../lib/store';
import { nav, navStore, type Tab } from '../state/nav';
import { usePlatform } from '../state/settings';
import { typingStore } from '../state/typing';
import { Pressable } from './ui/Pressable';

const ITEMS: { tab: Tab; label: string; icon: LucideIcon }[] = [
  { tab: 'hub', label: 'Hub', icon: LayoutGrid },
  { tab: 'feed', label: 'arXiv', icon: Newspaper },
  { tab: 'notes', label: 'Notes', icon: BookOpenText },
  { tab: 'prep', label: 'Prep', icon: GraduationCap },
  { tab: 'scholar', label: 'Scholar', icon: Sparkles }
];

/** Bottom tab navigator: translucent iOS tab bar / Material 3 navigation bar with pill indicator. */
export function TabBar() {
  const tab = useStore(navStore, s => s.tab);
  const typing = useStore(typingStore);
  const ios = usePlatform() === 'ios';
  return (
    <nav
      aria-label="Primary"
      className={'bar-material absolute inset-x-0 bottom-0 z-40 flex ' + (ios ? 'border-t border-line' : 'shadow-[0_-1px_0_var(--line)]')}
      style={{ height: 'var(--tabbar-h)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {ITEMS.map(({ tab: t, label, icon: Icon }) => {
        const active = t === tab;
        return (
          <Pressable
            key={t}
            onClick={() => nav.switchTab(t)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            ripple={false}
            haptic
            pressScale={0.9}
            className={'relative flex flex-1 flex-col items-center justify-center ' + (ios ? 'gap-0.5 pt-1' : 'gap-1')}
          >
            <span className={'relative flex items-center justify-center ' + (ios ? 'h-7 w-12' : 'h-8 w-16')}>
              {!ios && active && (
                <motion.span layoutId="m3-pill" className="absolute inset-0 rounded-full bg-latex/80" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
              )}
              <Icon
                size={ios ? 25 : 22}
                strokeWidth={active ? 2.3 : 1.8}
                className={'relative ' + (active ? (ios ? 'text-latex-ink' : 'text-white') : 'text-ink-3')}
              />
              {t === 'scholar' && typing && <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-sage-ink" aria-label="Scholar is replying" />}
            </span>
            <span className={'text-[10.5px] ' + (active ? (ios ? 'font-semibold text-latex-ink' : 'font-bold text-ink') : 'font-medium text-ink-3') + (ios ? '' : ' text-[12px]')}>{label}</span>
          </Pressable>
        );
      })}
    </nav>
  );
}
