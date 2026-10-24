import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { db } from './db/db';
import { BottomNav } from './components/BottomNav';
import Onboarding from './pages/Onboarding';
import Lock from './pages/Lock';
import Home from './pages/Home';
import Weekly from './pages/Weekly';
import Daily from './pages/Daily';
import Settings from './pages/Settings';

export default function App() {
  // undefined = still loading, null = no profile yet (first run or after a reset)
  const profile = useLiveQuery(() => db.profile.get('me').then((p) => p ?? null), []);
  // Decided once per app launch: setting a PIN later doesn't lock you out of the current session.
  const [locked, setLocked] = useState<boolean | null>(null);
  const unlock = useCallback(() => setLocked(false), []);

  useEffect(() => {
    if (profile !== undefined && locked === null) setLocked(!!profile?.pinHash);
    if (profile === null) setLocked(false);
  }, [profile, locked]);

  if (profile === undefined || locked === null) return null;
  if (profile === null) return <Onboarding />;
  if (locked && profile.pinHash) return <Lock profile={profile} onUnlock={unlock} />;

  return (
    <HashRouter>
      <ScrollToTop />
      <main className="shell">
        <Routes>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/weekly/:week?" element={<Weekly />} />
          <Route path="/daily/:date?" element={<Daily />} />
          <Route path="/settings" element={<Settings profile={profile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </HashRouter>
  );
}

/** Switching tabs starts at the top; moving between days or weeks within a page keeps the scroll. */
function ScrollToTop() {
  const section = useLocation().pathname.split('/')[1];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);
  return null;
}
