import { useState, type FormEvent } from 'react';
import { db, type Lang } from '../db/db';
import { useI18n } from '../i18n';
import { fileToAvatar } from '../lib/image';
import { hashPin, isValidPin, newSalt } from '../lib/pin';
import { Card, Deco } from '../components/Card';
import { InstallBanner } from '../components/InstallBanner';
import { ImportButton } from '../components/ImportButton';
import { useToast } from '../components/Toast';
import { Avatar } from '../components/Avatar';
import { BrandHeader } from '../components/BrandHeader';

export default function Onboarding() {
  const { t, lang, setLang } = useI18n();
  const toast = useToast();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(t.onboarding.nameRequired);
    if (pin && !isValidPin(pin)) return setError(t.onboarding.pinInvalid);
    if (pin && pin !== pin2) return setError(t.onboarding.pinMismatch);
    setBusy(true);
    const pinSalt = pin ? newSalt() : undefined;
    const pinHash = pin && pinSalt ? await hashPin(pin, pinSalt) : undefined;
    await db.profile.put({ id: 'me', name: name.trim(), avatar, lang, pinHash, pinSalt, createdAt: Date.now() });
    // App.tsx reacts to the new profile row and shows Home.
  };

  return (
    <div className="shell shell--narrow" style={{ paddingBottom: 32 }}>
      <BrandHeader />
      <div className="stack" style={{ marginTop: 28 }}>
        <InstallBanner />
        <Card label={t.onboarding.welcome} labelTone="pink" labelIcon="heart">
          <Deco name="bear" size={70} style={{ right: 8, top: -40 }} />
          <p className="muted" style={{ marginTop: 4 }}>
            {t.onboarding.sub}
          </p>
          <form onSubmit={submit} noValidate>
            <label className="field">
              <span>{t.onboarding.name}</span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.onboarding.namePlaceholder}
                autoComplete="given-name"
              />
            </label>

            <div className="field">
              <span>{t.onboarding.photo}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar src={avatar} size={64} />
                <label className="btn btn--ghost">
                  {t.onboarding.choosePhoto}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setAvatar(await fileToAvatar(f));
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="field">
              <span>{t.onboarding.language}</span>
              <LangSwitch value={lang} onChange={setLang} />
            </div>

            <label className="field">
              <span>{t.onboarding.pin}</span>
              <input
                className="input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="new-password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
              <small>{t.onboarding.pinHint}</small>
            </label>
            {pin && (
              <label className="field">
                <span>{t.onboarding.pinConfirm}</span>
                <input
                  className="input"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="new-password"
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))}
                />
              </label>
            )}

            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn--block" disabled={busy}>
              {t.onboarding.start}
            </button>
          </form>
        </Card>

        <ImportButton className="btn btn--ghost btn--block" onResult={toast.show}>
          {t.onboarding.restore}
        </ImportButton>
      </div>
      {toast.node}
    </div>
  );
}

export function LangSwitch({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="segmented" role="group">
      {(
        [
          ['id', 'Indonesia'],
          ['en', 'English'],
        ] as const
      ).map(([code, label]) => (
        <button key={code} type="button" aria-pressed={value === code} onClick={() => onChange(code)}>
          {label}
        </button>
      ))}
    </div>
  );
}
