import { LogOut, ShieldCheck } from 'lucide-react';

function initialsFromName(name) {
  if (!name) return '';
  return String(name).trim().charAt(0).toUpperCase();
}

export default function Navbar({ title, subtitle, user, onLogout, displayName }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-page/85 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3 px-4 py-3 sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 truncate text-[0.68rem] uppercase tracking-[0.22em] text-text-subtle">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-sage" />
            Secure workspace
          </div>
          <h1 className="mt-1.5 truncate text-base font-semibold text-text-primary sm:mt-2 sm:text-xl">{title}</h1>
          {subtitle ? <p className="mt-1 truncate text-xs text-text-secondary sm:text-sm">{subtitle}</p> : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 rounded-full border border-white/6 bg-white/[0.04] px-2.5 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/6 bg-white/[0.02] text-sm font-semibold text-luxury-gold">
              {initialsFromName(displayName)}
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <p className="max-w-[120px] truncate text-sm font-medium text-white">{displayName || user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="hidden h-10 items-center justify-center gap-2 rounded-full border border-white/6 bg-elevated/80 px-4 text-sm text-text-primary transition-colors duration-200 hover:bg-white/8 md:inline-flex"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
