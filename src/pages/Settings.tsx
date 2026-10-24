import { useEffect, useState, type FormEvent } from 'react';
import { db, type Profile } from '../db/db';
import { wipeAll } from '../db/repo';
import { downloadBackup } from '../db/backup';
import { useI18n } from '../i18n';
import { fileToAvatar } from '../lib/image';
import { hashPin, isValidPin, newSalt } from '../lib/pin';
import { Avatar } from '../components/Avatar';
import { Card, Deco } from '../components/Card';
import { ImportButton } from '../components/ImportButton';
import { InstallBanner } from '../components/InstallBanner';
import { LineField } from '../components/LineField';
import { useToast } from '../components/Toast';
import { LangSwitch } from './Onboarding';

export default function Settings({ profile }: { profile: Profile }) {
  const { t, lang, setLang } = useI18n();
  const toast = useToast();

  return (
    <div className="stack settings">
      <h1 className="bubble-text bubble-lavender page-title">{t.settings.title}</h1>

      <Card label={t.settings.profile} labelTone="pink" labelIcon="heart">
        <Deco name="bear" size={56} style={{ right: -4, top: -30 }} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Avatar src={profile.avatar} size={76} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="btn btn--ghost">
              {t.settings.changePhoto}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await db.profile.update('me', { avatar: await fileToAvatar(f) });
                }}
              />
            </label>
            {profile.avatar && (
              <button type="button" className="btn btn--ghost" onClick={() => db.profile.update('me', { avatar: undefined })}>
                {t.settings.removePhoto}
              </button>
            )}
          </div>
        </div>
        <label className="field" style={{ marginTop: 14 }}>
          <span>{t.settings.name}</span>
          <div className="line">
            <LineField value={profile.name} onCommit={(name) => name.trim() && db.profile.update('me', { name: name.trim() })} />
          </div>
        </label>
        <div className="field" style={{ marginBottom: 0 }}>
          <span>{t.settings.language}</span>
          <LangSwitch value={lang} onChange={setLang} />
        </div>
      </Card>

      <PinCard profile={profile} onDone={toast.show} />

      <Card tone="yellow" label={t.settings.data} labelTone="yellow" labelIcon="envelope">
        <p style={{ marginTop: 4 }}>{t.settings.dataHint}</p>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--mint"
            onClick={async () => {
              const r = await downloadBackup();
              if (r !== 'cancelled') toast.show(t.settings.exported);
            }}
          >
            ⬇ {t.settings.export}
          </button>
          <ImportButton onResult={toast.show}>⬆ {t.settings.import}</ImportButton>
        </div>
        <PersistRow />
      </Card>

      <InstallBanner always />

      <Card label={t.settings.about} labelTone="blue" labelIcon="star">
        <p style={{ margin: '4px 0' }}>
          <strong>Dayly</strong> · {t.settings.version} {__APP_VERSION__}
        </p>
        <p className="muted" style={{ margin: '4px 0' }}>
          {t.settings.license}
        </p>
        {__REPO_URL__ && (
          <p style={{ margin: '4px 0' }}>
            <a href={__REPO_URL__} target="_blank" rel="noreferrer">
              {t.settings.source}
            </a>
          </p>
        )}
        <button
          type="button"
          className="btn btn--danger btn--block"
          style={{ marginTop: 12 }}
          onClick={async () => {
            if (window.confirm(t.settings.resetConfirm)) await wipeAll();
          }}
        >
          {t.settings.reset}
        </button>
      </Card>
      {toast.node}
    </div>
  );
}

function PinCard({ profile, onDone }: { profile: Profile; onDone: (msg: string) => void }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const hasPin = !!profile.pinHash;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPin(pin)) return setError(t.onboarding.pinInvalid);
    if (pin !== pin2) return setError(t.onboarding.pinMismatch);
    const pinSalt = newSalt();
    await db.profile.update('me', { pinSalt, pinHash: await hashPin(pin, pinSalt) });
    setEditing(false);
    setPin('');
    setPin2('');
    setError('');
    onDone(t.settings.saved);
  };

  return (
    <Card label={t.settings.security} labelTone="lavender" labelIcon="clock">
      <p style={{ marginTop: 4 }}>{hasPin ? t.settings.pinOn : t.settings.pinOff}</p>
      {editing ? (
        <form onSubmit={save} noValidate>
          <label className="field">
            <span>{t.settings.newPin}</span>
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
          </label>
          <label className="field">
            <span>{t.settings.confirmPin}</span>
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
          {error && <p className="error">{error}</p>}
          <div className="btn-row">
            <button type="submit" className="btn">
              {t.common.save}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>
              {t.common.cancel}
            </button>
          </div>
        </form>
      ) : (
        <div className="btn-row">
          <button type="button" className="btn btn--lavender" onClick={() => setEditing(true)}>
            {hasPin ? t.settings.changePin : t.settings.setPin}
          </button>
          {hasPin && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={async () => {
                await db.profile.update('me', { pinHash: undefined, pinSalt: undefined });
                onDone(t.settings.saved);
              }}
            >
              {t.settings.removePin}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

function PersistRow() {
  const { t } = useI18n();
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted, () => setPersisted(null));
  }, []);

  if (persisted === null) return null;
  return (
    <div className="persist">
      <strong>{t.settings.persist}</strong>
      <p className="muted" style={{ margin: '4px 0 8px' }}>
        {persisted ? t.settings.persistOn : denied ? t.settings.persistDenied : t.settings.persistOff}
      </p>
      {!persisted && (
        <button
          type="button"
          className="btn btn--ghost"
          onClick={async () => {
            const ok = await navigator.storage.persist();
            setPersisted(ok);
            setDenied(!ok);
          }}
        >
          {t.settings.persistButton}
        </button>
      )}
    </div>
  );
}
