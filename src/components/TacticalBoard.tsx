'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Undo2, Redo2, Trash2, Download } from 'lucide-react';
import type { PitchElement } from '@/lib/types';
import { FORMATIONS } from '@/lib/types';

interface Props {
  initialElements?: PitchElement[];
  initialFormation?: string;
  onChange?: (elements: PitchElement[], formation: string) => void;
  onSave?: (setup: string) => void;
  readOnly?: boolean;
}

type ToolType = 'select' | 'player' | 'ball' | 'cone' | 'minigoal' | 'arrow' | 'dashed';

const TOOL_COLORS: Record<string, string> = {
  player: '#EA580C', ball: '#1e293b', cone: '#eab308', minigoal: '#dc2626',
  arrow: '#2563eb', dashed: '#16a34a',
};

function uid() { return Math.random().toString(36).slice(2, 8); }

export default function TacticalBoard({ initialElements = [], initialFormation = '4-3-3', onChange, onSave, readOnly }: Props) {
  const [formation, setFormation] = useState(initialFormation);
  const [elements, setElements] = useState<PitchElement[]>(initialElements);
  const [tool, setTool] = useState<ToolType>('select');
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<PitchElement[][]>([initialElements]);
  const [histIdx, setHistIdx] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const pushHistory = useCallback((els: PitchElement[]) => {
    setHistory((h) => [...h.slice(0, histIdx + 1), els]);
    setHistIdx((i) => i + 1);
  }, [histIdx]);

  function undo() {
    if (histIdx <= 0) return;
    setHistIdx((i) => i - 1);
    setElements(history[histIdx - 1]);
  }
  function redo() {
    if (histIdx >= history.length - 1) return;
    setHistIdx((i) => i + 1);
    setElements(history[histIdx + 1]);
  }

  useEffect(() => { onChange?.(elements, formation); }, [elements, formation]);

  function getSvgPoint(e: React.MouseEvent | React.TouchEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }

  function handlePointerDown(e: React.MouseEvent<SVGSVGElement>) {
    if (readOnly) return;
    const pt = getSvgPoint(e);
    if (tool === 'select') {
      const hit = [...elements].reverse().find((el) => {
        const dx = el.x - pt.x, dy = el.y - pt.y;
        return Math.sqrt(dx * dx + dy * dy) < 4;
      });
      if (hit) { setSelected(hit.id); setDragging(hit.id); }
      else setSelected(null);
    } else if (tool === 'arrow' || tool === 'dashed') {
      setDrawStart(pt);
    } else {
      const newEl: PitchElement = { id: uid(), type: tool, x: pt.x, y: pt.y, color: TOOL_COLORS[tool] };
      const next = [...elements, newEl];
      setElements(next);
      pushHistory(next);
    }
  }

  function handlePointerMove(e: React.MouseEvent<SVGSVGElement>) {
    if (readOnly) return;
    if (dragging) {
      const pt = getSvgPoint(e);
      setElements((els) => els.map((el) => el.id === dragging ? { ...el, x: pt.x, y: pt.y } : el));
    }
  }

  function handlePointerUp(e: React.MouseEvent<SVGSVGElement>) {
    if (dragging) {
      setDragging(null);
      pushHistory(elements);
    }
    if (drawStart && (tool === 'arrow' || tool === 'dashed')) {
      const pt = getSvgPoint(e);
      const newEl: PitchElement = {
        id: uid(), type: tool, x: drawStart.x, y: drawStart.y,
        x2: pt.x, y2: pt.y, color: TOOL_COLORS[tool],
      };
      const next = [...elements, newEl];
      setElements(next);
      pushHistory(next);
      setDrawStart(null);
    }
  }

  function deleteSelected() {
    if (!selected) return;
    const next = elements.filter((el) => el.id !== selected);
    setElements(next);
    setSelected(null);
    pushHistory(next);
  }

  function clearAll() {
    setElements([]);
    setSelected(null);
    pushHistory([]);
  }

  function exportSvg() {
    if (!svgRef.current) return;
    const data = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tactical-${formation}.svg`; a.click();
    URL.revokeObjectURL(url);
  }

  const tools: { type: ToolType; label: string; icon: string }[] = [
    { type: 'select', label: 'Select', icon: '👆' },
    { type: 'player', label: 'Player', icon: '🟠' },
    { type: 'ball', label: 'Ball', icon: '⚽' },
    { type: 'cone', label: 'Cone', icon: '🔺' },
    { type: 'minigoal', label: 'Mini Goal', icon: '🥅' },
    { type: 'arrow', label: 'Arrow', icon: '➡️' },
    { type: 'dashed', label: 'Pass line', icon: '- -' },
  ];

  return (
    <div className="space-y-3">
      {/* Formation selector */}
      <div className="flex gap-1.5 flex-wrap">
        {FORMATIONS.map((f) => (
          <button key={f} type="button" onClick={() => setFormation(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              formation === f ? 'gradient-brand text-white shadow-glow-orange' : 'card text-slate-600 hover:bg-brand-50'
            }`}
          >{f}</button>
        ))}
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 flex-wrap card p-2">
          {tools.map((t) => (
            <button key={t.type} type="button" onClick={() => setTool(t.type)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                tool === t.type ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 text-slate-600'
              }`}
            ><span>{t.icon}</span> {t.label}</button>
          ))}
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={undo} className="p-1.5 rounded hover:bg-brand-50 text-slate-500" title="Undo"><Undo2 size={16} /></button>
            <button type="button" onClick={redo} className="p-1.5 rounded hover:bg-brand-50 text-slate-500" title="Redo"><Redo2 size={16} /></button>
            <button type="button" onClick={deleteSelected} disabled={!selected} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30" title="Delete"><Trash2 size={16} /></button>
            <button type="button" onClick={exportSvg} className="p-1.5 rounded hover:bg-brand-50 text-slate-500" title="Export SVG"><Download size={16} /></button>
          </div>
        </div>
      )}

      {/* Pitch SVG */}
      <svg ref={svgRef} viewBox="0 0 100 65" className="w-full rounded-xl border-2 border-green-700 bg-green-600 cursor-crosshair select-none"
        onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Pitch markings */}
        <rect x="2" y="2" width="96" height="61" fill="none" stroke="white" strokeWidth="0.4" rx="1" />
        <line x1="50" y1="2" x2="50" y2="63" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="32.5" r="9" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="32.5" r="0.6" fill="white" />
        {/* Left penalty area */}
        <rect x="2" y="15" width="14" height="35" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="2" y="22" width="5" height="21" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="12" cy="32.5" r="0.5" fill="white" />
        {/* Right penalty area */}
        <rect x="84" y="15" width="14" height="35" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="93" y="22" width="5" height="21" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="88" cy="32.5" r="0.5" fill="white" />
        {/* Goals */}
        <rect x="0" y="27" width="2" height="11" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="98" y="27" width="2" height="11" fill="none" stroke="white" strokeWidth="0.5" />

        {/* Formation label */}
        <text x="50" y="5" textAnchor="middle" fontSize="2" fill="rgba(255,255,255,0.5)" fontWeight="bold">{formation}</text>

        {/* Rendered elements */}
        {elements.map((el) => {
          const isSelected = el.id === selected;
          const outline = isSelected ? 'yellow' : 'transparent';

          if (el.type === 'player') {
            return (
              <g key={el.id}>
                <circle cx={el.x} cy={el.y} r={2.5} fill={el.color || '#EA580C'} stroke={outline} strokeWidth="0.5" opacity={0.9} />
                {el.label && <text x={el.x} y={el.y + 0.6} textAnchor="middle" fontSize="1.5" fill="white" fontWeight="bold">{el.label}</text>}
              </g>
            );
          }
          if (el.type === 'ball') {
            return <circle key={el.id} cx={el.x} cy={el.y} r={1.2} fill="white" stroke={isSelected ? 'yellow' : '#333'} strokeWidth="0.3" />;
          }
          if (el.type === 'cone') {
            return (
              <polygon key={el.id} points={`${el.x},${el.y - 1.5} ${el.x - 1.2},${el.y + 1} ${el.x + 1.2},${el.y + 1}`}
                fill={el.color || '#eab308'} stroke={outline} strokeWidth="0.3" />
            );
          }
          if (el.type === 'minigoal') {
            return <rect key={el.id} x={el.x - 2} y={el.y - 1.5} width={4} height={3} rx={0.3}
              fill="none" stroke={el.color || '#dc2626'} strokeWidth="0.5" />;
          }
          if (el.type === 'arrow' && el.x2 !== undefined && el.y2 !== undefined) {
            return (
              <g key={el.id}>
                <defs><marker id={`ah-${el.id}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                  <path d="M0,0 L4,2 L0,4 Z" fill={el.color || '#2563eb'} />
                </marker></defs>
                <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.color || '#2563eb'}
                  strokeWidth={isSelected ? '0.8' : '0.5'} markerEnd={`url(#ah-${el.id})`} />
              </g>
            );
          }
          if (el.type === 'dashed' && el.x2 !== undefined && el.y2 !== undefined) {
            return (
              <line key={el.id} x1={el.x} y1={el.y} x2={el.x2} y2={el.y2}
                stroke={el.color || '#16a34a'} strokeWidth={isSelected ? '0.6' : '0.4'} strokeDasharray="1.5,1" />
            );
          }
          return null;
        })}
      </svg>

      <div className="text-xs text-slate-500 text-center">
        Click to place elements · Drag to move · Arrow/Dashed: click start → click end
      </div>

      {onSave && (
        <button type="button" onClick={() => onSave(JSON.stringify({ formation, elements }))}
          className="px-4 py-2 gradient-brand text-white rounded-lg font-semibold shadow-glow-orange hover:opacity-90 transition"
        >Save Tactical Setup</button>
      )}
    </div>
  );
}
