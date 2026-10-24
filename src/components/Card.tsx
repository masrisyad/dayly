import type { CSSProperties, ReactNode } from 'react';
import { asset, type AssetName } from '../lib/assets';

type Tone = 'cream' | 'pink' | 'yellow' | 'blue' | 'active';
type LabelTone = 'pink' | 'lavender' | 'mint' | 'yellow' | 'blue';

interface CardProps {
  tone?: Tone;
  label?: ReactNode;
  labelTone?: LabelTone;
  labelIcon?: AssetName;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Card({ tone = 'cream', label, labelTone = 'pink', labelIcon, onClick, className, style, children }: CardProps) {
  const classes = ['card', tone !== 'cream' && `card--${tone}`, onClick && 'card--link', className].filter(Boolean).join(' ');
  return (
    <section
      className={classes}
      style={style}
      onClick={onClick}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {label && (
        <h2 className={`label label--${labelTone}`} style={{ margin: 0 }}>
          {label}
          {labelIcon && <img src={asset(labelIcon)} alt="" />}
        </h2>
      )}
      {children}
    </section>
  );
}

interface DecoProps {
  name: AssetName;
  size: number;
  style: CSSProperties;
}

/** A decorative illustration pinned to a corner of its (relative) parent. */
export function Deco({ name, size, style }: DecoProps) {
  return <img className="deco" src={asset(name)} alt="" width={size} height={size} style={{ width: size, height: size, ...style }} />;
}
