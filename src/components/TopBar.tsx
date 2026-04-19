'use client';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TopBar({ coachName }: { coachName: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login'); router.refresh();
  }

  const initials = coachName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="h-16 card rounded-none border-x-0 border-t-0 px-5 flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Welcome back, {coachName}</div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ajman Club · Player Management</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-brand-50 dark:hover:bg-slate-700" style={{ color: 'var(--text-secondary)' }}>
          <Bell size={17} />
        </button>
        <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-glow-orange">{initials || 'C'}</div>
        <button onClick={signOut} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-700 font-medium"
          style={{ color: 'var(--text-secondary)' }}>
          <LogOut size={15} /><span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
