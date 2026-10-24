import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/db';
import { addTask, patchDay, wipeAll } from '../db/repo';
import { BackupError, createBackup, parseBackup, restoreBackup } from '../db/backup';

beforeEach(async () => {
  await wipeAll();
});

describe('backup', () => {
  it('round-trips all data and leaves the PIN out of the file', async () => {
    await db.profile.put({ id: 'me', name: 'Maya', lang: 'id', createdAt: 1, pinHash: 'h', pinSalt: 's' });
    await addTask({ date: '2026-10-24', kind: 'todo', text: 'Buy flowers' });
    await addTask({ date: null, weekKey: '2026-10-26', kind: 'selfcare', text: 'Long bath' });
    await patchDay('2026-10-24', { water: 5, notes: 'hello' });
    await db.events.put({ id: 'e1', date: '2026-10-29', title: 'Birthday dinner' });
    await db.months.put({ month: '2026-10', achievements: ['Gym streak'] });

    const text = JSON.stringify(await createBackup());
    expect(text).not.toContain('pinHash');

    await wipeAll();
    await db.profile.put({ id: 'me', name: 'New phone', lang: 'en', createdAt: 2, pinHash: 'new', pinSalt: 'salt' });
    await restoreBackup(parseBackup(text));

    const profile = await db.profile.get('me');
    expect(profile?.name).toBe('Maya');
    expect(profile?.pinHash).toBe('new'); // this device keeps its own PIN
    expect(await db.tasks.count()).toBe(2);
    expect((await db.days.get('2026-10-24'))?.water).toBe(5);
    expect((await db.events.get('e1'))?.title).toBe('Birthday dinner');
    expect((await db.months.get('2026-10'))?.achievements).toEqual(['Gym streak']);
  });

  it('replaces existing data instead of merging', async () => {
    const empty = JSON.stringify(await createBackup());
    await addTask({ date: '2026-10-01', kind: 'todo', text: 'Old task' });
    await restoreBackup(parseBackup(empty));
    expect(await db.tasks.count()).toBe(0);
  });

  it('re-keys weeks when importing a v1.0.0 backup', async () => {
    const v1 = {
      app: 'dayly',
      schemaVersion: 1,
      exportedAt: '2026-10-20T00:00:00.000Z',
      data: {
        profile: null,
        tasks: [
          { id: 't1', date: '2026-10-01', weekKey: '2026-10-W1', kind: 'todo', text: 'a', done: false, order: 0 },
          { id: 't2', date: null, weekKey: '2026-10-W3', kind: 'selfcare', text: 'b', done: false, order: 0 },
        ],
        days: [],
        months: [],
        events: [],
      },
    };
    const parsed = parseBackup(JSON.stringify(v1));
    expect(parsed.schemaVersion).toBe(2);
    await restoreBackup(parsed);
    expect((await db.tasks.get('t1'))?.weekKey).toBe('2026-09-28');
    expect((await db.tasks.get('t2'))?.weekKey).toBe('2026-10-19');
  });

  it.each([
    ['not json', 'not-json'],
    ['{"app":"other","schemaVersion":1,"data":{}}', 'not-dayly'],
    ['{"app":"dayly","schemaVersion":99,"data":{}}', 'too-new'],
    ['{"app":"dayly","schemaVersion":1,"data":{"tasks":[]}}', 'corrupt'],
  ])('rejects invalid file %#', (text, code) => {
    try {
      parseBackup(text);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(BackupError);
      expect((e as BackupError).code).toBe(code);
    }
  });
});
