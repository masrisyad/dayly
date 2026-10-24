import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';
import { asset, type AssetName } from '../lib/assets';

const TABS: { to: string; icon: AssetName; key: 'home' | 'weekly' | 'daily' | 'settings' }[] = [
  { to: '/', icon: 'plant', key: 'home' },
  { to: '/weekly', icon: 'books', key: 'weekly' },
  { to: '/daily', icon: 'pencils', key: 'daily' },
  { to: '/settings', icon: 'lamp', key: 'settings' },
];

export function BottomNav() {
  const { t } = useI18n();
  return (
    <nav className="bottom-nav" aria-label="Main">
      <ul>
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink to={tab.to} end={tab.to === '/'}>
              <img src={asset(tab.icon)} alt="" />
              {t.nav[tab.key]}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
