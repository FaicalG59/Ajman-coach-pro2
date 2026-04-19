import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coach } = await supabase
    .from('coaches')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar coachName={coach?.full_name || user.email || 'Coach'} />
        <main className="flex-1 overflow-y-auto p-5 md:p-8 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
