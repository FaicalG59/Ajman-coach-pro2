import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('recruitment').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const scoutFields = [
    'scout_tech_ball_control','scout_tech_passing','scout_tech_shooting','scout_tech_dribbling',
    'scout_phy_speed','scout_phy_strength','scout_phy_endurance','scout_phy_agility',
    'scout_tac_positioning','scout_tac_awareness','scout_tac_decision',
    'scout_psy_confidence','scout_psy_leadership','scout_psy_composure','scout_psy_work_ethic',
    'scout_overall_rating','scout_recommendation',
  ];
  const payload: Record<string, any> = {
    coach_id: user.id,
    first_name: body.first_name, last_name: body.last_name,
    age_group: body.age_group || null, position: body.position || null,
    phone_number: body.phone_number || null, whatsapp_number: body.whatsapp_number || null,
    email: body.email || null, club_origin: body.club_origin || null,
    notes: body.notes || null, photo_url: body.photo_url || null,
    photo_bucket_path: body.photo_bucket_path || null,
    status: body.status || 'interested',
    contacted_date: body.contacted_date || null, trial_date: body.trial_date || null,
  };
  for (const f of scoutFields) if (f in body) payload[f] = body[f];

  const { data, error } = await supabase.from('recruitment').insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
