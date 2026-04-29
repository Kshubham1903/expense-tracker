import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, UserCircle2 } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reports', label: 'Reports', icon: LineChart },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/6 bg-surface/95 px-5 py-6 backdrop-blur lg:flex lg:flex-col">
      <div className="mb-8 rounded-[1.5rem] border border-white/6 bg-elevated/80 px-4 py-4">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-text-subtle">Expense Ledger</p>
        <p className="mt-2 text-lg font-semibold text-text-primary">Calm personal finance.</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Fast auth, private cloud storage, and a clean daily workflow.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors duration-200',
                  isActive
                    ? 'bg-white/7 text-text-primary'
                    : 'text-text-secondary hover:bg-white/4 hover:text-text-primary',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
