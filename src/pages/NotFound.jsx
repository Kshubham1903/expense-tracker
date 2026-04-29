import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 text-text-primary">
      <div className="max-w-lg rounded-[2rem] border border-white/5 bg-surface/90 p-8 text-center shadow-soft backdrop-blur">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          The route you opened does not exist. Return to the dashboard to continue tracking expenses.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#e8ecef] px-5 text-sm font-semibold text-[#0f1419] transition-colors duration-200 hover:bg-white"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
