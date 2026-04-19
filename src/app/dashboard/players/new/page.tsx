import { createClient } from '@/lib/supabase/server';
import PlayerForm from '@/components/PlayerForm';
import type { Team } from '@/lib/types';

export default async function NewPlayerPage() {
  const supabase = createClient();
  const { data } = await supabase.from('teams').select('*').order('name');
  const teams = (data ?? []) as Team[];

  return (
    <div className="max-w-3xl animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-brand-800 mb-1">Add player</h1>
      <p className="text-sm text-slate-600 mb-5">Create a new player profile with photo upload</p>
      <div className="card p-6">
        <PlayerForm teams={teams} />
      </div>
    </div>
  );
}
