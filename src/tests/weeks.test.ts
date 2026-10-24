import { describe, expect, it } from 'vitest';
import {
  getWeek,
  isWeekKey,
  isWeekday,
  legacyWeekKeyToMonday,
  migratedWeekKey,
  mondayOf,
  monthCoverageEnd,
  shiftWeek,
  weeksOfMonth,
} from '../lib/weeks';
import { addDays, addMonths } from '../lib/dates';

describe('Mon–Fri work weeks', () => {
  it('finds the Monday of any day, with the weekend belonging to the Monday before', () => {
    expect(mondayOf('2026-10-19')).toBe('2026-10-19'); // Monday
    expect(mondayOf('2026-10-23')).toBe('2026-10-19'); // Friday
    expect(mondayOf('2026-10-24')).toBe('2026-10-19'); // Saturday
    expect(mondayOf('2026-10-25')).toBe('2026-10-19'); // Sunday
    expect(mondayOf('2026-10-01')).toBe('2026-09-28'); // crosses the month
  });

  it('builds a week of exactly Monday–Friday', () => {
    expect(getWeek('2026-10-19')).toEqual({
      key: '2026-10-19',
      monthKey: '2026-10',
      number: 3,
      dates: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'],
    });
  });

  it('gives a month the weeks whose Monday falls in it (4 or 5)', () => {
    expect(weeksOfMonth('2026-10').map((w) => [w.number, w.key])).toEqual([
      [1, '2026-10-05'],
      [2, '2026-10-12'],
      [3, '2026-10-19'],
      [4, '2026-10-26'],
    ]);
    const nov = weeksOfMonth('2026-11');
    expect(nov.map((w) => w.key)).toEqual(['2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30']);
    expect(nov[4].dates.at(-1)).toBe('2026-12-04'); // last week spills into December
    expect(weeksOfMonth('2027-02').map((w) => w.key)).toEqual(['2027-02-01', '2027-02-08', '2027-02-15', '2027-02-22']);
  });

  it('knows how far a month reaches', () => {
    expect(monthCoverageEnd('2026-10')).toBe('2026-10-31');
    expect(monthCoverageEnd('2026-11')).toBe('2026-12-04');
  });

  it('validates keys and weekdays', () => {
    expect(isWeekKey('2026-10-19')).toBe(true);
    expect(isWeekKey('2026-10-20')).toBe(false); // Tuesday
    expect(isWeekKey('2026-10-W3')).toBe(false);
    expect(isWeekday('2026-10-23')).toBe(true);
    expect(isWeekday('2026-10-24')).toBe(false);
    expect(shiftWeek('2026-10-26', 1)).toBe('2026-11-02');
  });
});

describe('v1.0.0 week keys', () => {
  it('maps month chunks to the Monday inside them', () => {
    expect(legacyWeekKeyToMonday('2026-10-W1')).toBe('2026-10-05');
    expect(legacyWeekKeyToMonday('2026-10-W4')).toBe('2026-10-26');
    expect(legacyWeekKeyToMonday('2026-11-W1')).toBe('2026-11-02');
    expect(legacyWeekKeyToMonday('2026-10-19')).toBeNull();
  });

  it('re-keys tasks by date, or Self Care by chunk', () => {
    expect(migratedWeekKey({ date: '2026-10-01', weekKey: '2026-10-W1' })).toBe('2026-09-28');
    expect(migratedWeekKey({ date: null, weekKey: '2026-10-W3' })).toBe('2026-10-19');
    expect(migratedWeekKey({ date: null, weekKey: '2026-10-19' })).toBe('2026-10-19');
  });
});

describe('date helpers', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });
});
