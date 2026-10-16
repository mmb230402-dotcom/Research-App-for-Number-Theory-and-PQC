import { motion, type HTMLMotionProps } from 'framer-motion';
import type { PointerEvent, Ref } from 'react';
import { usePlatform } from '../../state/settings';
import { haptic as tick } from '../../lib/platform';

export type PressableProps = HTMLMotionProps<'button'> & {
  ref?: Ref<HTMLButtonElement>;
  /** Material ripple on Android; defaults to on. */
  ripple?: boolean;
  /** Short vibration on press (Android only). */
  haptic?: boolean;
  /** iOS press feedback: scale factor while pressed. */
  pressScale?: number;
};

/** Spawn a Material ripple at the pointer position, sized to cover the element. */
function spawnRipple(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const r = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.width = span.style.height = r * 2 + 'px';
  span.style.left = x - r + 'px';
  span.style.top = y - r + 'px';
  el.appendChild(span);
  span.addEventListener('animationend', () => span.remove(), { once: true });
}

/**
 * The single touch target primitive. iOS: spring scale/opacity on press.
 * Android: ink ripple plus a short haptic tick. Both respond on pointer-down,
 * so there is no tap delay.
 */
export function Pressable({ ripple = true, haptic = false, pressScale = 0.97, className = '', onPointerDown, type = 'button', ...rest }: PressableProps) {
  const platform = usePlatform();
  const android = platform === 'android';
  return (
    <motion.button
      type={type}
      className={(android && ripple ? 'ripple-host ' : '') + className}
      whileTap={android ? undefined : { scale: pressScale, opacity: 0.72 }}
      transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.6 }}
      onPointerDown={e => {
        if (android && ripple && !(rest.disabled as boolean)) spawnRipple(e);
        if (haptic) tick();
        onPointerDown?.(e);
      }}
      {...rest}
    />
  );
}

/** Round icon button (44×44 minimum touch target). */
export function IconButton({ label, className = '', children, ...rest }: PressableProps & { label: string }) {
  return (
    <Pressable
      aria-label={label}
      title={label}
      pressScale={0.9}
      className={'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2 active:bg-surface-2 disabled:opacity-40 ' + className}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
