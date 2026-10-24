import { useRegisterSW } from 'virtual:pwa-register/react';
import { useI18n } from '../i18n';
import { asset } from '../lib/assets';

const HOURLY = 60 * 60 * 1000;

/** Looks for a new deploy now and then; skipped while offline or while an update is already downloading. */
function watchForUpdates(swUrl: string, registration: ServiceWorkerRegistration) {
  const check = async () => {
    if (registration.installing || !navigator.onLine) return;
    try {
      // Bypass the HTTP cache so GitHub Pages' cache headers can't hide a new sw.js.
      const res = await fetch(swUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
      if (res.status === 200) await registration.update();
    } catch {
      /* offline or server hiccup: try again next time */
    }
  };
  setInterval(check, HOURLY);
  // Installed iPhone apps are usually resumed rather than relaunched, so also check when the app comes back.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
}

/** Shows "New version available" and switches to it only when the user taps Reload. */
export function UpdateBanner() {
  const { t } = useI18n();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) watchForUpdates(swUrl, registration);
    },
  });

  if (!needRefresh) return null;

  const reload = () => {
    // Blurring the focused field makes LineField save its draft before the page reloads.
    (document.activeElement as HTMLElement | null)?.blur();
    setTimeout(async () => {
      // vite-plugin-pwa only reloads pages that were already controlled by a service worker when they
      // loaded. A first-visit page (e.g. the first launch of a freshly installed iPhone app, which iOS
      // may keep resuming for days) would activate the new version but stay on the old one, so reload
      // ourselves once the new worker takes over, or after a short wait if no controller change comes.
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        window.location.reload();
      };
      navigator.serviceWorker?.addEventListener('controllerchange', go, { once: true });
      await updateServiceWorker(true);
      setTimeout(go, 1500);
    }, 150);
  };

  return (
    <div className="update-banner" role="alert">
      <img src={asset('star')} alt="" />
      <div className="update-banner__text">
        <strong>{t.update.title}</strong>
        <span>{t.update.body}</span>
      </div>
      <button type="button" className="btn btn--mint" onClick={reload}>
        {t.update.reload}
      </button>
      <button type="button" className="icon-btn" aria-label={t.update.later} onClick={() => setNeedRefresh(false)}>
        ✕
      </button>
    </div>
  );
}
