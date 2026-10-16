import { AnimatePresence, animate, motion, useDragControls, useMotionValue, usePresence, type MotionValue, type PanInfo } from 'framer-motion';
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { nav, navStore, type StackEntry, type Tab, type Transition } from '../state/nav';
import { usePlatform } from '../state/settings';
import { RouteContext } from '../components/Screen';
import { RouteScreen, routeTitle } from './routes';
import type { Platform } from '../lib/platform';

const IOS_SPRING = { type: 'spring', stiffness: 360, damping: 38, mass: 1 } as const;
const IOS_SWIPE = { type: 'spring', stiffness: 520, damping: 46, mass: 0.8 } as const;
const PARALLAX = 0.3;

/**
 * One tab's push/pop stack. Every screen in the stack stays mounted (so its
 * scroll position and inputs survive); the screen under the top one sits
 * offset to the left on iOS and is revealed by the back gesture.
 */
export function StackView({ tab, active }: { tab: Tab; active: boolean }) {
  const stack = useStore(navStore, s => s.stacks[tab]);
  const transition = useStore(navStore, s => s.transition);
  const platform = usePlatform();
  const xs = useRef(new Map<string, MotionValue<number>>());

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ visibility: active ? 'visible' : 'hidden' }} inert={!active} aria-hidden={!active} data-tab={tab} data-active={active ? 'true' : 'false'}>
      <AnimatePresence initial={false}>
        {stack.map((entry, i) => (
          <Layer
            key={entry.key}
            entry={entry}
            pos={stack.length - 1 - i}
            index={i}
            tab={tab}
            backLabel={i > 0 ? routeTitle(stack[i - 1]) : undefined}
            underKey={i > 0 ? stack[i - 1].key : undefined}
            transition={transition}
            platform={platform}
            xs={xs.current}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function useX(xs: Map<string, MotionValue<number>>, key: string) {
  const mv = useMotionValue(0);
  if (!xs.has(key)) xs.set(key, mv);
  return xs.get(key)!;
}

function Layer({
  entry, pos, index, tab, backLabel, underKey, transition, platform, xs
}: {
  entry: StackEntry; pos: number; index: number; tab: Tab; backLabel?: string; underKey?: string;
  transition: Transition; platform: Platform; xs: Map<string, MotionValue<number>>;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const ios = platform === 'ios';
  const x = useX(xs, entry.key);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const controls = useDragControls();
  const prevPos = useRef(pos);
  const width = () => window.innerWidth;

  // Enter
  useLayoutEffect(() => {
    if (transition !== 'push' || pos !== 0) return;
    if (ios) {
      x.set(width());
      animate(x, 0, IOS_SPRING);
    } else {
      opacity.set(0);
      y.set(48);
      animate(opacity, 1, { duration: 0.2, ease: 'linear' });
      animate(y, 0, { duration: 0.34, ease: [0.05, 0.7, 0.1, 1] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Covered by a push / revealed by a pop
  useEffect(() => {
    if (prevPos.current === pos) return;
    prevPos.current = pos;
    if (!ios) {
      x.set(0);
      return;
    }
    const target = pos === 0 ? 0 : -width() * PARALLAX;
    if (transition === 'none') x.set(target);
    else animate(x, target, transition === 'swipe' ? IOS_SWIPE : IOS_SPRING);
  }, [pos, ios, transition, x]);

  // Platform switched in settings: snap to the resting position.
  useEffect(() => {
    x.set(pos === 0 || !ios ? 0 : -width() * PARALLAX);
    y.set(0);
    opacity.set(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ios]);

  // Exit (popped)
  useEffect(() => {
    if (isPresent) return;
    if (transition === 'none' || transition === 'push') {
      safeToRemove();
      return;
    }
    if (ios) {
      animate(x, width(), transition === 'swipe' ? IOS_SWIPE : IOS_SPRING).then(() => safeToRemove());
    } else {
      animate(y, 48, { duration: 0.2, ease: [0.3, 0, 0.8, 0.15] });
      animate(opacity, 0, { duration: 0.18 }).then(() => safeToRemove());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  const under = underKey ? xs.get(underKey) : undefined;
  const swipeEnabled = ios && isPresent && pos === 0 && index > 0;

  const onDrag = () => {
    if (under) under.set(-width() * PARALLAX * (1 - Math.min(1, x.get() / width())));
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const commit = x.get() > width() * 0.35 || info.velocity.x > 520;
    if (commit) {
      nav.back({ swipe: true });
    } else {
      animate(x, 0, IOS_SWIPE);
      if (under) animate(under, -width() * PARALLAX, IOS_SWIPE);
    }
  };

  const hidden = pos >= 2 && isPresent;
  const covered = pos >= 1 && isPresent;

  return (
    <motion.div
      className="absolute inset-0 bg-canvas will-change-transform"
      style={{
        x,
        y,
        opacity,
        display: hidden ? 'none' : undefined,
        boxShadow: index > 0 && ios ? '-10px 0 28px rgba(0,0,0,.28)' : undefined
      }}
      inert={covered}
      aria-hidden={covered}
      data-top={pos === 0 && isPresent ? 'true' : undefined}
      drag={swipeEnabled ? 'x' : false}
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ left: 0, right: width() }}
      dragElastic={0}
      dragMomentum={false}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    >
      <RouteContext.Provider value={{ key: entry.key, tab, isTop: pos === 0, isRoot: index === 0, backLabel }}>
        <Suspense fallback={<div className="h-full bg-canvas" />}>
          <RouteScreen route={entry} />
        </Suspense>
      </RouteContext.Provider>
      {swipeEnabled && (
        // Edge strip that starts the iOS interactive back gesture.
        <div className="absolute inset-y-0 left-0 z-40 w-5 touch-none" onPointerDown={e => controls.start(e)} aria-hidden />
      )}
    </motion.div>
  );
}
