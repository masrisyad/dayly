import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { db, SCHEDULE_HOURS, type Day } from '../db/db';
import { addTask, byOrder, getDay, patchDay } from '../db/repo';
import { fmt, useI18n } from '../i18n';
import { addDays, todayISO } from '../lib/dates';
import { asset } from '../lib/assets';
import { Card, Deco } from '../components/Card';
import { HeartCheck, NumberHeart } from '../components/HeartCheck';
import { LineField } from '../components/LineField';
import { StringList, TaskList } from '../components/TaskList';
import { WaterTracker } from '../components/WaterTracker';

const isISODate = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export default function Daily() {
  const { t, date: fmtDate } = useI18n();
  const params = useParams();
  const navigate = useNavigate();
  const today = todayISO();
  const date = isISODate(params.date) ? params.date : today;
  const go = (iso: string) => navigate(iso === today ? '/daily' : `/daily/${iso}`, { replace: true });

  const day = useLiveQuery(() => getDay(date), [date]);
  const tasks = useLiveQuery(() => db.tasks.where('date').equals(date).toArray().then((ts) => ts.sort(byOrder)), [date]);
  const patch = (p: Partial<Omit<Day, 'date'>>) => patchDay(date, p);

  if (!day || !tasks) return null;

  const setPriority = (i: number, change: Partial<Day['priorities'][number]>) =>
    patchDay(date, (cur) => ({ priorities: cur.priorities.map((p, j) => (j === i ? { ...p, ...change } : p)) }));

  return (
    <div className="sheet daily">
      {/* Header: "My Daily Planner" + date sticky note */}
      <header className="daily__header">
        <Deco name="plant" size={58} style={{ left: -2, top: -6 }} />
        <div className="daily__title">
          <div className="planner-title">
            <span className="my-tag">{t.daily.my}</span>
            <span className="bubble-text bubble-pink daily__word">{t.daily.title.split(' ')[0]}</span>
          </div>
          <span className="bubble-text bubble-lavender daily__word">{t.daily.title.split(' ').slice(1).join(' ')}</span>
          <p className="tagline">{t.tagline} ✨</p>
        </div>
        <label className="date-note" style={{ backgroundImage: `url(${asset('sticky-note')})` }}>
          <span className="date-note__label">{t.daily.date}:</span>
          <span className="date-note__day">{fmtDate(date, { day: 'numeric' })}</span>
          <span className="date-note__rest">{fmtDate(date, { month: 'short', year: 'numeric' })}</span>
          <input
            type="date"
            className="date-note__input"
            value={date}
            aria-label={t.daily.date}
            onChange={(e) => isISODate(e.target.value) && go(e.target.value)}
          />
        </label>
      </header>

      <div className="day-nav">
        <button type="button" className="btn btn--ghost day-nav__arrow" aria-label={t.common.prev} onClick={() => go(addDays(date, -1))}>
          ‹
        </button>
        <span className="day-nav__label">{fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <button type="button" className="btn btn--ghost day-nav__arrow" aria-label={t.common.next} onClick={() => go(addDays(date, 1))}>
          ›
        </button>
        {date !== today && (
          <button type="button" className="btn btn--mint day-nav__today" onClick={() => go(today)}>
            {t.common.today}
          </button>
        )}
      </div>

      {/* Keyed by date so fields remount (and flush unsaved drafts to the right day) when the date changes. */}
      <div className="daily__grid" key={date}>
        <div className="stack">
          <Card label={t.daily.priorities} labelTone="pink" labelIcon="heart">
            <Deco name="star-pink" size={26} style={{ right: 46, bottom: 34 }} />
            <Deco name="bear" size={62} style={{ right: -10, bottom: -18 }} />
            {day.priorities.map((p, i) => (
              <div className="line" key={i}>
                <NumberHeart n={i + 1} />
                <LineField
                  value={p.text}
                  className={p.done ? 'is-done' : ''}
                  placeholder={fmt(t.daily.priorityPlaceholder, { n: i + 1 })}
                  onCommit={(text) => setPriority(i, { text })}
                />
                {p.text.trim() && <HeartCheck checked={p.done} onChange={(done) => setPriority(i, { done })} label={p.text} />}
              </div>
            ))}
            <div style={{ height: 22 }} />
          </Card>

          <Card label={t.daily.schedule} labelTone="lavender" labelIcon="clock">
            <div className="focus-note" aria-hidden="true">
              {t.daily.focus}
            </div>
            <div className="schedule">
              {SCHEDULE_HOURS.map((h) => (
                <div className="line" key={h}>
                  <span className="schedule__time">{h}:00</span>
                  <LineField
                    value={day.schedule[h] ?? ''}
                    ariaLabel={`${h}:00`}
                    onCommit={(text) => patchDay(date, (cur) => ({ schedule: { ...cur.schedule, [h]: text } }))}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card label={t.daily.todo} labelTone="mint" labelIcon="daisy">
            <span className="speech">{t.daily.oneTask}</span>
            <Deco name="star" size={44} style={{ right: -8, bottom: -14 }} />
            <TaskList tasks={tasks} minRows={5} onAdd={(text) => addTask({ date, kind: 'todo', text })} />
          </Card>

          <Card tone="pink" label={t.daily.reminders} labelTone="pink" labelIcon="heart">
            <Deco name="pin" size={40} style={{ right: 4, top: -18 }} />
            <StringList items={day.reminders} placeholder={t.daily.reminderPlaceholder} onChange={(reminders) => patch({ reminders })} />
            <img src={asset('envelope')} alt="" className="reminders__envelope" />
          </Card>

          <Card label={t.daily.water} labelTone="blue" labelIcon="glass">
            <WaterTracker value={day.water} onChange={(water) => patch({ water })} />
          </Card>

          <Card tone="yellow" label={t.daily.notes} labelTone="yellow" labelIcon="flower">
            <Deco name="tulip" size={64} style={{ right: -6, bottom: -14 }} />
            <LineField
              multiline
              rows={5}
              className="notes"
              value={day.notes}
              placeholder={t.daily.notesPlaceholder}
              onCommit={(notes) => patch({ notes })}
            />
          </Card>
        </div>
      </div>

      <p className="footer-quote">
        <img src={asset('heart')} alt="" width={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />
        {t.footer} ☺
      </p>
    </div>
  );
}
