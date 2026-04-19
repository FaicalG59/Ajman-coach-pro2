'use client';
import { useState, useEffect } from 'react';

interface Scores {
  scout_tech_ball_control: number; scout_tech_passing: number;
  scout_tech_shooting: number; scout_tech_dribbling: number;
  scout_phy_speed: number; scout_phy_strength: number;
  scout_phy_endurance: number; scout_phy_agility: number;
  scout_tac_positioning: number; scout_tac_awareness: number; scout_tac_decision: number;
  scout_psy_confidence: number; scout_psy_leadership: number;
  scout_psy_composure: number; scout_psy_work_ethic: number;
}

interface Props {
  initial?: Partial<Scores>;
  onChange?: (scores: Scores & { scout_overall_rating: number; scout_recommendation: string }) => void;
  readOnly?: boolean;
}

const defaultScores: Scores = {
  scout_tech_ball_control: 5, scout_tech_passing: 5, scout_tech_shooting: 5, scout_tech_dribbling: 5,
  scout_phy_speed: 5, scout_phy_strength: 5, scout_phy_endurance: 5, scout_phy_agility: 5,
  scout_tac_positioning: 5, scout_tac_awareness: 5, scout_tac_decision: 5,
  scout_psy_confidence: 5, scout_psy_leadership: 5, scout_psy_composure: 5, scout_psy_work_ethic: 5,
};

const categories = [
  { key: 'technical', label: 'Technical', emoji: '⚽', color: 'from-orange-500 to-orange-600',
    fields: [
      { key: 'scout_tech_ball_control', label: 'Ball Control' },
      { key: 'scout_tech_passing', label: 'Passing' },
      { key: 'scout_tech_shooting', label: 'Shooting' },
      { key: 'scout_tech_dribbling', label: 'Dribbling' },
    ]
  },
  { key: 'physical', label: 'Physical', emoji: '💪', color: 'from-red-500 to-red-600',
    fields: [
      { key: 'scout_phy_speed', label: 'Speed' },
      { key: 'scout_phy_strength', label: 'Strength' },
      { key: 'scout_phy_endurance', label: 'Endurance' },
      { key: 'scout_phy_agility', label: 'Agility' },
    ]
  },
  { key: 'tactical', label: 'Tactical', emoji: '🧠', color: 'from-blue-500 to-blue-600',
    fields: [
      { key: 'scout_tac_positioning', label: 'Positioning' },
      { key: 'scout_tac_awareness', label: 'Awareness' },
      { key: 'scout_tac_decision', label: 'Decision Making' },
    ]
  },
  { key: 'psychological', label: 'Psychological', emoji: '🎯', color: 'from-purple-500 to-purple-600',
    fields: [
      { key: 'scout_psy_confidence', label: 'Confidence' },
      { key: 'scout_psy_leadership', label: 'Leadership' },
      { key: 'scout_psy_composure', label: 'Composure' },
      { key: 'scout_psy_work_ethic', label: 'Work Ethic' },
    ]
  },
];

function calcCategoryAvg(scores: Scores, fields: { key: string }[]): number {
  const vals = fields.map((f) => (scores as any)[f.key] as number).filter((v) => v > 0);
  return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
}

function calcOverall(scores: Scores): number {
  const all = Object.values(scores).filter((v) => typeof v === 'number' && v > 0);
  return all.length ? +(all.reduce((a, b) => a + b, 0) / all.length).toFixed(1) : 0;
}

function getRecommendation(overall: number): string {
  if (overall >= 8) return 'sign';
  if (overall >= 6.5) return 'trial_extend';
  if (overall >= 5) return 'monitor';
  return 'pass';
}

function getRecLabel(rec: string): string {
  const map: Record<string, string> = { sign: 'Sign Immediately', trial_extend: 'Extend Trial', monitor: 'Keep Monitoring', pass: 'Pass' };
  return map[rec] || rec;
}

