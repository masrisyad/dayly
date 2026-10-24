import { useState } from 'react';
import { useI18n } from '../i18n';
import { isIOS, isStandalone, useInstallPrompt } from '../lib/install';
import { Card, Deco } from './Card';

const DISMISS_KEY = 'dayly.installDismissed';

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Explains how to install Dayly. Hidden once installed or dismissed (unless `always`). */
export function InstallBanner({ always = false }: { always?: boolean }) {
  const { t } = useI18n();
  const { canPrompt, prompt } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(readDismissed);
  const ios = isIOS();

  if (isStandalone() || (!always && dismissed) || (!ios && !canPrompt)) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode: the banner simply comes back next time */
    }
  };

  return (
    <Card tone="blue" label={t.install.title} labelTone="blue">
      <Deco name="star" size={34} style={{ right: 10, top: -14 }} />
      {ios ? (
        <>
          <p style={{ margin: '4px 0 8px' }}>
            {t.install.ios} <ShareIcon />
          </p>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            {t.install.iosWarn}
          </p>
        </>
      ) : (
        <p style={{ margin: '4px 0 0' }}>{t.install.android}</p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {canPrompt && (
          <button type="button" className="btn btn--lavender" onClick={prompt}>
            {t.install.button}
          </button>
        )}
        {!always && (
          <button type="button" className="btn btn--ghost" onClick={dismiss}>
            {t.install.dismiss}
          </button>
        )}
      </div>
    </Card>
  );
}

const ShareIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" aria-label="Share" style={{ verticalAlign: '-3px' }}>
    <path d="M8 1v11M4.5 4.5L8 1l3.5 3.5" fill="none" stroke="var(--blue-deep)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 7H2.5v9.5h11V7H11" fill="none" stroke="var(--blue-deep)" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
