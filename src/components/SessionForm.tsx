'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import SessionBuilder from '@/components/SessionBuilder';
import type { Player, Team, SessionSection } from '@/lib/types';

export default function SessionForm({ players, teams }: { players: Player[]; teams?: Team[] }) {
  const router = useRouter();
  const [data, setData] = useState({
    team_id: teams?.[0]?.id ?? '',
    title: '', session_date: new Date().toISOString().split('T')[0],
    duration_minutes: 90, focus_area: 'Tactical', location: '', coach_notes: '',
  });
  const [sections, setSections] = useState<SessionSection[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelectedPlayers((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }

  const filteredPlayers = data.team_id ? players.filter((p) => p.team_id === data.team_id) : players;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const totalMin = sections.length > 0 ? sections.reduce((s, sec) => s + sec.duration_minutes, 0) : data.duration_minutes;
    const res = await fetch('/api/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, duration_minutes: totalMin, sections, player_ids: selectedPlayers }),
    });
    setLoading(false);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error || 'Failed');
    router.push('/dashboard/sessions'); router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input label="Title" required value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="e.g. Match preparation" />
      <div className="grid md:grid-cols-3 gap-4">
        {teams && (
          <Select label="Team" value={data.team_id} onChange={(e) => setData({ ...data, team_id: e.target.value })}>
            <option value="">All teams</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        )}
        <Input label="Date" type="date" required value={data.session_date} onChange={(e) => setData({ ...data, session_date: e.target.value })} />
        <Select label="Focus area" value={data.focus_area} onChange={(e) => setData({ ...data, focus_area: e.target.value })}>
          {['Tactical','Technical','Physical','Set pieces','Recovery','Match preparation'].map((f) => <option key={f} value={f}>{f}</option>)}
        </Select>
      </div>
      <Input label="Location" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} placeholder="Training ground" />

      {/* Session Builder with 4 sections */}
      <SessionBuilder initial={sections} onChange={setSections} />

      {/* Player selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label">Players ({selectedPlayers.length}/{filteredPlayers.length})</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedPlayers(filteredPlayers.map((p) => p.id))} className="text-xs text-brand-600 font-semibold">All</button>
            <button type="button" onClick={() => setSelectedPlayers([])} className="text-xs text-brand-600 font-semibold">None</button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 card max-h-48 overflow-y-auto scrollbar-thin">
          {filteredPlayers.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-700 transition">
              <input type="checkbox" checked={selectedPlayers.includes(p.id)} onChange={() => toggle(p.id)} className="rounded border-brand-300 text-brand-600" />
              <span style={{ color: 'var(--text-primary)' }}>{p.first_name} {p.last_name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="label">Coach notes</label>
        <textarea className="input-base min-h-[80px]" value={data.coach_notes} onChange={(e) => setData({ ...data, coach_notes: e.target.value })} />
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>Create session</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
