import { db, type Day, type Task } from '../db/db';
import { daysInMonth, isoOf, parseMonthKey } from './dates';
import { filledPriorities, progress, type Doneable } from './progress';
import { monthCoverageEnd, weeksOfMonth, type Week } from './weeks';

/** Everything a day contributes to progress: its tasks plus its filled-in priorities. */
export function dayItems(date: string, tasks: Task[], day: Day | undefined): Doneable[] {
  return [...tasks.filter((t) => t.date === date), ...filledPriorities(day?.priorities ?? [])];
}

/**
 * Data for a month's Home view and for any of its weeks: the calendar month plus the days its last
 * work week spills into, and the Self Care items of its weeks.
 */
export async function loadMonth(monthKey: string) {
  const weekKeys = weeksOfMonth(monthKey).map((w) => w.key);
  const from = `${monthKey}-01`;
  const to = monthCoverageEnd(monthKey);
  const [dated, weekly, days, events, month] = await Promise.all([
    db.tasks.where('date').between(from, to, true, true).toArray(),
    db.tasks.where('weekKey').anyOf(weekKeys).toArray(),
    db.days.where('date').between(from, to, true, true).toArray(),
    db.events.where('date').startsWith(`${monthKey}-`).sortBy('date'),
    db.months.get(monthKey),
  ]);
  const selfCare = weekly.filter((t) => t.kind === 'selfcare');
  return { tasks: [...dated, ...selfCare], days, events, achievements: month?.achievements ?? [] };
}

export type MonthData = Awaited<ReturnType<typeof loadMonth>>;

/** A work week's tasks (Mon–Fri + its Self Care) and progress; weekend tasks are left out. */
export function weekStats(week: Week, data: MonthData) {
  const dates = new Set(week.dates);
  const daysByDate = new Map(data.days.map((d) => [d.date, d]));
  const tasks = data.tasks.filter((t) => (t.date ? dates.has(t.date) : t.weekKey === week.key));
  const items: Doneable[] = [...tasks, ...week.dates.flatMap((d) => filledPriorities(daysByDate.get(d)?.priorities ?? []))];
  return { tasks, progress: progress(items) };
}

/** Month totals use the calendar month only (weekends included), plus the Self Care of the month's weeks. */
export function monthStats(monthKey: string, data: MonthData) {
  const { year, month } = parseMonthKey(monthKey);
  const from = `${monthKey}-01`;
  const to = isoOf(year, month, daysInMonth(year, month));
  const inMonth = (d: string) => d >= from && d <= to;
  const tasks = data.tasks.filter((t) => (t.date ? inMonth(t.date) : true));
  const days = data.days.filter((d) => inMonth(d.date));
  const daysByDate = new Map(days.map((d) => [d.date, d]));

  const allDates = new Set([...tasks.map((t) => t.date).filter((d): d is string => !!d), ...daysByDate.keys()]);
  const doneDays = new Set<string>();
  for (const date of allDates) {
    const items = dayItems(date, tasks, daysByDate.get(date));
    if (items.length && items.every((i) => i.done)) doneDays.add(date);
  }
  const items: Doneable[] = [...tasks, ...days.flatMap((d) => filledPriorities(d.priorities))];
  return { overall: progress(items), doneDays, eventDays: new Set(data.events.map((e) => e.date)) };
}
