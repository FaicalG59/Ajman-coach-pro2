export type PlayerStatus = 'fit' | 'injured' | 'recovering' | 'inactive';
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type InjurySeverity = 'minor' | 'moderate' | 'severe';
export type InjuryStatus = 'active' | 'recovered';
export type AgeGroup = 'U6'|'U7'|'U8'|'U9'|'U10'|'U11'|'U12'|'U13'|'U14'|'U15'|'U16'|'U17'|'U18'|'U19'|'U20'|'U21'|'U22'|'U23'|'Senior';
export type RecruitmentStatus = 'interested' | 'contacted' | 'trial' | 'signed' | 'rejected' | 'not_interested';
export type ScoutRecommendation = 'sign' | 'trial_extend' | 'monitor' | 'pass';
export type CoachRole = 'coach' | 'admin';

export const AGE_GROUPS: AgeGroup[] = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior'];
export const POSITIONS: PlayerPosition[] = ['GK','DEF','MID','FWD'];
export const FORMATIONS = ['4-3-3','4-2-3-1','3-5-2','5-3-2','4-4-2','3-4-3','4-1-4-1','5-4-1'] as const;

export interface Coach {
  id: string; email: string; full_name: string; club_name: string | null;
  phone_whatsapp: string | null; role: CoachRole; created_at: string;
}

export interface Team {
  id: string; coach_id: string; name: string; age_group: AgeGroup | null;
  division: string | null; logo_url: string | null; created_at: string;
}

export interface Player {
  id: string; coach_id: string; team_id: string | null;
  first_name: string; last_name: string; date_of_birth: string;
  position: PlayerPosition; age_group: AgeGroup | null;
  jersey_number: number | null; height_cm: number | null; weight_kg: number | null;
  nationality: string | null; whatsapp_number: string | null;
  photo_url: string | null; photo_bucket_path: string | null;
  status: PlayerStatus; notes: string | null;
  created_at: string; updated_at: string;
}

export interface Injury {
  id: string; player_id: string; coach_id: string;
  injury_type: string; body_part: string; severity: InjurySeverity;
  injury_date: string; expected_recovery_days: number;
  expected_return_date: string; actual_return_date: string | null;
  status: InjuryStatus; notes: string | null; created_at: string;
}

export interface Performance {
  id: string; player_id: string; team_id: string | null; coach_id: string;
  match_date: string; opponent: string; minutes_played: number;
  goals: number; assists: number; passes_completed: number; passes_attempted: number;
  tackles: number; shots: number; shots_on_target: number;
  rating: number | null; notes: string | null; created_at: string;
}

export interface Session {
  id: string; team_id: string | null; coach_id: string;
  title: string; session_date: string; duration_minutes: number;
  focus_area: string; location: string | null; coach_notes: string | null;
  tactical_setup: string | null; sections: SessionSection[] | null; created_at: string;
}

export interface SessionSection {
  id: string; title: string; duration_minutes: number;
  description: string; formation: string;
  elements: PitchElement[];
}

export interface PitchElement {
  id: string; type: 'player' | 'ball' | 'cone' | 'minigoal' | 'arrow' | 'dashed';
  x: number; y: number; x2?: number; y2?: number;
  label?: string; color?: string; rotation?: number; scale?: number;
}

export interface SessionPlayer {
  session_id: string; player_id: string; attended: boolean; individual_notes: string | null;
}

export interface Evaluation {
  id: string; player_id: string; coach_id: string; evaluation_date: string;
  tech_first_touch: number | null; tech_passing: number | null;
  tech_shooting: number | null; tech_dribbling: number | null;
  tac_positioning: number | null; tac_decision_making: number | null; tac_game_reading: number | null;
  phy_speed: number | null; phy_strength: number | null; phy_endurance: number | null;
  men_concentration: number | null; men_confidence: number | null; men_teamwork: number | null;
  strengths: string | null; areas_to_improve: string | null; general_notes: string | null;
  created_at: string;
}

export interface Recruitment {
  id: string; coach_id: string; first_name: string; last_name: string;
  age_group: AgeGroup | null; position: PlayerPosition | null;
  phone_number: string | null; whatsapp_number: string | null; email: string | null;
  club_origin: string | null; notes: string | null;
  photo_url: string | null; photo_bucket_path: string | null;
  status: RecruitmentStatus;
  contacted_date: string | null; trial_date: string | null;
  // Scouting scores
  scout_tech_ball_control: number | null; scout_tech_passing: number | null;
  scout_tech_shooting: number | null; scout_tech_dribbling: number | null;
  scout_phy_speed: number | null; scout_phy_strength: number | null;
  scout_phy_endurance: number | null; scout_phy_agility: number | null;
  scout_tac_positioning: number | null; scout_tac_awareness: number | null; scout_tac_decision: number | null;
  scout_psy_confidence: number | null; scout_psy_leadership: number | null;
  scout_psy_composure: number | null; scout_psy_work_ethic: number | null;
  scout_overall_rating: number | null;
  scout_recommendation: ScoutRecommendation | null;
  created_at: string; updated_at: string;
}

export interface VideoAnalysis {
  id: string; coach_id: string; team_id: string | null; player_id: string | null;
  title: string; video_url: string | null; video_bucket_path: string | null;
  duration_seconds: number | null;
  annotations: VideoAnnotation[]; ai_summary: string | null;
  tags: string[]; created_at: string;
}

export interface VideoAnnotation {
  id: string; timestamp_seconds: number; type: 'pass' | 'shot' | 'tackle' | 'goal' | 'foul' | 'note';
  text: string; x?: number; y?: number;
}
