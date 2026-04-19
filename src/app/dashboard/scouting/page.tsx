'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import PieChart from '@/components/PieChart';
import { Plus, Search, Phone, Star } from 'lucide-react';
import type { Recruitment, AgeGroup } from '@/lib/types';
import { AGE_GROUPS } from '@/lib/types';

export default function ScoutingPage() {
  const supabase = createClient();
  const [recruits, setRecruits] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('recruitment').select('*').order('created_at', { ascending: false });
    setRecruits((data ?? []) as Recruitment[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const statuses = ['interested', 'contacted', 'trial', 'signed', 'rejected', 'not_interested'] as const;

  const filtered = recruits.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (ageGroupFilter !== 'all' && r.age_group !== ageGroupFilter) return false;
    return true;
  });

  const pipelineData = [
    { name: 'Interested', value: recruits.filter((r) => r.status === 'interested').length },
    { name: 'Contacted', value: recruits.filter((r) => r.status === 'contacted').length },
    { name: 'Trial', value: recruits.filter((r) => r.status === 'trial').length },
    { name: 'Signed', value: recruits.filter((r) => r.status === 'signed').length },
    { name: 'Rejected', value: recruits.filter((r) => r.status === 'rejected').length },
  ].filter((d) => d.value > 0);

  const recColors: Record<string, string> = {
    sign: 'bg-green-100 text-green-800', trial_extend: 'bg-blue-100 text-blue-800',
    monitor: 'bg-yellow-100 text-yellow-800', pass: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Scouting & Recruitment</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your recruitment pipeline</p>
        </div>
        <Link href="/dashboard/scouting/new"><Button><Plus size={16} /> Add prospect</Button></Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid md:grid-cols-4 gap-3">
          <div className="card p-4"><div className="label">Interested</div><div className="text-2xl font-extrabold text-brand-600">{recruits.filter((r) => r.status === 'interested').length}</div></div>
          <div className="card p-4"><div className="label">On Trial</div><div className="text-2xl font-extrabold text-brand-600">{recruits.filter((r) => r.status === 'trial').length}</div></div>
          <div className="card p-4"><div className="label">Signed</div><div className="text-2xl font-extrabold text-green-600">{recruits.filter((r) => r.status === 'signed').length}</div></div>
          <div className="card p-4"><div className="label">Total</div><div className="text-2xl font-extrabold text-brand-600">{recruits.length}</div></div>
        </div>
        <div className="card p-4">
          <PieChart data={pipelineData} title="Pipeline" colors={['#fb923c','#3b82f6','#a855f7','#22c55e','#ef4444']} />
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-base w-40 py-1.5 text-sm">
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={ageGroupFilter} onChange={(e) => setAgeGroupFilter(e.target.value)} className="input-base w-32 py-1.5 text-sm">
          <option value="all">All ages</option>
          {AGE_GROUPS.map((ag) => <option key={ag} value={ag}>{ag}</option>)}
        </select>
      </div>

      {loading ? <div className="card p-8 text-center text-sm">Loading…</div> : filtered.length === 0 ? (
        <div className="card p-8 text-center"><Search size={32} className="mx-auto opacity-30 mb-2" /><p style={{ color: 'var(--text-secondary)' }}>No prospects match</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Link key={r.id} href={`/dashboard/scouting/${r.id}`} className="card p-5 card-hover group">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-xl overflow-hidden">
                  {r.photo_url ? <img src={r.photo_url} alt="" className="w-full h-full object-cover" /> : '⚽'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold group-hover:text-brand-600 transition truncate" style={{ color: 'var(--text-primary)' }}>{r.first_name} {r.last_name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.age_group} · {r.position}</div>
                </div>
                {r.scout_overall_rating != null && (
                  <div className="flex items-center gap-1 text-sm font-bold text-brand-600">
                    <Star size={14} className="fill-brand-400 text-brand-400" /> {r.scout_overall_rating}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="brand">{r.status}</Badge>
                {r.scout_recommendation && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${recColors[r.scout_recommendation] || ''}`}>
                    {r.scout_recommendation}
                  </span>
                )}
              </div>
              {r.whatsapp_number && (
                <div className="text-xs flex items-center gap-1 text-green-700"><Phone size={12} /> {r.whatsapp_number}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
