import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db, newId, type Profile } from '../db/db';
import { byOrder, getDay, patchDay, updateTask } from '../db/repo';
import { fmt, useI18n } from '../i18n';
import { addMonths, monthKeyOf, todayISO } from '../lib/dates';
import { filledPriorities, progress } from '../lib/progress';
import { getWeekChunks, weekKeyOf } from '../lib/weeks';
import { loadMonth, monthStats, weekStats } from '../lib/stats';
import { asset, type AssetName } from '../lib/assets';
import { Avatar } from '../components/Avatar';
import { Card, Deco } from '../components/Card';
import { HeartCheck } from '../components/HeartCheck';
import { MiniCalendar } from '../components/MiniCalendar';
import { ProgressBar, ProgressRing } from '../components/Progress';
import { CrossIcon, StringList } from '../components/TaskList';
import { InstallBanner } from '../components/InstallBanner';

const QUICK_HOURS = [
  ['08', '09', '10', '11'],
  ['13', '14', '15', '16'],
];
const WEEK_DECOS: AssetName[] = ['plant', 'purple-flower', 'bear', 'tulip'];
const WEEK_TONES = ['pink', 'lavender', 'mint', 'yellow'] as const;

function greetingKey(hour: number) {
  if (hour < 11) return 'morning';
  if (hour < 15) return 'afternoon';
  if (hour < 19) return 'evening';
  return 'night';
}

