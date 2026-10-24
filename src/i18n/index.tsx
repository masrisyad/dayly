import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Lang } from '../db/db';
import en, { type Dict } from './en';
import id from './id';

const dicts: Record<Lang, Dict> = { en, id };

/** Replaces {key} placeholders. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

const detectLang = (): Lang => (navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en');

interface I18n {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
  /** Intl date formatting in the current language. */
  date: (iso: string, opts: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const profileLang = useLiveQuery(() => db.profile.get('me').then((p) => p?.lang), []);
  const [localLang, setLocalLang] = useState<Lang>(detectLang);
  const lang = profileLang ?? localLang;

  const setLang = useCallback((next: Lang) => {
    setLocalLang(next);
    db.profile.update('me', { lang: next });
  }, []);

  const value = useMemo<I18n>(() => {
    const t = dicts[lang];
    return {
      lang,
      t,
      setLang,
      date: (iso, opts) => {
        const [y, m, d] = iso.split('-').map(Number);
        return new Intl.DateTimeFormat(t.locale, opts).format(new Date(y, (m || 1) - 1, d || 1));
      },
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
