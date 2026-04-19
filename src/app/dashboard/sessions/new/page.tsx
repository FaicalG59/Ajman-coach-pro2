import { createClient } from '@/lib/supabase/server';
import SessionForm from '@/components/SessionForm';
import type { Player, Team } from '@/lib/types';

export default async function NewSessionPage() {
  const supabase = createClient();
  const [pR, tR] = await Promise.all([
    supabase.from('players').select('*').order('last_name'),
    supabase.from('teams').select('*').order('name'),
  ]);
  const players = (pR.data ?? []) as Player[];
  const teams = (tR.data ?? []) as Team[];

  return (
    <div className="max-w-3xl animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-brand-800 mb-1">New training session</h1>
      <p className="text-sm text-slate-600 mb-5">Plan a session with tactical board and player lineup</p>
      <div className="card p-6"><SessionForm players={players} teams={teams} /></div>
    </div>
  );
}
