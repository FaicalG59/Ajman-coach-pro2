'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { Performance } from '@/lib/types';

export default function PerformanceChart({ data }: { data: Performance[] }) {
  const rows = [...data]
    .sort((a, b) => a.match_date.localeCompare(b.match_date))
    .map((p) => ({
      date: p.match_date.slice(5),
      rating: p.rating ?? 0,
      goals: p.goals,
      assists: p.assists,
    }));

  if (!rows.length) {
    return <p className="text-sm text-slate-500 text-center py-6">No performance data yet.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#FFEDD5" />
          <XAxis dataKey="date" stroke="#92400e" fontSize={12} />
          <YAxis stroke="#92400e" fontSize={12} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #FDBA74', borderRadius: 8 }} />
          <Legend />
          <Line type="monotone" dataKey="rating" stroke="#EA580C" strokeWidth={3} dot={{ r: 4, fill: '#EA580C' }} />
          <Line type="monotone" dataKey="goals" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="assists" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
