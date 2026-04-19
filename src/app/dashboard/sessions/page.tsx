import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Session } from '@/lib/types';

export default async function SessionsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('sessions')
    .select('*, session_players(count)')
    .order('session_date', { ascending: false });

  const sessions = (data ?? []) as (Session & { session_players: { count: number }[] })[];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-800">Training sessions</h1>
          <p className="text-sm text-slate-600">Plan and log sessions</p>
        </div>
        <Link href="/dashboard/sessions/new"><Button><Plus size={16} /> New session</Button></Link>
      </div>

      {sessions.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Calendar size={48} />} title="No sessions yet" description="Plan your first training session." action={<Link href="/dashboard/sessions/new"><Button><Plus size={16} /> New session</Button></Link>} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sessions.map((s) => (
            <div key={s.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-brand-800 text-lg">{s.title}</h3>
                  <div className="text-xs text-brand-600 font-semibold uppercase tracking-wide mt-0.5">{s.focus_area}</div>
                </div>
                <div className="text-xs bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-glow-orange">
                  {s.session_players?.[0]?.count ?? 0} players
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-2">
                <div className="inline-flex items-center gap-1"><Calendar size={12} className="text-brand-600" /> {formatDate(s.session_date)}</div>
                <div className="inline-flex items-center gap-1"><Clock size={12} className="text-brand-600" /> {s.duration_minutes} min</div>
                {s.location && <div className="inline-flex items-center gap-1"><MapPin size={12} className="text-brand-600" /> {s.location}</div>}
              </div>
              {s.coach_notes && <p className="text-sm text-slate-700 mt-3 leading-relaxed whitespace-pre-line line-clamp-3 bg-brand-50/50 p-3 rounded-lg border border-brand-100">{s.coach_notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
