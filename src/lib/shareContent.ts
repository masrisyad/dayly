/** Turns Daily / Weekly data into the plain content the share-image renderer draws. */
import { SCHEDULE_HOURS, WATER_GLASSES, type Day, type Task } from '../db/db';
import type { Dict } from '../i18n/en';
import { fmt } from '../i18n';
import { byOrder } from '../db/repo';
import { monthKeyOf } from './dates';
import { progress } from './progress';
import { dayItems } from './stats';
import type { Week } from './weeks';
import type { AssetName } from './assets';
import type { ShareContent, ShareLine, ShareSection, Tone } from './shareImage';

type FormatDate = (iso: string, opts: Intl.DateTimeFormatOptions) => string;

export interface ShareContext {
  t: Dict;
  date: FormatDate;
  owner: { name: string; avatar?: string };
  footer: string;
}

export type DailySection = 'priorities' | 'todo' | 'schedule' | 'water' | 'reminders' | 'notes';
export const DAILY_SECTIONS: DailySection[] = ['priorities', 'todo', 'schedule', 'water', 'reminders', 'notes'];
/** Reminders and notes can be personal, so they are opt-in. */
export const DEFAULT_DAILY_SECTIONS: DailySection[] = ['priorities', 'todo', 'schedule', 'water'];

export const dailySectionLabel = (t: Dict, s: DailySection): string =>
  ({
    priorities: t.daily.priorities,
    todo: t.daily.todo,
    schedule: t.daily.schedule,
    water: t.daily.water,
    reminders: t.daily.reminders,
    notes: t.daily.notes,
  })[s];

const taskLines = (tasks: Task[], t: Dict): ShareLine[] =>
  tasks.length ? tasks.map((x) => ({ kind: 'task', text: x.text, done: x.done })) : [{ kind: 'muted', text: t.share.noTasks }];

function common(ctx: ShareContext): Pick<ShareContent, 'owner' | 'ownerLabel' | 'moreLabel' | 'footer'> {
  return {
    owner: ctx.owner,
    ownerLabel: fmt(ctx.t.share.plannerOf, { name: ctx.owner.name }),
    moreLabel: (n) => fmt(ctx.t.share.more, { n }),
    footer: ctx.footer,
  };
}

export function buildDailyContent(ctx: ShareContext, day: Day, tasks: Task[], include: ReadonlySet<DailySection>): ShareContent {
  const { t } = ctx;
  const [first, ...rest] = t.daily.title.split(' ');
  const p = progress(dayItems(day.date, tasks, day));
  const sections: ShareSection[] = [];

  const priorities = day.priorities.map((x, i) => ({ ...x, n: i + 1 })).filter((x) => x.text.trim());
  if (include.has('priorities') && priorities.length) {
    sections.push({
      title: t.daily.priorities,
      tone: 'pink',
      icon: 'heart',
      lines: priorities.map((x) => ({ kind: 'numbered', n: x.n, text: x.text, done: x.done })),
    });
  }
  if (include.has('todo')) {
    sections.push({ title: t.daily.todo, tone: 'mint', icon: 'daisy', lines: taskLines([...tasks].sort(byOrder), t) });
  }
  const scheduled = SCHEDULE_HOURS.filter((h) => day.schedule[h]?.trim());
  if (include.has('schedule') && scheduled.length) {
    sections.push({
      title: t.daily.schedule,
      tone: 'lavender',
      icon: 'clock',
      lines: scheduled.map((h) => ({ kind: 'timed', time: `${h}:00`, text: day.schedule[h] })),
    });
  }
  if (include.has('water')) {
    sections.push({ title: t.daily.water, tone: 'blue', icon: 'glass', water: { value: day.water, total: WATER_GLASSES } });
  }
  const reminders = day.reminders.filter((r) => r.trim());
  if (include.has('reminders') && reminders.length) {
    sections.push({ title: t.daily.reminders, tone: 'pink', icon: 'envelope', lines: reminders.map((text) => ({ kind: 'bullet', text })) });
  }
  if (include.has('notes') && day.notes.trim()) {
    sections.push({ title: t.daily.notes, tone: 'yellow', icon: 'flower', paragraph: day.notes.trim() });
  }

  return {
    ...common(ctx),
    title: [
      { text: first, color: 'pink' },
      { text: rest.join(' '), color: 'lavender' },
    ],
    subtitle: ctx.date(day.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    progress: { percent: p.percent, label: fmt(t.share.dayProgress, { n: p.percent }) },
    sections,
  };
}

// Same colours and icons as the Weekly page cards.
export const WEEKDAY_TONES: Tone[] = ['mint', 'pink', 'mint', 'pink', 'lavender'];
export const WEEKDAY_ICONS: AssetName[] = ['daisy', 'flower', 'daisy', 'flower', 'purple-flower'];

export function buildWeeklyContent(
  ctx: ShareContext,
  week: Week,
  tasks: Task[],
  weekProgress: number,
  subtitle: string,
  today: string,
): ShareContent {
  const { t } = ctx;
  const sections: ShareSection[] = week.dates.map((d, i) => ({
    title: ctx.date(d, monthKeyOf(d) === week.monthKey ? { weekday: 'long', day: 'numeric' } : { weekday: 'long', day: 'numeric', month: 'short' }),
    tone: WEEKDAY_TONES[i],
    icon: WEEKDAY_ICONS[i],
    highlight: d === today,
    lines: taskLines(tasks.filter((x) => x.date === d).sort(byOrder), t),
  }));
  sections.push({
    title: t.weekly.selfCare,
    tone: 'pink',
    icon: 'heart',
    lines: taskLines(tasks.filter((x) => x.kind === 'selfcare').sort(byOrder), t),
  });
  return {
    ...common(ctx),
    title: [{ text: t.weekly.title, color: 'pink' }],
    subtitle,
    progress: { percent: weekProgress, label: fmt(t.home.complete, { n: weekProgress }) },
    sections,
  };
}
