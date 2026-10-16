import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useStore } from './lib/store';
import { navStore, TABS } from './state/nav';
import { usePlatform, useResolvedTheme } from './state/settings';
import { StackView } from './navigation/StackView';
import { TabBar } from './components/TabBar';
import { Toasts } from './components/Toasts';

export default function App() {
  const tab = useStore(navStore, s => s.tab);
  const visited = useStore(navStore, s => s.visited);
  const platform = usePlatform();
  const theme = useResolvedTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.platform = platform;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f2f3f6' : '#121212');
  }, [platform, theme]);

  return (
    <MotionConfig reducedMotion="user">
      <main className="absolute inset-0 overflow-hidden">
        {TABS.filter(t => visited.includes(t)).map(t => (
          <StackView key={t} tab={t} active={t === tab} />
        ))}
      </main>
      <TabBar />
      <Toasts />
    </MotionConfig>
  );
}
