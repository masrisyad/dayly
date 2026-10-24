const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.2 0 3.6 1.3 4.4 2.6.8-1.3 2.2-2.6 4.4-2.6 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z';

interface HeartCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function HeartCheck({ checked, onChange, label }: HeartCheckProps) {
  return (
    <button
      type="button"
      className="heart-check"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={HEART} fill={checked ? 'var(--pink-deep)' : 'var(--white)'} stroke={checked ? '#d97489' : '#e2aab5'} strokeWidth="1.6" />
        {checked && <path d="M8 12.2l2.6 2.6L16 9.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </button>
  );
}

/** The numbered pink hearts used for Top Priorities. */
export function NumberHeart({ n }: { n: number }) {
  return (
    <span className="num-heart" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d={HEART} fill="var(--pink)" stroke="var(--pink-deep)" strokeWidth="1.2" />
      </svg>
      <span>{n}</span>
    </span>
  );
}
