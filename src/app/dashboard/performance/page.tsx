'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import PerformanceForm from '@/components/PerformanceForm';
import PerformanceChart from '@/components/PerformanceChart';
import PieChart from '@/components/PieChart';
import Select from '@/components/Select';
import EmptyState from '@/components/EmptyState';
import { Plus, BarChart3 } from 'lucide-react';
import { formatDate, passAccuracy } from '@/lib/utils';
import type { Performance, Player, Team } from '@/lib/types';

export default function PerformancePage() {
  const supabase = createClient();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [perf, setPerf] = useState<Performance[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [p, ps, t] = await Promise.all([
      supabase.from('performances').select('*').order('match_date', { ascending: false }),
      supabase.from('players').select('*').order('last_name'),
      supabase.from('teams').select('*').order('name'),
    ]);
    setPerf((p.data ?? []) as Performance[]);
    setPlayers((ps.data ?? []) as Player[]);
    setTeams((t.data ?? []) as Team[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Delete this performance record?')) return;
    await fetch(`/api/performances/${id}`, { method: 'DELETE' });
    load();
  }

  const shown = perf.filter((p) => {
    if (selectedPlayer !== 'all' && p.player_id !== selectedPlayer) return false;
    if (selectedTeam !== 'all' && p.team_id !== selectedTeam) return false;
    return true;
  });

  const performanceByTeam = teams
    .map((t) => ({
      name: t.name,
      value: perf.filter((p) => p.team_id === t.id).length,
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-800">Performance</h1>
          <p className="text-sm text-slate-600">Match stats and team analytics</p>
        </div>
        <Button onClick={() => setModal(true)} disabled={players.length === 0}>
          <Plus size={16} /> Add match
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <label className="label mb-2">Filter by player</label>
          <Select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
            <option value="all">All players</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </Select>
        </div>
        <div className="card p-4">
          <label className="label mb-2">Filter by team</label>
          <Select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="all">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-bold text-brand-800 text-lg mb-4">Progress chart</h2>
          <PerformanceChart data={shown} />
        </div>
        <div className="card p-5">
          <h2 className="font-bold text-brand-800 text-lg mb-4">Performance by team</h2>
          {performanceByTeam.length > 0 ? (
            <PieChart data={performanceByTeam} />
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No team data</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="card">
          <EmptyState icon={<BarChart3 size={48} />} title="No performance records" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="gradient-brand-soft border-b border-orange-200">
                {['Date','Player','Team','Opponent','Min','G','A','Pass %','Rating',''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase text-brand-800">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-orange-50">
                {shown.map((p) => {
                  const player = players.find((x) => x.id === p.player_id);
                  const team = teams.find((t) => t.id === p.team_id);
                  return (
                    <tr key={p.id} className="hover:bg-brand-50/40">
                      <td className="px-5 py-3">{formatDate(p.match_date)}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{player?.first_name} {player?.last_name}</td>
                      <td className="px-5 py-3 text-xs">{team?.name || '—'}</td>
                      <td className="px-5 py-3">{p.opponent}</td>
                      <td className="px-5 py-3">{p.minutes_played}</td>
                      <td className="px-5 py-3 font-bold text-brand-700">{p.goals}</td>
                      <td className="px-5 py-3">{p.assists}</td>
                      <td className="px-5 py-3">{passAccuracy(p.passes_completed, p.passes_attempted)}%</td>
                      <td className="px-5 py-3 font-bold">{p.rating ?? '—'}</td>
                      <td className="px-5 py-3"><button onClick={() => remove(p.id)} className="text-red-600 text-xs font-semibold hover:underline">Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Record match performance">
        <PerformanceForm players={players.map(p => ({ id: p.id, first_name: p.first_name, last_name: p.last_name }))} onDone={() => { setModal(false); load(); }} />
      </Modal>
    </div>
  );
}
