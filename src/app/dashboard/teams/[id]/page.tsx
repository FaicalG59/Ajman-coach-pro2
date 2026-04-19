import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PlayerCard from '@/components/PlayerCard';
import PieChart from '@/components/PieChart';
import StatCard from '@/components/StatCard';
import { Users, Activity, ChevronLeft, TrendingUp } from 'lucide-react';
import type { Player, Team } from '@/lib/types';

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [teamR, playersR, injuriesR, perfR] = await Promise.all([
    supabase.from('teams').select('*').eq('id', params.id).single(),
    supabase.from('players').select('*').eq('team_id', params.id).order('last_name'),
    supabase.from('injuries').select('id,player_id,severity,status').eq('status', 'active'),
    supabase.from('performances').select('id,player_id,goals,assists,rating').order('match_date', { ascending: false }).limit(50),
  ]);

  if (teamR.error || !teamR.data) notFound();
  const team = teamR.data as Team;
  const players = (playersR.data ?? []) as Player[];
  const injuries = (injuriesR.data ?? []).filter((i) => players.some((p) => p.id === i.player_id));
  const performances = (perfR.data ?? []).filter((p) => players.some((pl) => pl.id === p.player_id));

  const statusData = [
    { name: 'Fit', value: players.filter((p) => p.status === 'fit').length },
    { name: 'Injured', value: players.filter((p) => p.status === 'injured').length },
    { name: 'Recovering', value: players.filter((p) => p.status === 'recovering').length },
  ].filter((d) => d.value > 0);

  const positionData = [
    { name: 'GK', value: players.filter((p) => p.position === 'GK').length },
    { name: 'DEF', value: players.filter((p) => p.position === 'DEF').length },
    { name: 'MID', value: players.filter((p) => p.position === 'MID').length },
    { name: 'FWD', value: players.filter((p) => p.position === 'FWD').length },
  ].filter((d) => d.value > 0);

  const totalGoals = performances.reduce((s, p) => s + (p.goals ?? 0), 0);
  const ratings = performances.map((p) => p.rating).filter((r): r is number => r !== null);
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : '—';

  return (
    <div className="space-y-5 animate-fade-in-up">
      <Link href="/dashboard/teams" className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
        <ChevronLeft size={16} /> Back to teams
      </Link>

      <div className="card p-6">
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{team.name}</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {team.age_group} {team.division ? `· ${team.division}` : ''}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Players" value={players.length} icon={<Users size={20} />} accent />
        <StatCard label="Active injuries" value={injuries.length} icon={<Activity size={20} />} />
        <StatCard label="Total goals" value={totalGoals} icon={<TrendingUp size={20} />} />
        <StatCard label="Avg rating" value={avgRating} icon={<TrendingUp size={20} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5"><PieChart data={statusData} title="Player status" colors={['#22c55e','#ef4444','#eab308']} /></div>
        <div className="card p-5"><PieChart data={positionData} title="Positions" colors={['#3b82f6','#22c55e','#f97316','#a855f7']} /></div>
      </div>

      <section>
        <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>Squad ({players.length})</h2>
        {players.length === 0 ? (
          <div className="card p-8 text-center"><p style={{ color: 'var(--text-secondary)' }}>No players assigned to this team yet.</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((p) => <PlayerCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
