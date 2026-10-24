import { useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { addTask, byOrder } from '../db/repo';
import { fmt, useI18n } from '../i18n';
import { monthKeyOf, todayISO } from '../lib/dates';
import { getWeek, isWeekKey, legacyWeekKeyToMonday, shiftWeek, weekKeyOf } from '../lib/weeks';
import { loadMonth, weekStats } from '../lib/stats';
import { type AssetName } from '../lib/assets';
import { Card, Deco } from '../components/Card';
import { ProgressBar } from '../components/Progress';
import { TaskList } from '../components/TaskList';
import { ShareButton, ShareSheet } from '../components/ShareSheet';
import { buildWeeklyContent, WEEKDAY_ICONS, WEEKDAY_TONES } from '../lib/shareContent';

const CORNER_DECOS: (AssetName | null)[] = ['plant', null, 'tulip', null, 'star'];

/** Accepts a Monday key, or an old v1.0.0 'YYYY-MM-W1' link; anything else falls back to this week. */
function resolveWeekKey(param: string | undefined, fallback: string): string {
  if (isWeekKey(param)) return param;
  return (param && legacyWeekKeyToMonday(param)) || fallback;
}

export default function Weekly() {
  const { t, date: fmtDate } = useI18n();
  const navigate = useNavigate();
  const params = useParams();
  const today = todayISO();
  const currentKey = weekKeyOf(today);
  const week = getWeek(resolveWeekKey(params.week, currentKey));
  const go = (k: string) => navigate(k === currentKey ? '/weekly' : `/weekly/${k}`, { replace: true });

  const [sharing, setSharing] = useState(false);
  const closeShare = useCallback(() => setSharing(false), []);
  const data = useLiveQuery(() => loadMonth(week.monthKey), [week.monthKey]);
  if (!data) return null;

  const { tasks, progress } = weekStats(week, data);
  const byDate = (d: string) => tasks.filter((t) => t.date === d).sort(byOrder);
  const selfCare = tasks.filter((t) => t.kind === 'selfcare').sort(byOrder);
  const [mon, fri] = [week.dates[0], week.dates[4]];
  const rangeLabel =
    monthKeyOf(mon) === monthKeyOf(fri)
      ? `${fmtDate(mon, { day: 'numeric' })}–${fmtDate(fri, { day: 'numeric', month: 'short', year: 'numeric' })}`
      : `${fmtDate(mon, { day: 'numeric', month: 'short' })} – ${fmtDate(fri, { day: 'numeric', month: 'short', year: 'numeric' })}`;

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
        <button type="button" className="btn btn--ghost day-nav__arrow" aria-label={t.common.prev} onClick={() => go(shiftWeek(week.key, -1))}>
          ‹
        </button>
        <span className="day-nav__label">
          <strong>
            {fmt(t.weekly.week, { n: week.number })} · {fmtDate(mon, { month: 'long' })}
          </strong>
          <br />
          {rangeLabel}
        </span>
        <button type="button" className="btn btn--ghost day-nav__arrow" aria-label={t.common.next} onClick={() => go(shiftWeek(week.key, 1))}>
          ›
        </button>
        {week.key !== currentKey && (
          <button type="button" className="btn btn--mint day-nav__today" onClick={() => go(currentKey)}>
            {t.common.today}
          </button>
        )}
      </div>
      <div className="share-row">
        <ShareButton onClick={() => setSharing(true)} />
      </div>
      <ProgressBar percent={progress.percent} label={fmt(t.home.complete, { n: progress.percent })} />
      {sharing && (
        <ShareSheet
          build={(ctx) =>
            buildWeeklyContent(
              ctx,
              week,
              tasks,
              progress.percent,
              `${fmt(t.weekly.week, { n: week.number })} · ${fmtDate(mon, { month: 'long' })} · ${rangeLabel}`,
              today,
            )
          }
          fileBase={`dayly-week-${week.key}`}
          onClose={closeShare}
        />
      )}

      <div className="grid-2 collapse-sm" style={{ marginTop: 34 }}>
        {week.dates.map((d, i) => {
          const deco = CORNER_DECOS[i];
          // Name the month on a Friday that spills into the next month.
          const label = fmtDate(d, monthKeyOf(d) === week.monthKey ? { weekday: 'long', day: 'numeric' } : { weekday: 'long', day: 'numeric', month: 'short' });
          return (
            <Card key={d} tone={d === today ? 'active' : 'cream'} labelTone={WEEKDAY_TONES[i]} labelIcon={WEEKDAY_ICONS[i]} label={label}>
              {deco && <Deco name={deco} size={40} style={{ right: -6, bottom: -10 }} />}
              <TaskList tasks={byDate(d)} minRows={3} onAdd={(text) => addTask({ date: d, kind: 'todo', text })} />
            </Card>
          );
        })}
        <Card tone="pink" label={t.weekly.selfCare} labelTone="pink" labelIcon="heart">
          <Deco name="envelope" size={44} style={{ right: -4, bottom: -12 }} />
          <TaskList tasks={selfCare} minRows={3} onAdd={(text) => addTask({ date: null, weekKey: week.key, kind: 'selfcare', text })} />
        </Card>
      </div>
    </div>
  );
}
