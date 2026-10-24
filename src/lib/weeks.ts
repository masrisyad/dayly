import { daysInMonth, isoOf, monthKeyOf, parseMonthKey } from './dates';

/**
 * Dayly splits every month into four chunks instead of calendar weeks:
 * W1 = 1–7, W2 = 8–14, W3 = 15–21, W4 = 22–end of month.
 */
export type WeekNo = 1 | 2 | 3 | 4;

export interface WeekChunk {
  key: string; // 'YYYY-MM-W1'
  monthKey: string; // 'YYYY-MM'
  week: WeekNo;
  startDay: number;
  endDay: number;
  dates: string[]; // ISO dates in the chunk
}

export const WEEK_STARTS = [1, 8, 15, 22] as const;

export function weekNoOfDay(day: number): WeekNo {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

export function weekKey(monthKey: string, week: WeekNo): string {
  return `${monthKey}-W${week}`;
}

export function weekKeyOf(iso: string): string {
  return weekKey(monthKeyOf(iso), weekNoOfDay(Number(iso.slice(8, 10))));
}

export function parseWeekKey(key: string): { monthKey: string; week: WeekNo } {
  const m = /^(\d{4}-\d{2})-W([1-4])$/.exec(key);
  if (!m) throw new Error(`Invalid week key: ${key}`);
  return { monthKey: m[1], week: Number(m[2]) as WeekNo };
}

export function getWeekChunk(monthKey: string, week: WeekNo): WeekChunk {
  const { year, month } = parseMonthKey(monthKey);
  const startDay = WEEK_STARTS[week - 1];
  const endDay = week === 4 ? daysInMonth(year, month) : startDay + 6;
  const dates: string[] = [];
  for (let d = startDay; d <= endDay; d++) dates.push(isoOf(year, month, d));
  return { key: weekKey(monthKey, week), monthKey, week, startDay, endDay, dates };
}

export function getWeekChunks(monthKey: string): WeekChunk[] {
  return ([1, 2, 3, 4] as WeekNo[]).map((w) => getWeekChunk(monthKey, w));
}