export default function Home({ profile }: { profile: Profile }) {
  const { t, date: fmtDate } = useI18n();
  const navigate = useNavigate();
  const today = todayISO();
  const [monthKey, setMonthKey] = useState(monthKeyOf(today));

  const todayDay = useLiveQuery(() => getDay(today), [today]);
  const data = useLiveQuery(() => loadMonth(monthKey), [monthKey]);
  if (!todayDay || !data) return null;

  const priorities = filledPriorities(todayDay.priorities);
  const top3 = progress(priorities);
  const month = monthStats(data);
  const activeWeek = weekKeyOf(today);

  return (
    <div className="stack home">
      <header className="home__header">
        <Deco name="purple-flower" size={34} style={{ right: 0, top: -6 }} />
        <Avatar src={profile.avatar} size={86} />
        <div style={{ minWidth: 0 }}>
          <h1 className="home__greeting">
            {fmt(t.greeting[greetingKey(new Date().getHours())], { name: profile.name })} <span aria-hidden="true">☀️</span>
          </h1>
          <p className="home__sub">{t.greeting.sub}</p>
          <div className="month-picker">
            <button type="button" aria-label={t.common.prev} onClick={() => setMonthKey(addMonths(monthKey, -1))}>
              ‹
            </button>
            <span>{fmtDate(`${monthKey}-01`, { month: 'long', year: 'numeric' })}</span>
            <button type="button" aria-label={t.common.next} onClick={() => setMonthKey(addMonths(monthKey, 1))}>
              ›
            </button>
          </div>
        </div>
      </header>

      <InstallBanner />

      <Card label={t.home.quickView} labelTone="lavender" labelIcon="clock" onClick={() => navigate('/daily')}>
        <div className="quick">
          <div className="quick__slots">
            {QUICK_HOURS.map((col, i) => (
              <div key={i} className="quick__col">
                {col.map((h) => (
                  <div key={h} className="quick__slot">
                    <span>{Number(h)}:00</span>
                    <span className="quick__text">{todayDay.schedule[h] ?? ''}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="quick__top3">
            <h3 className="quick__title">
              {t.home.top3}
              <img src={asset('bear')} alt="" />
            </h3>
            {priorities.length === 0 ? (
              <p className="muted" style={{ margin: '6px 0' }}>
                {t.home.top3Empty}
              </p>
            ) : (
              todayDay.priorities.map((p, i) =>
                p.text.trim() ? (
                  <div className="line" key={i}>
                    <HeartCheck
                      checked={p.done}
                      label={p.text}
                      onChange={(done) =>
                        patchDay(today, (cur) => ({ priorities: cur.priorities.map((x, j) => (j === i ? { ...x, done } : x)) }))
                      }
                    />
                    <span className={`line-input ${p.done ? 'is-done' : ''}`}>{p.text}</span>
                  </div>
                ) : null,
              )
            )}
            <ProgressBar percent={top3.percent} label={fmt(t.home.completed, { n: top3.percent })} />
          </div>
        </div>
      </Card>

      <div className="grid-2">
        {getWeekChunks(monthKey).map((chunk, i) => {
          const { tasks, progress: p } = weekStats(chunk.dates, chunk.key, data);
          const preview = [...tasks].sort((a, b) => (a.date ?? '9').localeCompare(b.date ?? '9') || byOrder(a, b)).slice(0, 3);
          const active = chunk.key === activeWeek;
          return (
            <Card
              key={chunk.key}
              tone={active ? 'active' : 'cream'}
              labelTone={WEEK_TONES[i]}
              label={
                <>
                  {fmt(t.home.weekly, { n: chunk.week })}
                  {active && <span className="badge">{t.home.active} ♥</span>}
                </>
              }
              onClick={() => navigate(`/weekly/${chunk.key}`)}
            >
              <Deco name={WEEK_DECOS[i]} size={40} style={{ right: -6, top: 22 }} />
              <p className="week-card__range">
                {fmtDate(chunk.dates[0], { day: 'numeric', month: 'short' })} – {fmtDate(chunk.dates.at(-1)!, { day: 'numeric' })}
              </p>
              {Array.from({ length: 3 }, (_, j) => {
                const task = preview[j];
                return (
                  <div className="line line--compact" key={task?.id ?? j}>
                    {task ? (
                      <>
                        <HeartCheck checked={task.done} label={task.text} onChange={(done) => updateTask(task.id, { done })} />
                        <span className={`line-input ${task.done ? 'is-done' : ''}`}>{task.text}</span>
                      </>
                    ) : (
                      <HeartCheck checked={false} label="" onChange={() => navigate(`/weekly/${chunk.key}`)} />
                    )}
                  </div>
                );
              })}
              <ProgressBar percent={p.percent} label={fmt(t.home.complete, { n: p.percent })} />
            </Card>
          );
        })}
      </div>

      <Card label={t.home.monthly} labelTone="pink" labelIcon="heart">
        <div className="monthly">
          <div className="monthly__top">
            <MiniCalendar
              monthKey={monthKey}
              today={today}
              doneDays={month.doneDays}
              eventDays={month.eventDays}
              onPick={(iso) => navigate(iso === today ? '/daily' : `/daily/${iso}`)}
            />
            <ProgressRing percent={month.overall.percent} caption={t.home.overall} />
          </div>
          <div className="monthly__lists">
            <div>
              <h3 className="monthly__h">{t.home.achievements}</h3>
              <StringList
                items={data.achievements}
                placeholder={t.home.achievementPlaceholder}
                onChange={(achievements) => db.months.put({ month: monthKey, achievements })}
              />
            </div>
            <div>
              <h3 className="monthly__h">{t.home.events}</h3>
              <EventList monthKey={monthKey} events={data.events} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function EventList({ monthKey, events }: { monthKey: string; events: { id: string; date: string; title: string }[] }) {
  const { t, date: fmtDate } = useI18n();
  const today = todayISO();
  const defaultDate = monthKeyOf(today) === monthKey ? today : `${monthKey}-01`;
  const [date, setDate] = useState(defaultDate);
  const [title, setTitle] = useState('');
  const effectiveDate = monthKeyOf(date) === monthKey ? date : defaultDate;

  const add = () => {
    if (!title.trim()) return;
    db.events.add({ id: newId(), date: effectiveDate, title: title.trim() });
    setTitle('');
  };

  return (
    <div>
      {events.map((e) => (
        <div className={`line ${e.date < today ? 'is-past' : ''}`} key={e.id}>
          <span className="event__date">{fmtDate(e.date, { day: 'numeric', month: 'short' })}</span>
          <span className="line-input">{e.title}</span>
          <button type="button" className="icon-btn" aria-label={t.common.delete} onClick={() => db.events.delete(e.id)}>
            <CrossIcon />
          </button>
        </div>
      ))}
      <div className="line event__add">
        <input
          type="date"
          className="event__date-input"
          value={effectiveDate}
          min={`${monthKey}-01`}
          max={`${monthKey}-31`}
          aria-label={t.daily.date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="line-input"
          value={title}
          placeholder={t.home.eventPlaceholder}
          aria-label={t.home.eventPlaceholder}
          enterKeyHint="enter"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button type="button" className="icon-btn" aria-label={t.common.add} onClick={add} style={{ color: 'var(--pink-deep)', fontSize: 22 }}>
          +
        </button>
      </div>
    </div>
  );
}
