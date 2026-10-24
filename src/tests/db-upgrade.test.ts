import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { expect, it } from 'vitest';
import { DaylyDB } from '../db/db';

it('upgrades v1.0.0 month-chunk week keys to Mon–Fri week keys', async () => {
  const name = 'dayly-upgrade-test';
  // A database as v1.0.0 left it.
  const old = new Dexie(name);
  old.version(1).stores({ profile: 'id', tasks: 'id, date, weekKey', days: 'date', months: 'month', events: 'id, date' });
  await old.table('tasks').bulkAdd([
    { id: 'todo', date: '2026-10-22', weekKey: '2026-10-W4', kind: 'todo', text: 'a', done: false, order: 0 },
    { id: 'care', date: null, weekKey: '2026-10-W2', kind: 'selfcare', text: 'b', done: true, order: 0 },
  ]);
  old.close();

  const db = new DaylyDB(name);
  expect((await db.tasks.get('todo'))?.weekKey).toBe('2026-10-19');
  expect((await db.tasks.get('care'))?.weekKey).toBe('2026-10-12');
  expect(await db.tasks.where('weekKey').equals('2026-10-12').count()).toBe(1);
  db.close();
});
