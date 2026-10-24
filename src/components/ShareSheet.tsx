import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useI18n } from '../i18n';
import { canShareFile, downloadFile, shareFile } from '../lib/download';
import { isIOS } from '../lib/install';
import { renderShareImage, type ShareContent, type ShareFormat } from '../lib/shareImage';
import type { ShareContext } from '../lib/shareContent';
import { CrossIcon } from './TaskList';
import { InstagramIcon, SaveIcon, ShareGlyph, TikTokIcon, WhatsAppIcon } from './ShareIcons';
import { useToast } from './Toast';

type Destination = 'save' | 'waChat' | 'waStatus' | 'igStory' | 'tiktok';

const DESTINATIONS: { key: Destination; format: ShareFormat | null; icon: () => ReactNode }[] = [
  { key: 'save', format: null, icon: SaveIcon }, // uses the format picked in the sheet
  { key: 'waChat', format: 'post', icon: WhatsAppIcon },
  { key: 'waStatus', format: 'story', icon: WhatsAppIcon },
  { key: 'igStory', format: 'story', icon: InstagramIcon },
  { key: 'tiktok', format: 'story', icon: TikTokIcon },
];

export interface ShareOption<K extends string> {
  key: K;
  label: string;
}

interface ShareSheetProps<K extends string> {
  /** Builds what goes in the image; called again whenever the chosen sections change. */
  build: (ctx: ShareContext, include: ReadonlySet<K>) => ShareContent;
  fileBase: string; // e.g. 'dayly-harian-2026-10-25'
  options?: ShareOption<K>[];
  defaultOptions?: K[];
  storageKey?: string;
  onClose: () => void;
}

function readStored<K extends string>(key: string | undefined, fallback: K[], allowed: ShareOption<K>[] | undefined): Set<K> {
  if (!key || !allowed) return new Set(fallback);
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (Array.isArray(raw)) return new Set(raw.filter((k): k is K => allowed.some((o) => o.key === k)));
  } catch {
    /* unreadable or blocked storage: use the defaults */
  }
  return new Set(fallback);
}

const footerText = () => `Dayly · ${location.host}${import.meta.env.BASE_URL}`.replace(/\/$/, '');

/**
 * Bottom sheet that renders the planner as an image and hands it to the system share menu.
 * Web apps cannot post straight into WhatsApp, Instagram or TikTok, so each destination picks the
 * right size and tells the user which app to choose in the share menu. Images are rendered as soon
 * as the sheet opens, because iOS only opens the share menu right after a tap.
 */
export function ShareSheet<K extends string>({ build, fileBase, options, defaultOptions = [], storageKey, onClose }: ShareSheetProps<K>) {
  const { t, date } = useI18n();
  const toast = useToast();
  const profile = useLiveQuery(() => db.profile.get('me'), []);
  const [include, setInclude] = useState(() => readStored(storageKey, defaultOptions, options));
  const [format, setFormat] = useState<ShareFormat>('story');
  const [files, setFiles] = useState<Partial<Record<ShareFormat, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<ShareFormat, string>>>({});
  const buildRef = useRef(build);
  buildRef.current = build;
  const ios = isIOS();

  // Close on Escape and keep the page behind from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Render both sizes up front so a tap can open the share menu immediately.
  useEffect(() => {
    if (profile === undefined) return;
    let cancelled = false;
    const urls: string[] = [];
    setFiles({});
    const ctx: ShareContext = { t, date, owner: { name: profile?.name ?? '', avatar: profile?.avatar }, footer: footerText() };
    const content = buildRef.current(ctx, include);
    (async () => {
      const next: Partial<Record<ShareFormat, File>> = {};
      const nextUrls: Partial<Record<ShareFormat, string>> = {};
      for (const f of ['story', 'post'] as ShareFormat[]) {
        const blob = await renderShareImage(content, f);
        if (cancelled) return;
        next[f] = new File([blob], `${fileBase}-${f}.png`, { type: 'image/png' });
        nextUrls[f] = URL.createObjectURL(blob);
        urls.push(nextUrls[f]!);
      }
      setFiles(next);
      setPreviews(nextUrls);
    })().catch(() => !cancelled && toast.show(t.share.failed));
    return () => {
      cancelled = true;
      setTimeout(() => urls.forEach((u) => URL.revokeObjectURL(u)), 3000);
    };
    // `build` is read through a ref: the page's data is frozen while the sheet covers it.
  }, [include, profile, t, fileBase]);

  const toggle = (key: K) => {
    const next = new Set(include);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setInclude(next);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        /* private mode: the choice just isn't remembered */
      }
    }
  };

  const send = async (dest: Destination, preferred: ShareFormat | null) => {
    const f = preferred ?? format;
    setFormat(f);
    const file = files[f];
    if (!file) return;
    try {
      if (dest === 'save' && !(ios && canShareFile(file))) {
        downloadFile(file);
        toast.show(t.share.saved);
      } else if (canShareFile(file)) {
        await shareFile(file);
      } else {
        downloadFile(file);
        toast.show(t.share.unsupported);
      }
    } catch {
      toast.show(t.share.failed);
    }
  };

  const ready = !!files.story && !!files.post;

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-sheet" role="dialog" aria-modal="true" aria-label={t.share.title} onClick={(e) => e.stopPropagation()}>
        <header className="share-sheet__head">
          <h2>{t.share.title}</h2>
          <button type="button" className="icon-btn" aria-label={t.common.close} onClick={onClose}>
            <CrossIcon />
          </button>
        </header>

        <div className="share-sheet__body">
          <div className="share-preview">
            {previews[format] ? (
              <img src={previews[format]} alt={t.share.title} className={`share-preview__img share-preview__img--${format}`} />
            ) : (
              <p className="muted">{t.share.preparing}</p>
            )}
            {!ready && previews[format] && <span className="share-preview__busy">{t.share.preparing}</span>}
          </div>

          <div className="segmented share-sheet__formats" role="group">
            {(['story', 'post'] as ShareFormat[]).map((f) => (
              <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)}>
                {t.share[f]}
              </button>
            ))}
          </div>

          {options && (
            <fieldset className="share-options">
              <legend>{t.share.include}</legend>
              {options.map((o) => (
                <label key={o.key} className={`chip ${include.has(o.key) ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={include.has(o.key)} onChange={() => toggle(o.key)} />
                  {o.label}
                </label>
              ))}
            </fieldset>
          )}

          <div className="share-destinations">
            {DESTINATIONS.map(({ key, format: preferred, icon: Icon }) => {
              const copy = key === 'save' && ios ? t.share.destinations.saveIos : t.share.destinations[key];
              return (
                <button key={key} type="button" className="share-dest" disabled={!ready} onClick={() => send(key, preferred)}>
                  <Icon />
                  <span>
                    <strong>{copy.label}</strong>
                    <small>
                      {copy.hint}
                      {preferred && ` · ${t.share[preferred]}`}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="muted share-sheet__note">{t.share.privacy}</p>
        </div>
      </div>
      {toast.node}
    </div>
  );
}

export function ShareButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button type="button" className="btn btn--lavender share-btn" onClick={onClick}>
      <ShareGlyph />
      {t.share.button}
    </button>
  );
}
