import { useEffect, useState } from 'react';
import type { Profile } from '../db/db';
import { wipeAll } from '../db/repo';
import { useI18n } from '../i18n';
import { verifyPin } from '../lib/pin';
import { Avatar } from '../components/Avatar';
import { BrandHeader } from '../components/BrandHeader';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'] as const;

export default function Lock({ profile, onUnlock }: { profile: Profile; onUnlock: () => void }) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [wrong, setWrong] = useState(false);

  // PINs are 4–6 digits, so try silently from the 4th digit on; only "OK" or a 6th digit reports a mistake.
  useEffect(() => {
    if (pin.length < 4 || !profile.pinHash || !profile.pinSalt) return;
    let alive = true;
    verifyPin(pin, profile.pinSalt, profile.pinHash).then((ok) => {
      if (!alive) return;
      if (ok) onUnlock();
      else if (pin.length === 6) fail();
    });
    return () => {
      alive = false;
    };
  }, [pin, profile, onUnlock]);

  const fail = () => {
    setWrong(true);
    setPin('');
    navigator.vibrate?.(120);
  };

  const press = (k: (typeof KEYS)[number]) => {
    setWrong(false);
    if (k === 'del') setPin((p) => p.slice(0, -1));
    else if (k === 'ok') {
      if (pin.length >= 4) verifyPin(pin, profile.pinSalt!, profile.pinHash!).then((ok) => (ok ? onUnlock() : fail()));
    } else if (pin.length < 6) setPin((p) => p + k);
  };

  const forgot = async () => {
    if (window.confirm(t.lock.forgotConfirm) && window.confirm(t.lock.forgotConfirm2)) await wipeAll();
  };

  return (
    <div className="shell shell--narrow lock" style={{ paddingBottom: 32 }}>
      <BrandHeader />
      <div className="lock__body">
        <div className="lock__info">
          <Avatar src={profile.avatar} size={84} />
          <h2 className="lock__title">{t.lock.title}</h2>
          <div className={`pin-dots ${wrong ? 'is-wrong' : ''}`} aria-live="polite">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className={i < pin.length ? 'is-filled' : i >= 4 ? 'is-optional' : ''} />
            ))}
          </div>
          <p className="error" style={{ minHeight: 20, margin: '4px 0' }}>
            {wrong ? t.lock.wrong : ''}
          </p>
        </div>
        <div className="keypad">
          {KEYS.map((k) => (
            <button key={k} type="button" className={`keypad__key keypad__key--${k}`} onClick={() => press(k)} aria-label={k}>
              {k === 'del' ? '⌫' : k === 'ok' ? 'OK' : k}
            </button>
          ))}
        </div>
        <button type="button" className="lock__forgot" onClick={forgot}>
          {t.lock.forgot}
        </button>
      </div>
    </div>
  );
}