function getRecColor(rec: string): string {
  const map: Record<string, string> = { sign: 'bg-green-100 text-green-800', trial_extend: 'bg-blue-100 text-blue-800', monitor: 'bg-yellow-100 text-yellow-800', pass: 'bg-red-100 text-red-800' };
  return map[rec] || 'bg-slate-100 text-slate-800';
}

function getRatingColor(v: number): string {
  if (v >= 8) return 'text-green-600';
  if (v >= 6) return 'text-blue-600';
  if (v >= 4) return 'text-yellow-600';
  return 'text-red-600';
}

export default function ScoutingEvaluation({ initial, onChange, readOnly }: Props) {
  const [scores, setScores] = useState<Scores>({ ...defaultScores, ...initial });

  const overall = calcOverall(scores);
  const recommendation = getRecommendation(overall);

  useEffect(() => {
    onChange?.({ ...scores, scout_overall_rating: overall, scout_recommendation: recommendation });
  }, [scores]);

  function upd(key: string, val: number) {
    setScores((s) => ({ ...s, [key]: val }));
  }

  return (
    <div className="space-y-5">
      {/* Overall score card */}
      <div className="card p-5 text-center gradient-brand-soft">
        <div className="text-sm font-semibold text-slate-600 mb-1">Overall Rating</div>
        <div className={`text-5xl font-extrabold ${getRatingColor(overall)}`}>{overall}</div>
        <div className="text-xs text-slate-500 mt-1">out of 10</div>
        <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${getRecColor(recommendation)}`}>
          {getRecLabel(recommendation)}
        </div>
      </div>

      {/* Category blocks */}
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const avg = calcCategoryAvg(scores, cat.fields);
          return (
            <div key={cat.key} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-brand-800 flex items-center gap-2">
                  <span className="text-lg">{cat.emoji}</span> {cat.label}
                </h3>
                <div className={`text-lg font-extrabold ${getRatingColor(avg)}`}>{avg}</div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} style={{ width: `${avg * 10}%` }} />
              </div>
              <div className="space-y-3">
                {cat.fields.map((f) => {
                  const val = (scores as any)[f.key] as number;
                  return (
                    <div key={f.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{f.label}</span>
                        <span className={`font-bold ${getRatingColor(val)}`}>{val}/10</span>
                      </div>
                      {readOnly ? (
                        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} style={{ width: `${val * 10}%` }} />
                        </div>
                      ) : (
                        <input type="range" min="1" max="10" value={val}
                          onChange={(e) => upd(f.key, Number(e.target.value))} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Comparison component for comparing 2 prospects */
export function ScoutComparison({ prospects }: { prospects: { name: string; scores: Partial<Scores> }[] }) {
  if (prospects.length < 2) return <p className="text-sm text-slate-500">Select at least 2 prospects to compare.</p>;
  const [a, b] = prospects;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-brand-800">
        <span>{a.name}</span><span>vs</span><span>{b.name}</span>
      </div>
      {categories.map((cat) => (
        <div key={cat.key} className="card p-4">
          <h4 className="text-sm font-bold text-brand-700 mb-3 flex items-center gap-1">{cat.emoji} {cat.label}</h4>
          {cat.fields.map((f) => {
            const va = (a.scores as any)[f.key] ?? 5;
            const vb = (b.scores as any)[f.key] ?? 5;
            const better = va > vb ? 'left' : va < vb ? 'right' : 'tie';
            return (
              <div key={f.key} className="flex items-center gap-2 py-1.5 text-sm">
                <span className={`w-8 text-right font-bold ${better === 'left' ? 'text-green-600' : 'text-slate-600'}`}>{va}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 relative overflow-hidden">
                  <div className="absolute left-0 h-full bg-brand-500 rounded-l-full" style={{ width: `${va * 5}%` }} />
                  <div className="absolute right-0 h-full bg-blue-500 rounded-r-full" style={{ width: `${vb * 5}%` }} />
                </div>
                <span className={`w-8 font-bold ${better === 'right' ? 'text-green-600' : 'text-slate-600'}`}>{vb}</span>
                <span className="w-24 text-xs text-slate-500 truncate">{f.label}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
