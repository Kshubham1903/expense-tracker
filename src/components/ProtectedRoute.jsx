import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 text-text-primary">
      <div className="rounded-[1.5rem] border border-white/5 bg-surface/90 px-6 py-8 text-center shadow-soft backdrop-blur">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full border border-white/15 border-t-accent-sage" />
        <p className="mt-4 text-sm text-text-secondary">Authenticating securely...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
