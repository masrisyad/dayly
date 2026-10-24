import { describe, expect, it } from 'vitest';
import { getWeekChunk, getWeekChunks, parseWeekKey, weekKeyOf, weekNoOfDay } from '../lib/weeks';
import { addDays, addMonths } from '../lib/dates';

describe('month chunks', () => {
  it('splits a 31-day month into 1–7, 8–14, 15–21, 22–31', () => {
    const chunks = getWeekChunks('2026-10');
    expect(chunks.map((c) => [c.startDay, c.endDay])).toEqual([
      [1, 7],
      [8, 14],
      [15, 21],
      [22, 31],
    ]);
    expect(chunks[3].dates).toHaveLength(10);
    expect(chunks[0].dates[0]).toBe('2026-10-01');
  });

  it('handles February in common and leap years', () => {
    expect(getWeekChunk('2026-02', 4).endDay).toBe(28);
    expect(getWeekChunk('2028-02', 4).endDay).toBe(29);
    expect(getWeekChunk('2026-02', 4).dates).toHaveLength(7);
  });

  it('maps a date to its week key', () => {
    expect(weekNoOfDay(7)).toBe(1);
    expect(weekNoOfDay(8)).toBe(2);
    expect(weekNoOfDay(31)).toBe(4);
    expect(weekKeyOf('2026-10-24')).toBe('2026-10-W4');
    expect(weekKeyOf('2026-10-15')).toBe('2026-10-W3');
    expect(parseWeekKey('2026-10-W2')).toEqual({ monthKey: '2026-10', week: 2 });
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
