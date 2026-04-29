import { ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="grid gap-5 overflow-x-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-[1.5rem] border border-white/5 bg-surface/90 p-5 shadow-soft backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/6 bg-white/[0.04]">
            <UserCircle2 className="h-5 w-5 text-accent-sage" />
          </div>
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">Profile</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">Account details</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4 rounded-[1.25rem] border border-white/5 bg-white/[0.03] p-4 text-sm text-text-secondary">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span>Email</span>
            <span className="break-words text-text-primary sm:truncate">{user?.email}</span>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span>User UID</span>
            <span className="break-all text-text-primary sm:truncate">{user?.uid}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#e8ecef] px-4 text-sm font-semibold text-[#0f1419] transition-colors duration-200 hover:bg-white sm:w-auto"
        >
          Logout
        </button>
      </section>

      <section className="rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <ShieldCheck className="h-4 w-4 text-accent-blue" />
          Security posture
        </div>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Authentication is handled only by Firebase, data is isolated by user UID, and Firestore rules reject
          cross-account reads or writes.
        </p>
      </section>
    </div>
  );
}
