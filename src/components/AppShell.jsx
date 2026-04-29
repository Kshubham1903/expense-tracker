import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const routeMeta = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Track spending without the noise.',
  },
  '/balances': {
    title: 'Balances',
    subtitle: 'Manage bank, UPI Lite, and cash independently.',
  },
  '/reports': {
    title: 'Reports',
    subtitle: 'Review and export clean statements.',
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Account details and session control.',
  },
};

export default function AppShell() {
  const { user, logout, displayName } = useAuth();
  const location = useLocation();
  const meta = routeMeta[location.pathname] || routeMeta['/dashboard'];

  return (
    <div className="min-h-screen overflow-x-hidden bg-page text-text-primary">
      <div className="fixed inset-0 -z-10 bg-page-glow opacity-100" />
      <Sidebar />

      <div className="md:pl-72">
        <Navbar title={meta.title} subtitle={meta.subtitle} user={user} displayName={displayName} onLogout={logout} />

        <main className="mx-auto w-full max-w-screen-xl px-4 pb-24 pt-4 sm:px-6 md:pb-8 lg:px-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
