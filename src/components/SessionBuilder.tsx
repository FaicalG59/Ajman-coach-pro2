'use client';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import TacticalBoard from './TacticalBoard';
import Input from './Input';
import type { SessionSection, PitchElement } from '@/lib/types';

function uid() { return Math.random().toString(36).slice(2, 8); }

const defaultSections: SessionSection[] = [
  { id: uid(), title: 'Warm-up', duration_minutes: 15, description: '', formation: '4-3-3', elements: [] },
  { id: uid(), title: 'Technical Drills', duration_minutes: 20, description: '', formation: '4-3-3', elements: [] },
  { id: uid(), title: 'Tactical Work', duration_minutes: 25, description: '', formation: '4-3-3', elements: [] },
  { id: uid(), title: 'Match Play / Cool-down', duration_minutes: 20, description: '', formation: '4-3-3', elements: [] },
];

export default function SessionBuilder({ initial, onChange }: {
  initial?: SessionSection[];
  onChange?: (sections: SessionSection[]) => void;
}) {
  const [sections, setSections] = useState<SessionSection[]>(initial?.length ? initial : defaultSections);
  const [expandedIdx, setExpandedIdx] = useState<number>(0);

  function update(idx: number, partial: Partial<SessionSection>) {
    const next = sections.map((s, i) => i === idx ? { ...s, ...partial } : s);
    setSections(next);
    onChange?.(next);
  }

  function addSection() {
    const next = [...sections, {
      id: uid(), title: `Section ${sections.length + 1}`, duration_minutes: 15,
      description: '', formation: '4-3-3', elements: [],
    }];
    setSections(next);
    setExpandedIdx(next.length - 1);
    onChange?.(next);
  }

  function removeSection(idx: number) {
    if (sections.length <= 1) return;
    const next = sections.filter((_, i) => i !== idx);
    setSections(next);
    if (expandedIdx >= next.length) setExpandedIdx(next.length - 1);
    onChange?.(next);
  }

  const totalMinutes = sections.reduce((s, sec) => s + sec.duration_minutes, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-brand-800">Session Sections</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {sections.length} sections · {totalMinutes} min total
          </p>
        </div>
        <button type="button" onClick={addSection}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg gradient-brand text-white shadow-glow-orange"
        ><Plus size={14} /> Add Section</button>
      </div>

      {sections.map((sec, idx) => {
        const isExpanded = expandedIdx === idx;
        return (
          <div key={sec.id} className="card overflow-hidden">
            <button type="button" onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
              className="w-full flex items-center justify-between px-4 py-3 gradient-brand-soft hover:opacity-90 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="text-left">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{sec.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sec.duration_minutes} min · {sec.formation}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {sections.length > 1 && (
                  <span onClick={(e) => { e.stopPropagation(); removeSection(idx); }}
                    className="p-1 rounded hover:bg-red-100 text-red-500"><Trash2 size={14} /></span>
                )}
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <Input label="Section Title" value={sec.title}
                    onChange={(e) => update(idx, { title: e.target.value })} />
                  <Input label="Duration (min)" type="number" min={5} value={sec.duration_minutes}
                    onChange={(e) => update(idx, { duration_minutes: Number(e.target.value) })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Description / Instructions</label>
                  <textarea className="input-base min-h-[70px]" value={sec.description}
                    onChange={(e) => update(idx, { description: e.target.value })}
                    placeholder="Drill details, focus points, player instructions..."
                  />
                </div>
                <div>
                  <label className="label mb-2 block">Tactical Pitch</label>
                  <TacticalBoard
                    initialFormation={sec.formation}
                    initialElements={sec.elements}
                    onChange={(elements, formation) => update(idx, { elements, formation })}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
