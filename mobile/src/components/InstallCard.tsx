import { useState, type ReactNode } from 'react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { Card, Button } from './ui/primitives';
import { Sheet } from './ui/Sheet';
import { useStore } from '../lib/store';
import { installStore, promptInstall } from '../lib/pwa';
import { isIOSDevice, isStandalone } from '../lib/platform';
import { settingsStore, updateSettings } from '../state/settings';
import { toast } from '../state/toast';

/** "Add to Home Screen" prompt: native install on Android Chrome, step-by-step sheet on iOS Safari. */
export function InstallCard() {
  const deferred = useStore(installStore);
  const dismissed = useStore(settingsStore, s => s.installDismissed);
  const [steps, setSteps] = useState(false);
  const ios = isIOSDevice();
  if (dismissed || isStandalone() || (!deferred && !ios)) return null;

  const install = async () => {
    if (deferred) {
      const ok = await promptInstall();
      if (ok) toast('Arithmos installed', 'ok');
    } else {
      setSteps(true);
    }
  };

  return (
    <>
      <Card className="relative mt-3 flex items-center gap-3 p-3.5 pr-11">
        <img src={import.meta.env.BASE_URL + 'icons/icon-192.png'} alt="" className="h-11 w-11 rounded-[11px]" />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-ink">Install Arithmos</div>
          <div className="text-[13px] text-ink-3">Full screen, offline, from your home screen.</div>
        </div>
        <Button tone="primary" className="h-9 px-4 text-[14px]" onClick={install} icon={<Download size={16} />}>
          Install
        </Button>
        <button type="button" aria-label="Dismiss install suggestion" onClick={() => updateSettings({ installDismissed: true })} className="absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-3">
          <X size={16} />
        </button>
      </Card>
      <Sheet open={steps} onClose={() => setSteps(false)} title="Add to Home Screen">
        <ol className="flex flex-col gap-3 text-[15px] text-ink-2">
          <Step n={1} icon={<Share size={18} />}>Tap the Share button in Safari's toolbar.</Step>
          <Step n={2} icon={<SquarePlus size={18} />}>Scroll and choose “Add to Home Screen”.</Step>
          <Step n={3} icon={<Download size={18} />}>Tap “Add”. Arithmos then opens full screen and works offline.</Step>
        </ol>
      </Sheet>
    </>
  );
}

function Step({ n, icon, children }: { n: number; icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-latex text-[14px] font-semibold text-white">{n}</span>
      <span className="flex-1">{children}</span>
      <span className="text-latex-ink">{icon}</span>
    </li>
  );
}
