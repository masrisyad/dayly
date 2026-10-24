import { useI18n } from '../i18n';
import { Deco } from './Card';

export function BrandHeader() {
  const { t } = useI18n();
  return (
    <header className="brand">
      <Deco name="plant" size={64} style={{ left: 0, top: 0 }} />
      <Deco name="purple-flower" size={34} style={{ right: 8, top: 10 }} />
      <Deco name="star-pink" size={22} style={{ right: 48, top: 44 }} />
      <h1 className="bubble-text brand__name">
        <span className="bubble-pink">Day</span>
        <span className="bubble-lavender">ly</span>
      </h1>
      <p className="tagline">{t.tagline}</p>
    </header>
  );
}
