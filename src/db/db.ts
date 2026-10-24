import Dexie, { type EntityTable } from 'dexie';
import { migratedWeekKey } from '../lib/weeks';

export type Lang = 'id' | 'en';

export interface Profile {
  id: 'me';
  name: string;
  avatar?: string; // data URL
  pinHash?: string;
  pinSalt?: string;
  lang: Lang;
  createdAt: number;
}

export interface Task {
  id: string;
  /** Set for day tasks; null for weekly Self Care items. */
  date: string | null;
  weekKey: string; // Monday of the task's work week, 'YYYY-MM-DD' (see lib/weeks.ts)
  kind: 'todo' | 'selfcare';
  text: string;
  done: boolean;
  order: number;
}

export interface Priority {
  text: string;
  done: boolean;
}

export interface Day {
  date: string; // 'YYYY-MM-DD'
  priorities: Priority[]; // always 3
  schedule: Record<string, string>; // '06'..'22' -> text
  reminders: string[];
  water: number; // 0–8
  notes: string;
}

export interface Month {
  month: string; // 'YYYY-MM'
  achievements: string[];
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
}

/** 09:00–20:00. Entries saved for other hours by v1.0.0 stay in the data but are not shown. */
export const SCHEDULE_HOURS = Array.from({ length: 12 }, (_, i) => String(i + 9).padStart(2, '0'));
export const WATER_GLASSES = 8;

export class DaylyDB extends Dexie {
  profile!: EntityTable<Profile, 'id'>;
  tasks!: EntityTable<Task, 'id'>;
  days!: EntityTable<Day, 'date'>;
  months!: EntityTable<Month, 'month'>;
  events!: EntityTable<CalendarEvent, 'id'>;

  constructor(name = 'dayly') {
    super(name);
    this.version(1).stores({
      profile: 'id',
      tasks: 'id, date, weekKey',
      days: 'date',
      months: 'month',
      events: 'id, date',
    });
    // v1.1.0: weeks changed from month chunks ('YYYY-MM-W1') to Mon–Fri work weeks keyed by their Monday.
    this.version(2)
      .stores({})
      .upgrade((tx) =>
        tx
          .table<Task>('tasks')
          .toCollection()
          .modify((task) => {
            task.weekKey = migratedWeekKey(task);
          }),
      );
  }
}

export const db = new DaylyDB();

export const newId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function emptyDay(date: string): Day {
  return {
    date,
    priorities: [
      { text: '', done: false },
      { text: '', done: false },
      { text: '', done: false },
    ],
    schedule: {},
    reminders: [],
    water: 0,
    notes: '',
  };
}
