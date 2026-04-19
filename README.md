# Ajman Coach Pro v3.0

Professional football player management system for coaches in Ajman, UAE.

## What's new in v3.0

### Fixed Issues
- Dashboard: removed broken Award component, fixed rendering
- Dark mode: full CSS variable system, toggle in sidebar
- Components: all UI elements support light + dark themes
- Auth: admin role support with `is_admin()` RLS function
- Forms: proper photo upload with preview and clear

### Training Session Builder
- 4 collapsible sections (Warm-up, Technical, Tactical, Match Play)
- Each section has its own **full football pitch** (SVG canvas)
- **Drawing tools**: Players, Balls, Cones, Mini Goals, Arrows, Dashed lines
- **Drag & drop** elements on the pitch
- **Undo / Redo** history
- Export pitch to SVG
- Formation selector: 4-3-3, 4-2-3-1, 3-5-2, 5-3-2, 4-4-2, 3-4-3, 4-1-4-1, 5-4-1

### Scouting System
- 4 evaluation categories: Technical, Physical, Tactical, Psychological
- **15 rating sliders** (1–10 scale)
- **Automatic overall score** calculation
- **Automatic recommendation**: Sign / Extend Trial / Monitor / Pass
- Pipeline visualization with pie chart
- Star ratings on prospect cards

### Auth & Permissions
- Coach role: sees only their own teams/players
- Admin role: sees all data across all coaches
- `is_admin()` Postgres function + updated RLS policies
- No data leaks between coaches

### Video Analysis
- Upload video URLs (MP4, WebM)
- **Frame-by-frame navigation** (±1 frame, ±5 seconds)
- **Annotation system**: tag moments as pass/shot/tackle/goal/foul/note
- Annotations auto-save to database
- Click annotation to seek to timestamp
- Tag-based organization

### Dark Mode
- Toggle in sidebar footer
- Persists via localStorage
- CSS variable system (no Tailwind dark: prefix needed)
- All components support both themes

### Team Management
- Team detail page with squad view
- Position distribution pie chart
- Status breakdown pie chart
- Team-specific stats (goals, avg rating)

---

## Setup Guide

### 1. Install dependencies
```bash
cd ajman-coach-pro
npm install
```

### 2. Create Supabase project
Go to [supabase.com](https://supabase.com) → New Project (free tier works).

### 3. Run database schema
Supabase Dashboard → **SQL Editor** → paste `supabase/schema.sql` → Run.

Creates 10 tables: coaches, teams, players, injuries, performances, sessions, session_players, evaluations, recruitment, video_analyses.

### 4. Create Storage buckets
Supabase → **Storage** → Create 2 **public** buckets:
- `player_photos`
- `recruitment_photos`

### 5. Set environment variables
```bash
cp .env.example .env.local
```
Fill from Supabase Dashboard → Project Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 6. Disable email confirmation (dev only)
Supabase → Authentication → Providers → Email → turn OFF "Confirm email".

### 7. Run locally
```bash
npm run dev
```
Open http://localhost:3000 → Create Account → Dashboard.

### Common errors
- **"relation does not exist"** → Run schema.sql in SQL Editor
- **Photos not uploading** → Create Storage buckets + make them public
- **Auth loop** → Clear cookies, check .env.local keys
- **RLS errors** → Verify policies exist (run schema.sql again)

---

## Deployment Guide

### Option 1: Vercel (recommended, free)

1. Push to GitHub:
```bash
git init && git add . && git commit -m "init"
gh repo create ajman-coach --public --push
```

2. Go to [vercel.com](https://vercel.com) → Import repository

3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy (auto-detects Next.js)

### Option 2: Netlify (free)

1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Site Settings → Environment Variables

### Database: Supabase (free)
- Already cloud-hosted, no extra deployment needed
- Free tier: 500MB database, 1GB storage, 50K monthly active users

### Make a coach admin
Run in Supabase SQL Editor:
```sql
UPDATE public.coaches SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Project Structure

```
ajman-coach-pro/
├── public/                    Static assets + Ajman logo
├── src/
│   ├── app/
│   │   ├── (auth)/            Login + Signup
│   │   ├── api/               15 API routes
│   │   └── dashboard/
│   │       ├── page.tsx       Dashboard (3 pie charts + stats)
│   │       ├── teams/         Team management + detail
│   │       ├── players/       Player CRUD + photo upload
│   │       ├── injuries/      Injury tracking
│   │       ├── performance/   Match stats + team analytics
│   │       ├── sessions/      Training builder (4 sections)
│   │       ├── video/         Video analysis + annotations
│   │       ├── reports/       PDF generation
│   │       └── scouting/      Recruitment pipeline + evaluation
│   ├── components/
│   │   ├── TacticalBoard.tsx  SVG pitch with drag & drop
│   │   ├── SessionBuilder.tsx 4-section session builder
│   │   ├── ScoutingEvaluation.tsx  15-slider rating system
│   │   └── ...                18 reusable components
│   └── lib/
│       ├── types.ts           All TypeScript interfaces
│       ├── utils.ts           Helper functions
│       ├── supabase/          Auth clients (browser + server)
│       └── pdf/               Report generator
├── supabase/schema.sql        Database + RLS policies
└── .env.example               Config template
```

---

## Tech Stack
Next.js 14 · TypeScript · TailwindCSS · Supabase · @react-pdf/renderer · Recharts · lucide-react

---

Built for Ajman Club coaches 🇦🇪⚽
# Ajman-coach-
