'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
type Pwa = {
  registration: ServiceWorkerRegistration | null;
  installed: boolean;
  installPrompt: InstallEvent | null;
  secure: boolean;
  error: boolean;
  ready: boolean;
  install: () => Promise<void>;
};
const PwaContext = createContext<Pwa | null>(null);
export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installed, setInstalled] = useState(false);
  const [secure, setSecure] = useState(false);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const updateInstalled = () =>
      setInstalled(
        media.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone,
      );
    updateInstalled();
    media.addEventListener('change', updateInstalled);
    setSecure(window.isSecureContext);
    const captureInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallEvent);
    };
    const didInstall = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', captureInstall);
    window.addEventListener('appinstalled', didInstall);
    let alive = true;
    if ('serviceWorker' in navigator && window.isSecureContext) {
      void navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          if (!alive) return;
          setRegistration(reg);
          void navigator.serviceWorker.ready.then(() => {
            if (alive) setReady(true);
          });
          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            worker?.addEventListener('statechange', () => {
              if (alive && worker.state === 'redundant' && !reg.active) setError(true);
            });
          });
        })
        .catch(() => {
          if (alive) setError(true);
        });
    }
    return () => {
      alive = false;
      media.removeEventListener('change', updateInstalled);
      window.removeEventListener('beforeinstallprompt', captureInstall);
      window.removeEventListener('appinstalled', didInstall);
    };
  }, []);
  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }
  return (
    <PwaContext.Provider
      value={{ registration, installed, installPrompt, secure, error, ready, install }}
    >
      {children}
    </PwaContext.Provider>
  );
}
export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error('PwaProvider required');
  return value;
}
