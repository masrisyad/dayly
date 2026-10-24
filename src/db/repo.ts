import { db, emptyDay, newId, type Day, type Task } from './db';
import { weekKeyOf } from '../lib/weeks';

export async function getDay(date: string): Promise<Day> {
  return (await db.days.get(date)) ?? emptyDay(date);
}

type DayPatch = Partial<Omit<Day, 'date'>>;

/**
 * Merges an update into a day, creating the row on first write. Pass a function to derive the
 * update from the stored row, so two quick edits (e.g. two schedule slots) can't overwrite each other.
 */
export async function patchDay(date: string, patch: DayPatch | ((current: Day) => DayPatch)): Promise<void> {
  await db.transaction('rw', db.days, async () => {
    const current = await getDay(date);
    const change = typeof patch === 'function' ? patch(current) : patch;
    await db.days.put({ ...current, ...change, date });
  });
}

export async function addTask(input: { date: string | null; weekKey?: string; kind: Task['kind']; text: string }) {
  const weekKey = input.weekKey ?? weekKeyOf(input.date!);
  const siblings = input.date
    ? await db.tasks.where('date').equals(input.date).toArray()
    : (await db.tasks.where('weekKey').equals(weekKey).toArray()).filter((t) => t.kind === input.kind);
  const order = siblings.reduce((max, t) => Math.max(max, t.order), -1) + 1;
  await db.tasks.add({ id: newId(), date: input.date, weekKey, kind: input.kind, text: input.text, done: false, order });
}

export const updateTask = (id: string, patch: Partial<Pick<Task, 'text' | 'done'>>) => db.tasks.update(id, patch);
export const deleteTask = (id: string) => db.tasks.delete(id);

export const byOrder = (a: Task, b: Task) => a.order - b.order;

export async function wipeAll(): Promise<void> {
  await db.transaction('rw', [db.profile, db.tasks, db.days, db.months, db.events], async () => {
    await Promise.all([db.profile.clear(), db.tasks.clear(), db.days.clear(), db.months.clear(), db.events.clear()]);
  });
}
