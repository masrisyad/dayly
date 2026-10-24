import type { CSSProperties } from 'react';

export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <div className="progress__fill" style={{ width: `${Math.max(percent, percent ? 8 : 0)}%` }} />
      <span className="progress__label">{label}</span>
    </div>
  );
}

export function ProgressRing({ percent, caption }: { percent: number; caption: string }) {
  return (
    <div className="ring" style={{ '--p': percent } as CSSProperties} role="img" aria-label={`${percent}% ${caption}`}>
      <div className="ring__inner">
        <div>
          <strong>{percent}%</strong>
          <br />
          <small>{caption}</small>
        </div>
      </div>
    </div>
  );
}
