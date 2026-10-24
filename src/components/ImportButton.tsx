import { useRef, type ReactNode } from 'react';
import { BackupError, parseBackup, restoreBackup, summarize } from '../db/backup';
import { fmt, useI18n } from '../i18n';

interface ImportButtonProps {
  className?: string;
  children: ReactNode;
  onResult: (message: string) => void;
}

/** Picks a backup JSON, shows what's inside, and replaces local data after confirmation. */
export function ImportButton({ className = 'btn btn--ghost', children, onResult }: ImportButtonProps) {
  const { t, date } = useI18n();
  const input = useRef<HTMLInputElement>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    try {
      const backup = parseBackup(await file.text());
      const s = summarize(backup);
      const ok = window.confirm(
        fmt(t.settings.importConfirm, {
          date: date(s.exportedAt.slice(0, 10), { dateStyle: 'medium' }),
          name: s.name ? ` (${s.name})` : '',
          tasks: s.tasks,
          days: s.days,
          events: s.events,
        }),
      );
      if (!ok) return;
      await restoreBackup(backup);
      onResult(t.settings.imported);
    } catch (e) {
      onResult(e instanceof BackupError ? t.settings.errors[e.code] : t.settings.errors['not-json']);
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={() => input.current?.click()}>
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </>
  );
}
