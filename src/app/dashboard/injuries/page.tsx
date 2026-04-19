'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import InjuryForm from '@/components/InjuryForm';
import EmptyState from '@/components/EmptyState';
import { Plus, Activity, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Injury, Player } from '@/lib/types';

type InjuryRow = Injury & { player: Pick<Player, 'first_name' | 'last_name'> | null };

export default function InjuriesPage() {
  const supabase = createClient();
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'recovered'>('active');

  async function load() {
    setLoading(true);
    const [i, p] = await Promise.all([
      supabase.from('injuries').select('*, player:players(first_name,last_name)').order('injury_date', { ascending: false }),
      supabase.from('players').select('*').order('last_name'),
    ]);
    setInjuries((i.data ?? []) as any);
    setPlayers((p.data ?? []) as Player[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRecovered(id: string) {
    if (!confirm('Mark this injury as recovered?')) return;
    await fetch(`/api/injuries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'recovered', actual_return_date: new Date().toISOString().split('T')[0] }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this injury record?')) return;
    await fetch(`/api/injuries/${id}`, { method: 'DELETE' });
    load();
  }

  const filtered = injuries.filter((i) => filter === 'all' || i.status === filter);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-800">Injuries</h1>
          <p className="text-sm text-slate-600">Track injuries and recovery</p>
        </div>
        <Button onClick={() => setModal(true)} disabled={players.length === 0}>
          <Plus size={16} /> Record injury
        </Button>
      </div>

      <div className="flex gap-2">
        {(['active', 'recovered', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === f
                ? 'gradient-brand text-white shadow-glow-orange'
                : 'bg-white border border-orange-200 text-slate-600 hover:bg-brand-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Activity size={48} />} title="No injuries to show" description={players.length === 0 ? 'Add players first.' : 'Great news — no injuries match this filter.'} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="gradient-brand-soft border-b border-orange-200">
                {['Player','Type','Body part','Severity','Date','Expected return','Status',''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase text-brand-800">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-orange-50">
                {filtered.map((inj) => (
                  <tr key={inj.id} className="hover:bg-brand-50/40">
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {inj.player ? `${inj.player.first_name} ${inj.player.last_name}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{inj.injury_type}</td>
                    <td className="px-5 py-3 text-slate-700">{inj.body_part}</td>
                    <td className="px-5 py-3 text-slate-700 capitalize">{inj.severity}</td>
                    <td className="px-5 py-3 text-slate-700">{formatDate(inj.injury_date)}</td>
                    <td className="px-5 py-3 text-slate-700">{formatDate(inj.expected_return_date)}</td>
                    <td className="px-5 py-3"><Badge variant={inj.status === 'active' ? 'danger' : 'success'}>{inj.status}</Badge></td>
                    <td className="px-5 py-3 flex gap-1 whitespace-nowrap">
                      {inj.status === 'active' && (
                        <button onClick={() => markRecovered(inj.id)} className="text-green-700 hover:bg-green-50 p-1.5 rounded-lg" title="Mark recovered">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button onClick={() => remove(inj.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Record injury">
        <InjuryForm players={players} onDone={() => { setModal(false); load(); }} />
      </Modal>
    </div>
  );
}
