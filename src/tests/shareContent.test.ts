import { describe, expect, it } from 'vitest';
import { emptyDay, type Day, type Task } from '../db/db';
import id from '../i18n/id';
import { getWeek } from '../lib/weeks';
import { buildDailyContent, buildWeeklyContent, DEFAULT_DAILY_SECTIONS, type DailySection, type ShareContext } from '../lib/shareContent';

const ctx: ShareContext = {
  t: id,
  date: (iso) => iso, // dates don't matter here
  owner: { name: 'Maya' },
  footer: 'Dayly · example.test',
};

const task = (id: string, date: string | null, done = false, order = 0): Task => ({
  id,
  date,
  weekKey: '2026-10-19',
  kind: date ? 'todo' : 'selfcare',
  text: id,
  done,
  order,
});

const day: Day = {
  ...emptyDay('2026-10-23'),
  priorities: [
    { text: 'Fokus', done: true },
    { text: '', done: false },
    { text: 'Gym', done: false },
  ],
  schedule: { '09': 'Sarapan', '12': '  ', '06': 'jam lama' },
  reminders: ['Bayar listrik'],
  water: 5,
  notes: 'Catatan pribadi',
};

describe('buildDailyContent', () => {
  it('uses the default sections and leaves private ones out', () => {
    const c = buildDailyContent(ctx, day, [task('b', '2026-10-23', false, 1), task('a', '2026-10-23', true, 0)], new Set(DEFAULT_DAILY_SECTIONS));
    expect(c.ownerLabel).toBe('Planner Maya');
    expect(c.sections.map((s) => s.title)).toEqual(['Prioritas Utama', 'Daftar Tugas', 'Jadwal', 'Pelacak Air']);
    // empty priority slots are skipped but keep their number
    expect(c.sections[0].lines).toEqual([
      { kind: 'numbered', n: 1, text: 'Fokus', done: true },
      { kind: 'numbered', n: 3, text: 'Gym', done: false },
    ]);
    expect(c.sections[1].lines?.map((l) => l.text)).toEqual(['a', 'b']); // task order
    // only filled hours inside 09–20
    expect(c.sections[2].lines).toEqual([{ kind: 'timed', time: '09:00', text: 'Sarapan' }]);
    expect(c.sections[3].water).toEqual({ value: 5, total: 8 });
    expect(c.progress?.percent).toBe(50); // tasks a ✓ b ✗ + priorities Fokus ✓ Gym ✗
  });

  it('adds reminders and notes only when chosen', () => {
    const all = new Set<DailySection>(['reminders', 'notes']);
    const c = buildDailyContent(ctx, day, [], all);
    expect(c.sections.map((s) => s.title)).toEqual(['Pengingat', 'Catatan']);
    expect(c.sections[1].paragraph).toBe('Catatan pribadi');
  });

  it('says so when there are no tasks', () => {
    const c = buildDailyContent(ctx, emptyDay('2026-10-23'), [], new Set<DailySection>(['todo', 'priorities', 'schedule']));
    expect(c.sections).toHaveLength(1);
    expect(c.sections[0].lines).toEqual([{ kind: 'muted', text: 'Belum ada tugas' }]);
  });
});

describe('buildWeeklyContent', () => {
  it('has Monday–Friday plus Self Care, highlighting today', () => {
    const tasks = [task('mon', '2026-10-19', true), task('care', null)];
    const c = buildWeeklyContent(ctx, getWeek('2026-10-19'), tasks, 50, 'Minggu 3', '2026-10-21');
    expect(c.sections).toHaveLength(6);
    expect(c.sections[0].lines).toEqual([{ kind: 'task', text: 'mon', done: true }]);
    expect(c.sections[1].lines).toEqual([{ kind: 'muted', text: 'Belum ada tugas' }]);
    expect(c.sections[2].highlight).toBe(true);
    expect(c.sections[5].title).toBe('Self Care');
    expect(c.progress).toEqual({ percent: 50, label: '50% selesai' });
  });
});
