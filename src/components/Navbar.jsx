import { LogOut, ShieldCheck } from 'lucide-react';

function initialsFromName(name) {
  if (!name) return '';
  return String(name).trim().charAt(0).toUpperCase();
}

export default function Navbar({ title, subtitle, user, onLogout, displayName }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-page/85 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-sage" />
            Secure workspace
          </div>
          <h1 className="mt-2 text-lg font-semibold text-text-primary sm:text-xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden max-w-[16rem] rounded-full border border-white/6 bg-white/[0.04] px-4 py-2 text-right sm:flex sm:items-center sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/6 bg-white/[0.02] text-sm font-semibold text-luxury-gold">
              {initialsFromName(displayName)}
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium text-text-primary">{displayName || user?.email}</p>
              <p className="text-xs text-text-subtle">Authed session</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/6 bg-elevated/80 px-4 py-2.5 text-sm text-text-primary transition-colors duration-200 hover:bg-white/8"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
