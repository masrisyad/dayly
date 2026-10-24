import { asset } from '../lib/assets';

/** Rounded photo frame with a little heart, as in the home design. Falls back to the bear. */
export function Avatar({ src, size = 72 }: { src?: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <img src={src ?? asset('bear')} alt="" className={src ? '' : 'avatar__fallback'} />
      <img src={asset('heart')} alt="" className="avatar__heart" />
    </span>
  );
}
