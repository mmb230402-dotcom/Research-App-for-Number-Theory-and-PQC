import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { Pressable } from './Pressable';
import { usePlatform } from '../../state/settings';
import { DIFFICULTY } from '../../content/exam';

/** Content card: hairline border on iOS, tonal elevation on Android. */
export function Card({ className = '', style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const android = usePlatform() === 'android';
  return (
    <div
      style={style}
      className={
        'rounded-[18px] bg-surface ' + (android ? 'rounded-2xl shadow-e1 ' : 'border border-line ') + className
      }
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, action, className = '' }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={'flex items-end justify-between px-1 pb-2 pt-5 ' + className}>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-3">{title}</h2>
      {action}
    </div>
  );
}

/** Filter / tag chip. */
export function Chip({
  children,
  active,
  onClick,
  onRemove,
  className = '',
  ariaLabel
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  const base =
    'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border text-[13.5px] font-medium transition-colors ';
  const tone = active ? 'border-transparent bg-latex text-white ' : 'border-line bg-surface text-ink-2 ';
  if (onRemove) {
    return (
      <span className={base + tone + 'pl-3.5 pr-1 ' + className}>
        {onClick ? (
          <button type="button" onClick={onClick} className="min-h-9">
            {children}
          </button>
        ) : (
          children
        )}
        <button
          type="button"
          aria-label={'Remove ' + (ariaLabel || '')}
          onClick={onRemove}
          className="-mr-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-3 active:bg-surface-3"
        >
          <X size={15} strokeWidth={2.2} />
        </button>
      </span>
    );
  }
  return (
    <Pressable aria-pressed={active} aria-label={ariaLabel} onClick={onClick} pressScale={0.94} className={base + tone + 'px-3.5 ' + className}>
      {children}
    </Pressable>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'blue' | 'sage' | 'amber' | 'danger'; className?: string }) {
  const tones = {
    neutral: 'bg-surface-2 text-ink-2',
    blue: 'bg-latex/60 text-latex-ink',
    sage: 'bg-sage/25 text-sage-ink',
    amber: 'bg-amber/35 text-amber-ink',
    danger: 'bg-danger/15 text-danger'
  };
  return (
    <span className={'inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[11.5px] font-semibold ' + tones[tone] + ' ' + className}>
      {children}
    </span>
  );
}

/** Circular progress (0–1) with an optional centre label. */
export function ProgressRing({ value, size = 56, stroke = 6, color = 'var(--sage-ink)', label, sub }: { value: number; size?: number; stroke?: number; color?: string; label?: ReactNode; sub?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={(sub ? sub + ': ' : '') + Math.round(v * 100) + '%'}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </svg>
      {label != null && <span className="absolute text-[13px] font-semibold tabular-nums text-ink">{label}</span>}
    </div>
  );
}

export function ProgressBar({ value, color = 'var(--sage-ink)', className = '', label }: { value: number; color?: string; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className={'h-1.5 w-full overflow-hidden rounded-full bg-surface-3 ' + className} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)}>
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={false} animate={{ width: v * 100 + '%' }} transition={{ type: 'spring', stiffness: 140, damping: 22 }} />
    </div>
  );
}

/** Five-step difficulty meter with its label. */
export function DifficultyMeter({ level }: { level: number }) {
  const color = level >= 5 ? 'var(--danger)' : level >= 4 ? 'var(--amber-ink)' : level >= 3 ? 'var(--latex-ink)' : 'var(--sage-ink)';
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={'Difficulty ' + level + ' of 5: ' + DIFFICULTY[level]}>
      <span className="flex gap-[3px]" aria-hidden>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className="h-3 w-[5px] rounded-full" style={{ background: i <= level ? color : 'var(--surface-3)' }} />
        ))}
      </span>
      <span className="text-[12px] font-medium text-ink-3">{DIFFICULTY[level]}</span>
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={'skeleton ' + className} aria-hidden />;
}

/** Segmented control: iOS sliding thumb / Material segmented button. */
export function Segmented<T extends string>({ value, options, onChange, className = '', label }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; className?: string; label: string }) {
  const id = useId();
  const android = usePlatform() === 'android';
  return (
    <div role="tablist" aria-label={label} className={'flex rounded-full p-1 ' + (android ? 'border border-line-strong p-0 ' : 'bg-surface-2 ') + className}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            pressScale={0.96}
            className={'relative flex-1 rounded-full px-2 text-[13.5px] font-semibold ' + (android ? 'h-10 ' : 'h-8 ') + (active ? 'text-ink' : 'text-ink-3')}
          >
            {active && (
              <motion.span
                layoutId={'seg-' + id}
                className={'absolute inset-0 rounded-full ' + (android ? 'bg-latex/70' : 'bg-surface-3 shadow-e1')}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center justify-center gap-1">{o.label}</span>
          </Pressable>
        );
      })}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-xl bg-surface-2 px-3 text-ink-3">
      <Search size={17} aria-hidden />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="-mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full">
          <X size={16} />
        </button>
      )}
    </label>
  );
}

/** iOS switch / Material switch. */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ' + (checked ? 'bg-sage' : 'bg-surface-3')}
    >
      <motion.span
        className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-e1"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
      />
    </button>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-3">{icon}</div>
      <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-3">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Filled / tonal action button. */
export function Button({ children, onClick, tone = 'primary', className = '', icon, disabled, ariaLabel }: { children: ReactNode; onClick?: () => void; tone?: 'primary' | 'tonal' | 'ghost' | 'danger' | 'sage'; className?: string; icon?: ReactNode; disabled?: boolean; ariaLabel?: string }) {
  const tones = {
    primary: 'bg-latex text-white',
    sage: 'bg-sage text-white',
    tonal: 'bg-surface-2 text-ink',
    ghost: 'text-latex-ink',
    danger: 'bg-danger/15 text-danger'
  };
  return (
    <Pressable
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      haptic
      className={withDefaults('inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold disabled:opacity-40 ' + tones[tone], className, { 'h-': 'h-11', 'px-': 'px-5', 'text-[': 'text-[15px]', 'gap-': 'gap-2' })}
    >
      {icon}
      {children}
    </Pressable>
  );
}

/** Append default utilities only for groups the caller did not set (a tiny tailwind-merge). */
function withDefaults(base: string, extra: string, defaults: Record<string, string>) {
  const given = extra.split(/\s+/);
  const fill = Object.entries(defaults)
    .filter(([prefix]) => !given.some(c => c.replace(/^!/, '').startsWith(prefix)))
    .map(([, cls]) => cls);
  return [base, ...fill, extra].join(' ');
}
