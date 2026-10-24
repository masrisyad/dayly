import { db, type Day, type Task } from '../db/db';
import { filledPriorities, progress, type Doneable } from './progress';

/** Everything a day contributes to progress: its tasks plus its filled-in priorities. */
export function dayItems(date: string, tasks: Task[], day: Day | undefined): Doneable[] {
  return [...tasks.filter((t) => t.date === date), ...filledPriorities(day?.priorities ?? [])];
}

export async function loadMonth(monthKey: string) {
  const [tasks, days, events, month] = await Promise.all([
    db.tasks.where('weekKey').startsWith(`${monthKey}-W`).toArray(),
    db.days.where('date').startsWith(`${monthKey}-`).toArray(),
    db.events.where('date').startsWith(`${monthKey}-`).sortBy('date'),
    db.months.get(monthKey),
  ]);
  return { tasks, days, events, achievements: month?.achievements ?? [] };
}

export type MonthData = Awaited<ReturnType<typeof loadMonth>>;

export function weekStats(dates: string[], weekKey: string, data: MonthData) {
  const daysByDate = new Map(data.days.map((d) => [d.date, d]));
  const tasks = data.tasks.filter((t) => t.weekKey === weekKey);
  const items: Doneable[] = [
    ...tasks,
    ...dates.flatMap((d) => filledPriorities(daysByDate.get(d)?.priorities ?? [])),
  ];
  return { tasks, progress: progress(items) };
}

export function monthStats(data: MonthData) {
  const daysByDate = new Map(data.days.map((d) => [d.date, d]));
  const allDates = new Set([...data.tasks.map((t) => t.date).filter((d): d is string => !!d), ...daysByDate.keys()]);
  const doneDays = new Set<string>();
  for (const date of allDates) {
    const items = dayItems(date, data.tasks, daysByDate.get(date));
    if (items.length && items.every((i) => i.done)) doneDays.add(date);
  }
  const items: Doneable[] = [...data.tasks, ...data.days.flatMap((d) => filledPriorities(d.priorities))];
  return { overall: progress(items), doneDays, eventDays: new Set(data.events.map((e) => e.date)) };
}
