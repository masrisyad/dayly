import { WATER_GLASSES } from '../db/db';
import { fmt, useI18n } from '../i18n';
import { asset } from '../lib/assets';

/** Tap a glass to fill up to it; tap the last filled glass again to empty it. */
export function WaterTracker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="water">
        {Array.from({ length: WATER_GLASSES }, (_, i) => {
          const n = i + 1;
          const full = n <= value;
          return (
            <button
              key={n}
              type="button"
              className={`water__glass ${full ? 'is-full' : ''}`}
              aria-pressed={full}
              aria-label={fmt(t.daily.waterCount, { n, total: WATER_GLASSES })}
              onClick={() => onChange(value === n ? n - 1 : n)}
            >
              <img src={asset('glass')} alt="" />
              <span>{n}</span>
            </button>
          );
        })}
      </div>
      <p className="muted" style={{ margin: '6px 0 0', fontSize: 13, textAlign: 'center' }}>
        {fmt(t.daily.waterCount, { n: value, total: WATER_GLASSES })}
      </p>
    </div>
  );
}
