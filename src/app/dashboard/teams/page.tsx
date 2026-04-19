'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import { Plus, Award } from 'lucide-react';
import type { Team } from '@/lib/types';

export default function TeamsPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });
    setTeams((data ?? []) as Team[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-800">Teams</h1>
          <p className="text-sm text-slate-600">Manage your squads and age groups</p>
        </div>
        <Link href="/dashboard/teams/new"><Button><Plus size={16} /> New team</Button></Link>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>
      ) : teams.length === 0 ? (
        <div className="card p-8 text-center">
          <Award size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500">No teams yet. Create your first team.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Link key={team.id} href={`/dashboard/teams/${team.id}`} className="card p-5 card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-brand-800 text-lg group-hover:text-brand-700 transition">{team.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{team.age_group} {team.division ? `· ${team.division}` : ''}</div>
                </div>
                {team.logo_url && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
