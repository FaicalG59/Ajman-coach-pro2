import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('sessions').select('*').order('session_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { player_ids, sections, ...sessionData } = body;

  const { data: session, error } = await supabase.from('sessions').insert({
    coach_id: user.id,
    team_id: sessionData.team_id || null,
    title: sessionData.title,
    session_date: sessionData.session_date,
    duration_minutes: Number(sessionData.duration_minutes) || 90,
    focus_area: sessionData.focus_area,
    location: sessionData.location || null,
    coach_notes: sessionData.coach_notes || null,
    tactical_setup: sessionData.tactical_setup || null,
    sections: sections || [],
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(player_ids) && player_ids.length > 0) {
    const rows = player_ids.map((pid: string) => ({ session_id: session.id, player_id: pid, attended: true }));
    await supabase.from('session_players').insert(rows);
  }

  return NextResponse.json(session);
}
