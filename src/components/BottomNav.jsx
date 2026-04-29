import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, UserCircle2 } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/reports', label: 'Reports', icon: LineChart },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/6 bg-page/92 px-3 py-3 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs transition-colors duration-200',
                  isActive ? 'bg-white/7 text-text-primary' : 'text-text-subtle',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
