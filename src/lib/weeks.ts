import { addDays, daysInMonth, fromISODate, isoOf, monthKeyOf, parseMonthKey } from './dates';

/**
 * Dayly weeks are calendar work weeks: Monday–Friday.
 * A week is identified by its Monday ('YYYY-MM-DD') and belongs to the month its Monday falls in,
 * so "Week N of a month" is the week of that month's N-th Monday (4 or 5 weeks per month).
 * The Friday of a month's last week can spill into the next month (e.g. Mon 30 Nov – Fri 4 Dec).
 */
export interface Week {
  key: string; // Monday, 'YYYY-MM-DD'
  monthKey: string; // month of the Monday
  number: number; // 1–5 within monthKey
  dates: string[]; // Monday–Friday
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Monday of the week containing `iso`. Saturday and Sunday belong to the Monday before them. */
export function mondayOf(iso: string): string {
  const dow = fromISODate(iso).getDay(); // 0 = Sunday
  return addDays(iso, dow === 0 ? -6 : 1 - dow);
}

export const weekKeyOf = mondayOf;

export function isWeekday(iso: string): boolean {
  const dow = fromISODate(iso).getDay();
  return dow >= 1 && dow <= 5;
}

export function isWeekKey(key: string | undefined): key is string {
  return !!key && ISO_DATE.test(key) && fromISODate(key).getDay() === 1;
}

export function getWeek(key: string): Week {
  return {
    key,
    monthKey: monthKeyOf(key),
    number: Math.ceil(Number(key.slice(8, 10)) / 7),
    dates: [0, 1, 2, 3, 4].map((i) => addDays(key, i)),
  };
}

export function weeksOfMonth(monthKey: string): Week[] {
  const { year, month } = parseMonthKey(monthKey);
  const firstMonday = mondayOf(isoOf(year, month, 7)); // the 1st–7th always contains exactly one Monday
  const weeks: Week[] = [];
  for (let key = firstMonday; monthKeyOf(key) === monthKey; key = addDays(key, 7)) weeks.push(getWeek(key));
  return weeks;
}

export const shiftWeek = (key: string, delta: number) => addDays(key, delta * 7);

/** Last date covered by a month's weeks: the month's end, or a later Friday the last week spills into. */
export function monthCoverageEnd(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  const monthEnd = isoOf(year, month, daysInMonth(year, month));
  const lastFriday = weeksOfMonth(monthKey).at(-1)!.dates[4];
  return lastFriday > monthEnd ? lastFriday : monthEnd;
}

/* ---------- v1.0.0 compatibility ---------- */

// v1.0.0 split months into chunks: 'YYYY-MM-W1' = 1–7, W2 = 8–14, W3 = 15–21, W4 = 22–end.
const LEGACY_KEY = /^(\d{4}-\d{2})-W([1-4])$/;

/** Maps an old chunk key to the work week of the first Monday inside that chunk (same month, same number). */
export function legacyWeekKeyToMonday(key: string): string | null {
  const m = LEGACY_KEY.exec(key);
  if (!m) return null;
  const { year, month } = parseMonthKey(m[1]);
  return mondayOf(isoOf(year, month, Number(m[2]) * 7));
}

/** The week key a task should have under the Mon–Fri rules (used by the DB upgrade and old backups). */
export function migratedWeekKey(task: { date: string | null; weekKey: string }): string {
  if (task.date) return weekKeyOf(task.date);
  return legacyWeekKeyToMonday(task.weekKey) ?? task.weekKey;
}
