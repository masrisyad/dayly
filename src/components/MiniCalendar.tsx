import { useI18n } from '../i18n';
import { daysInMonth, isoOf, parseMonthKey } from '../lib/dates';

interface MiniCalendarProps {
  monthKey: string;
  today: string;
  doneDays: Set<string>; // every task that day is finished
  eventDays: Set<string>;
  onPick: (iso: string) => void;
}

export function MiniCalendar({ monthKey, today, doneDays, eventDays, onPick }: MiniCalendarProps) {
  const { t } = useI18n();
  const { year, month } = parseMonthKey(monthKey);
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0 = Sunday, matching the design
  const total = daysInMonth(year, month);
  // 2023-01-01 was a Sunday: use it to get localized narrow weekday names.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(t.locale, { weekday: 'narrow' }).format(new Date(2023, 0, 1 + i)),
  );

  return (
    <div className="mini-cal">
      {weekdays.map((w, i) => (
        <span key={`w${i}`} className="mini-cal__wd">
          {w}
        </span>
      ))}
      {Array.from({ length: firstWeekday }, (_, i) => (
        <span key={`b${i}`} />
      ))}
      {Array.from({ length: total }, (_, i) => {
        const iso = isoOf(year, month, i + 1);
        const cls = [
          'mini-cal__day',
          doneDays.has(iso) && 'is-done',
          eventDays.has(iso) && 'is-event',
          iso === today && 'is-today',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button key={iso} type="button" className={cls} onClick={() => onPick(iso)}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
