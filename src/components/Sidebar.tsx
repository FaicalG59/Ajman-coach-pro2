'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, BarChart3, Calendar, FileText, Target, Award, Video, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { useState, useEffect } from 'react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/teams', label: 'Teams', icon: Award },
  { href: '/dashboard/players', label: 'Players', icon: Users },
  { href: '/dashboard/injuries', label: 'Injuries', icon: Activity },
  { href: '/dashboard/performance', label: 'Performance', icon: BarChart3 },
  { href: '/dashboard/sessions', label: 'Training', icon: Calendar },
  { href: '/dashboard/video', label: 'Video Analysis', icon: Video },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/scouting', label: 'Scouting', icon: Target },
];

export default function Sidebar() {
  const path = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <aside className="w-64 card border-r flex-shrink-0 hidden md:flex flex-col rounded-none border-y-0 border-l-0">
      <div className="h-20 px-5 flex items-center border-b gradient-brand-soft" style={{ borderColor: 'var(--border-main)' }}>
        <Logo size={42} withText />
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin">
        {nav.map((item) => {
          const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition',
                active
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-orange'
                  : 'hover:bg-brand-50 dark:hover:bg-slate-700'
              )}
              style={{ color: active ? undefined : 'var(--text-secondary)' }}
            ><Icon size={18} /> {item.label}</Link>
          );
        })}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-main)' }}>
        <button onClick={toggleDark}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition hover:bg-brand-50 dark:hover:bg-slate-700"
          style={{ color: 'var(--text-secondary)' }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
      <div className="p-4 text-xs text-center border-t" style={{ borderColor: 'var(--border-main)', color: 'var(--text-secondary)' }}>
        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ajman Coach Pro</div>
        <div>v3.0</div>
      </div>
    </aside>
  );
}
