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
  const { user, logout } = useAuth();
  const location = useLocation();
  const meta = routeMeta[location.pathname] || routeMeta['/dashboard'];

  return (
    <div className="min-h-screen bg-page text-text-primary">
      <div className="fixed inset-0 -z-10 bg-page-glow opacity-100" />
      <Sidebar />

      <div className="lg:pl-72">
        <Navbar title={meta.title} subtitle={meta.subtitle} user={user} onLogout={logout} />

        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
