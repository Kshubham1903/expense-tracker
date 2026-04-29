import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth.jsx';

const AuthPage = lazy(() => import('./pages/Auth'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const BalancesPage = lazy(() => import('./pages/Balances'));
const ReportsPage = lazy(() => import('./pages/Reports'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

function AppRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader label="Checking your account..." />;
  }

  return <Navigate to={user ? '/dashboard' : '/auth'} replace />;
}

function FullScreenLoader({ label }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 text-text-primary">
      <div className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-white/5 bg-surface/90 px-6 py-8 text-center shadow-soft backdrop-blur">
        <div className="h-10 w-10 animate-pulse rounded-full border border-white/15 border-t-accent-sage" />
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoader label="Loading workspace..." />}>
      <Routes>
        <Route path="/" element={<AppRedirect />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/balances" element={<BalancesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
