import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { addTask, byOrder } from '../db/repo';
import { fmt, useI18n } from '../i18n';
import { addMonths, todayISO } from '../lib/dates';
import { getWeekChunk, parseWeekKey, weekKey, weekKeyOf, type WeekNo } from '../lib/weeks';
import { loadMonth, weekStats } from '../lib/stats';
import { type AssetName } from '../lib/assets';
import { Card, Deco } from '../components/Card';
import { ProgressBar } from '../components/Progress';
import { TaskList } from '../components/TaskList';

const LABEL_TONES = ['lavender', 'pink', 'mint', 'pink', 'mint', 'pink', 'lavender', 'yellow', 'blue', 'pink', 'mint'] as const;
const LABEL_ICONS: AssetName[] = ['daisy', 'flower', 'purple-flower', 'heart'];
const CORNER_DECOS: (AssetName | null)[] = [null, 'plant', null, 'tulip', null, 'star', null, 'bear', null, 'purple-flower', null];

function shiftWeek(key: string, delta: 1 | -1): string {
  const { monthKey, week } = parseWeekKey(key);
  const next = week + delta;
  if (next < 1) return weekKey(addMonths(monthKey, -1), 4);
  if (next > 4) return weekKey(addMonths(monthKey, 1), 1);
  return weekKey(monthKey, next as WeekNo);
}

export default function Weekly() {
  const { t, date: fmtDate } = useI18n();
  const navigate = useNavigate();
  const params = useParams();
  const today = todayISO();
  const currentKey = weekKeyOf(today);
  const key = params.week && /^\d{4}-\d{2}-W[1-4]$/.test(params.week) ? params.week : currentKey;
  const { monthKey, week } = parseWeekKey(key);
  const chunk = getWeekChunk(monthKey, week);
  const go = (k: string) => navigate(k === currentKey ? '/weekly' : `/weekly/${k}`, { replace: true });

  const data = useLiveQuery(() => loadMonth(monthKey), [monthKey]);
  if (!data) return null;

  const { tasks, progress } = weekStats(chunk.dates, key, data);
  const byDate = (d: string) => tasks.filter((t) => t.date === d).sort(byOrder);
  const selfCare = tasks.filter((t) => t.kind === 'selfcare').sort(byOrder);
  const rangeLabel = `${fmtDate(chunk.dates[0], { day: 'numeric' })}–${fmtDate(chunk.dates.at(-1)!, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="sheet weekly">
      <header className="weekly__header">
        <Deco name="tulip" size={70} style={{ left: -4, top: 0 }} />
        <Deco name="books" size={72} style={{ right: -6, top: 52 }} />
        <span className="weekly__note" aria-hidden="true">
          {t.weekly.note}
        </span>
        <h1 className="bubble-text bubble-pink weekly__title">{t.weekly.title}</h1>
        <p className="weekly__subtitle">{t.weekly.subtitle}</p>
        <p className="weekly__tagline">{t.weekly.tagline}</p>
      </header>

      <div className="day-nav">
        <button type="button" className="btn btn--ghost day-nav__arrow" aria-label={t.common.prev} onClick={() => go(shiftWeek(key, -1))}>
          ‹
        </button>
        <span className="day-nav__label">
          <strong>{fmt(t.weekly.week, { n: week })}</strong> · {rangeLabel}
        </span>
        <button type="button" className="btn btn--ghost day-nav__arrow" aria-label={t.common.next} onClick={() => go(shiftWeek(key, 1))}>
          ›
        </button>
        {key !== currentKey && (
          <button type="button" className="btn btn--mint day-nav__today" onClick={() => go(currentKey)}>
            {t.common.today}
          </button>
        )}
      </div>
      <ProgressBar percent={progress.percent} label={fmt(t.home.complete, { n: progress.percent })} />

      <div className="grid-2 collapse-sm" style={{ marginTop: 34 }}>
        {chunk.dates.map((d, i) => {
          const deco = CORNER_DECOS[i];
          return (
            <Card
              key={d}
              tone={d === today ? 'active' : 'cream'}
              labelTone={LABEL_TONES[i]}
              labelIcon={LABEL_ICONS[i % LABEL_ICONS.length]}
              label={fmtDate(d, { weekday: 'long', day: 'numeric' })}
            >
              {deco && <Deco name={deco} size={40} style={{ right: -6, bottom: -10 }} />}
              <TaskList tasks={byDate(d)} minRows={3} onAdd={(text) => addTask({ date: d, kind: 'todo', text })} />
            </Card>
          );
        })}
        <Card tone="pink" label={t.weekly.selfCare} labelTone="pink" labelIcon="heart" className="weekly__selfcare">
          <Deco name="envelope" size={44} style={{ right: -4, bottom: -12 }} />
          <TaskList tasks={selfCare} minRows={3} onAdd={(text) => addTask({ date: null, weekKey: key, kind: 'selfcare', text })} />
        </Card>
      </div>
    </div>
  );
}
