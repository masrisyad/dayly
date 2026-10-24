import Dexie, { type EntityTable } from 'dexie';

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
  weekKey: string; // 'YYYY-MM-W1'..'W4'
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

export const SCHEDULE_HOURS = Array.from({ length: 17 }, (_, i) => String(i + 6).padStart(2, '0'));
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
