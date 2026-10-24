import { describe, expect, it } from 'vitest';
import { emptyDay, type Task } from '../db/db';
import { getWeek } from '../lib/weeks';
import { monthStats, weekStats, type MonthData } from '../lib/stats';

const task = (id: string, date: string | null, done: boolean, weekKey = '2026-10-19'): Task => ({
  id,
  date,
  weekKey,
  kind: date ? 'todo' : 'selfcare',
  text: id,
  done,
  order: 0,
});

const data: MonthData = {
  tasks: [
    task('mon', '2026-10-19', true),
    task('fri', '2026-10-23', false),
    task('sat', '2026-10-24', false), // weekend
    task('care', null, true),
    task('prev', '2026-10-16', true, '2026-10-12'), // another week
  ],
  days: [{ ...emptyDay('2026-10-20'), priorities: [{ text: 'Focus', done: true }, { text: '', done: false }, { text: '', done: false }] }],
  events: [],
  achievements: [],
};

describe('weekStats', () => {
  it('counts Mon–Fri tasks, Self Care and priorities, but not the weekend', () => {
    const { tasks, progress } = weekStats(getWeek('2026-10-19'), data);
    expect(tasks.map((t) => t.id).sort()).toEqual(['care', 'fri', 'mon']);
    expect(progress).toEqual({ done: 3, total: 4, percent: 75 }); // mon, care, priority done; fri open
  });
});

describe('monthStats', () => {
  it('counts the whole calendar month, weekends included', () => {
    const { overall, doneDays } = monthStats('2026-10', data);
    expect(overall.total).toBe(6);
    expect(doneDays.has('2026-10-19')).toBe(true);
    expect(doneDays.has('2026-10-24')).toBe(false);
  });
});
