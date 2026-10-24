import { db, type CalendarEvent, type Day, type Month, type Profile, type Task } from './db';
import { todayISO } from '../lib/dates';
import { migratedWeekKey } from '../lib/weeks';
import { downloadFile } from '../lib/download';

export const BACKUP_APP = 'dayly';
/** 1 = v1.0.0 (month-chunk weeks), 2 = v1.1.0+ (Mon–Fri weeks keyed by Monday). */
export const BACKUP_SCHEMA = 2;

export interface BackupData {
  profile: Omit<Profile, 'pinHash' | 'pinSalt'> | null;
  tasks: Task[];
  days: Day[];
  months: Month[];
  events: CalendarEvent[];
}

export interface BackupFile {
  app: typeof BACKUP_APP;
  schemaVersion: number;
  exportedAt: string;
  data: BackupData;
}

export type BackupErrorCode = 'not-json' | 'not-dayly' | 'too-new' | 'corrupt';

export class BackupError extends Error {
  constructor(public code: BackupErrorCode) {
    super(code);
  }
}

export async function createBackup(): Promise<BackupFile> {
  const [profile, tasks, days, months, events] = await Promise.all([
    db.profile.get('me'),
    db.tasks.toArray(),
    db.days.toArray(),
    db.months.toArray(),
    db.events.toArray(),
  ]);
  // The PIN stays on the old device; the new device sets its own.
  let safeProfile: BackupData['profile'] = null;
  if (profile) {
    const { pinHash: _h, pinSalt: _s, ...rest } = profile;
    safeProfile = rest;
  }
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    data: { profile: safeProfile, tasks, days, months, events },
  };
}

/** Upgrades older backup formats to the current schema. Add a step here whenever BACKUP_SCHEMA is bumped. */
function migrate(file: BackupFile): BackupFile {
  let f = file;
  if (f.schemaVersion < 2) {
    f = {
      ...f,
      schemaVersion: 2,
      data: { ...f.data, tasks: f.data.tasks.map((t) => ({ ...t, weekKey: migratedWeekKey(t) })) },
    };
  }
  return f;
}

const isArr = (v: unknown): v is unknown[] => Array.isArray(v);

export function parseBackup(text: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError('not-json');
  }
  const f = raw as Partial<BackupFile> | null;
  if (!f || f.app !== BACKUP_APP || typeof f.schemaVersion !== 'number' || !f.data) {
    throw new BackupError('not-dayly');
  }
  if (f.schemaVersion > BACKUP_SCHEMA) throw new BackupError('too-new');
  const d = f.data;
  if (!isArr(d.tasks) || !isArr(d.days) || !isArr(d.months) || !isArr(d.events)) {
    throw new BackupError('corrupt');
  }
  return migrate(f as BackupFile);
}

export function summarize(file: BackupFile) {
  return {
    name: file.data.profile?.name ?? '',
    tasks: file.data.tasks.length,
    days: file.data.days.length,
    events: file.data.events.length,
    exportedAt: file.exportedAt,
  };
}

/** Replaces everything on this device with the backup. Keeps this device's PIN if one is set. */
export async function restoreBackup(file: BackupFile): Promise<void> {
  const { profile, tasks, days, months, events } = file.data;
  await db.transaction('rw', [db.profile, db.tasks, db.days, db.months, db.events], async () => {
    const current = await db.profile.get('me');
    await Promise.all([db.tasks.clear(), db.days.clear(), db.months.clear(), db.events.clear()]);
    if (profile) {
      await db.profile.put({ ...profile, id: 'me', pinHash: current?.pinHash, pinSalt: current?.pinSalt });
    }
    await db.tasks.bulkPut(tasks);
    await db.days.bulkPut(days);
    await db.months.bulkPut(months);
    await db.events.bulkPut(events);
  });
}

export const backupFileName = () => `dayly-backup-${todayISO()}.json`;

/** Opens the share sheet on phones (save to Files / Drive / AirDrop); falls back to a normal download. */
export async function downloadBackup(): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const json = JSON.stringify(await createBackup(), null, 2);
  const name = backupFileName();
  const file = new File([json], name, { type: 'application/json' });
  const isTouch = matchMedia('(pointer: coarse)').matches;
  if (isTouch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
      // any other share failure falls through to a plain download
    }
  }
  downloadFile(file);
  return 'downloaded';
}
