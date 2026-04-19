import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import EmptyState from '@/components/EmptyState';
import { FileText, ChevronRight } from 'lucide-react';
import type { Player } from '@/lib/types';

export default async function ReportsIndex() {
  const supabase = createClient();
  const { data } = await supabase.from('players').select('*').order('last_name');
  const players = (data ?? []) as Player[];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold text-brand-800">Reports</h1>
        <p className="text-sm text-slate-600">Generate a professional PDF report for any player</p>
      </div>

      {players.length === 0 ? (
        <div className="card">
          <EmptyState icon={<FileText size={48} />} title="No players yet" description="Add players first to generate reports." />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <Link key={p.id} href={`/dashboard/reports/${p.id}`} className="card p-5 card-hover group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center shadow-glow-orange group-hover:scale-110 transition"><FileText size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 group-hover:text-brand-700 transition">{p.first_name} {p.last_name}</div>
                  <div className="text-xs text-slate-500">{p.team} · {p.position}</div>
                </div>
                <ChevronRight size={18} className="text-brand-500 group-hover:translate-x-1 transition" />
              </div>
              <div className="text-xs text-brand-600 font-semibold mt-3">Generate PDF report →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
