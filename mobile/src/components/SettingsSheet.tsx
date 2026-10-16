import { useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { Sheet, ActionSheet } from './ui/Sheet';
import { Segmented, Toggle, Button } from './ui/primitives';
import { useStore } from '../lib/store';
import { detectedPlatform, settingsStore, updateSettings, type PlatformPref, type ThemePref } from '../state/settings';
import { progress } from '../state/progress';
import { notes } from '../state/notes';
import { chat } from '../state/chat';
import { keywordStore, DEFAULT_KEYWORDS, refreshFeed } from '../state/feed';
import { toast } from '../state/toast';
import { isStandalone } from '../lib/platform';

/** Appearance, local profile and demo-data controls. */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore(settingsStore);
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Settings">
        <Group title="Appearance">
          <Row label="Theme">
            <Segmented<ThemePref>
              label="Theme"
              value={s.theme}
              onChange={theme => updateSettings({ theme })}
              options={[
                { value: 'dark', label: 'Noir' },
                { value: 'light', label: 'Light' },
                { value: 'system', label: 'Auto' }
              ]}
              className="w-[210px]"
            />
          </Row>
          <Row label="Interface style" hint={'Auto follows this device (' + (detectedPlatform === 'ios' ? 'iOS' : 'Android') + ')'}>
            <Segmented<PlatformPref>
              label="Interface style"
              value={s.platform}
              onChange={platform => updateSettings({ platform })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'ios', label: 'iOS' },
                { value: 'android', label: 'Material' }
              ]}
              className="w-[210px]"
            />
          </Row>
          <Row label="Haptic feedback" hint="Android devices with a vibration motor">
            <Toggle checked={s.haptics} onChange={haptics => updateSettings({ haptics })} label="Haptic feedback" />
          </Row>
        </Group>

        <Group title="Profile (stored on this device)">
          <Field label="Display name" value={s.name} placeholder="e.g. Mb" onChange={name => updateSettings({ name: name.slice(0, 40) })} />
          <Field label="Research field" value={s.field} placeholder="Number theory & PQC" onChange={field => updateSettings({ field: field.slice(0, 60) })} />
        </Group>

        <Group title="About">
          <p className="px-4 py-3 text-[14px] leading-relaxed text-ink-3">
            The arXiv feed and Gemini Scholar are offline simulations: papers are synthetic and answers come from a built-in knowledge base, so no
            account or API key is needed. Notes, keywords, chat and progress are saved in this browser's local storage.
            {isStandalone() ? ' Running as an installed app.' : ''}
          </p>
        </Group>

        <Button tone="danger" className="mt-2 w-full" icon={<RotateCcw size={17} />} onClick={() => setConfirm(true)}>
          Reset demo data
        </Button>
      </Sheet>
      <ActionSheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset notes, chat, keywords and progress?"
        actions={[
          {
            label: 'Reset everything',
            destructive: true,
            run: () => {
              notes.reset();
              chat.reset();
              progress.reset();
              keywordStore.set(DEFAULT_KEYWORDS);
              refreshFeed();
              toast('Demo data restored', 'ok');
            }
          },
          { label: 'Cancel', run: () => {} }
        ]}
      />
    </>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="px-1 pb-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">{title}</h3>
      <div className="overflow-hidden rounded-2xl bg-surface-2 [&>*+*]:border-t [&>*+*]:border-line">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[56px] items-center gap-3 px-4 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-[15.5px] text-ink">{label}</div>
        {hint && <div className="text-[12.5px] text-ink-3">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <label className="flex min-h-[52px] items-center gap-3 px-4">
      <span className="w-[120px] shrink-0 text-[15.5px] text-ink">{label}</span>
      <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent text-right text-ink outline-none placeholder:text-ink-3" />
    </label>
  );
}
