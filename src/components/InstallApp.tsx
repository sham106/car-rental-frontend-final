import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)');
    const syncDisplay = () => setInstalled(display.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); setHelpOpen(false); };
    syncDisplay();
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', onInstalled);
    display.addEventListener('change', syncDisplay);
    return () => {
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', onInstalled);
      display.removeEventListener('change', syncDisplay);
    };
  }, []);

  const install = async () => {
    if (!prompt) { setHelpOpen(value => !value); return; }
    setBusy(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') setHelpOpen(false);
    } catch { setHelpOpen(true); }
    finally { setPrompt(null); setBusy(false); }
  };

  if (installed) return null;
  return <div className="fixed left-4 bottom-4 z-40 max-w-[calc(100vw-2rem)]" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
    {helpOpen && <section id="install-app-help" aria-label="Install DailyCar" className="mb-3 w-80 max-w-full rounded-xl border border-[#DCE2E6] bg-white p-4 text-[#24313A] shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">Install DailyCar</h2>
        <button type="button" aria-label="Close installation instructions" onClick={() => setHelpOpen(false)} className="p-2"><X size={18} /></button>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{ios
        ? 'Open this website in Safari, tap Share, then Add to Home Screen. If shown, enable Open as Web App, then tap Add.'
        : 'Open your browser menu and look for Install app or Add to Home screen. On desktop, you may also see an install icon in the address bar.'}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#65727B]">If installation is unavailable, open the deployed website in Safari, Chrome or Edge instead of an in-app browser. You can still use DailyCar in your browser.</p>
    </section>}
    <button type="button" onClick={() => void install()} disabled={busy} aria-expanded={helpOpen} aria-controls={helpOpen ? 'install-app-help' : undefined}
      className="flex min-h-11 items-center gap-2 rounded-full bg-[#17324D] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1F4366] disabled:opacity-60">
      <Download size={17} />{busy ? 'Installing…' : 'Install app'}
    </button>
  </div>;
}
