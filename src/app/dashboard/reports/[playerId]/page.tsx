'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { createClient } from '@/lib/supabase/client';
import type { Player, Evaluation } from '@/lib/types';
import { Download, Save, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PlayerReportPage({ params }: { params: { playerId: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [evaluation, setEvaluation] = useState<Partial<Evaluation>>({
    tech_first_touch: 5, tech_passing: 5, tech_shooting: 5, tech_dribbling: 5,
    tac_positioning: 5, tac_decision_making: 5, tac_game_reading: 5,
    phy_speed: 5, phy_strength: 5, phy_endurance: 5,
    men_concentration: 5, men_confidence: 5, men_teamwork: 5,
    strengths: '', areas_to_improve: '', general_notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const [pR, eR] = await Promise.all([
        supabase.from('players').select('*').eq('id', params.playerId).single(),
        supabase.from('evaluations').select('*').eq('player_id', params.playerId).order('evaluation_date', { ascending: false }).limit(1),
      ]);
      setPlayer(pR.data as Player);
      if (eR.data?.[0]) setEvaluation(eR.data[0]);
      setLoading(false);
    })();
  }, [params.playerId, supabase]);

  function n(k: keyof Evaluation) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setEvaluation((ev) => ({ ...ev, [k]: Number(e.target.value) }));
  }

  async function saveEvaluation() {
    setSaving(true);
    const { error } = await supabase.from('evaluations').insert({
      player_id: params.playerId,
      coach_id: (await supabase.auth.getUser()).data.user?.id,
      evaluation_date: new Date().toISOString().split('T')[0],
      ...evaluation,
    });
    setSaving(false);
    if (error) alert(error.message);
    else {
      alert('Evaluation saved.');
      router.refresh();
    }
  }

  async function downloadPDF() {
    setDownloading(true);
    const res = await fetch(`/api/reports/${params.playerId}`, { method: 'GET' });
    setDownloading(false);
    if (!res.ok) return alert('Failed to generate PDF');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${player?.last_name || 'player'}-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="card p-8 text-center text-sm text-slate-500">Loading…</div>;
  if (!player) return <div className="card p-8 text-center">Player not found.</div>;

  return (
    <div className="space-y-5 max-w-5xl animate-fade-in-up">
      <Link href="/dashboard/reports" className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
        <ChevronLeft size={16} /> Back to reports
      </Link>

      <div className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-800">Report · {player.first_name} {player.last_name}</h1>
            <p className="text-sm text-slate-600">Fill the evaluation below and download the full PDF report.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={saveEvaluation} loading={saving}><Save size={15} /> Save evaluation</Button>
            <Button onClick={downloadPDF} loading={downloading}><Download size={15} /> Download PDF</Button>
          </div>
        </div>
      </div>

      <EvalSection title="⚽ Technical (1-10)">
        <EvalInput label="1st Touch" value={evaluation.tech_first_touch} onChange={n('tech_first_touch')} />
        <EvalInput label="Passing" value={evaluation.tech_passing} onChange={n('tech_passing')} />
        <EvalInput label="Shooting" value={evaluation.tech_shooting} onChange={n('tech_shooting')} />
        <EvalInput label="Dribbling" value={evaluation.tech_dribbling} onChange={n('tech_dribbling')} />
      </EvalSection>
      <EvalSection title="🎯 Tactical (1-10)">
        <EvalInput label="Positioning" value={evaluation.tac_positioning} onChange={n('tac_positioning')} />
        <EvalInput label="Decision making" value={evaluation.tac_decision_making} onChange={n('tac_decision_making')} />
        <EvalInput label="Game reading" value={evaluation.tac_game_reading} onChange={n('tac_game_reading')} />
      </EvalSection>
      <EvalSection title="💪 Physical (1-10)">
        <EvalInput label="Speed" value={evaluation.phy_speed} onChange={n('phy_speed')} />
        <EvalInput label="Strength" value={evaluation.phy_strength} onChange={n('phy_strength')} />
        <EvalInput label="Endurance" value={evaluation.phy_endurance} onChange={n('phy_endurance')} />
      </EvalSection>
      <EvalSection title="🧠 Mental (1-10)">
        <EvalInput label="Concentration" value={evaluation.men_concentration} onChange={n('men_concentration')} />
        <EvalInput label="Confidence" value={evaluation.men_confidence} onChange={n('men_confidence')} />
        <EvalInput label="Teamwork" value={evaluation.men_teamwork} onChange={n('men_teamwork')} />
      </EvalSection>

      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-brand-800 text-lg">Written evaluation</h2>
        <div className="flex flex-col gap-1.5">
          <label className="label">Strengths</label>
          <textarea className="input-base min-h-[80px]" value={evaluation.strengths ?? ''} onChange={(e) => setEvaluation({ ...evaluation, strengths: e.target.value })} placeholder="What does this player excel at?" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="label">Areas to improve</label>
          <textarea className="input-base min-h-[80px]" value={evaluation.areas_to_improve ?? ''} onChange={(e) => setEvaluation({ ...evaluation, areas_to_improve: e.target.value })} placeholder="Key development priorities..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="label">General notes</label>
          <textarea className="input-base min-h-[80px]" value={evaluation.general_notes ?? ''} onChange={(e) => setEvaluation({ ...evaluation, general_notes: e.target.value })} placeholder="Any additional observations..." />
        </div>
      </div>
    </div>
  );
}

function EvalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="font-bold text-brand-800 text-lg mb-4">{title}</h2>
      <div className="grid md:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

function EvalInput({ label, value, onChange }: { label: string; value: number | null | undefined; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return <Input label={label} type="number" min={1} max={10} value={value ?? 5} onChange={onChange} />;
}
