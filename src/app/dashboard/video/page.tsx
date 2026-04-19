'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Badge from '@/components/Badge';
import { Upload, Play, Pause, SkipBack, SkipForward, Plus, Tag, Trash2, Video } from 'lucide-react';
import type { VideoAnalysis, VideoAnnotation, Player, Team } from '@/lib/types';

function uid() { return Math.random().toString(36).slice(2, 8); }

export default function VideoAnalysisPage() {
  const supabase = createClient();
  const [videos, setVideos] = useState<VideoAnalysis[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoAnalysis | null>(null);
  const [form, setForm] = useState({ title: '', video_url: '', team_id: '', player_id: '', tags: '' });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([]);
  const [newTag, setNewTag] = useState<{ type: string; text: string }>({ type: 'note', text: '' });

  async function load() {
    setLoading(true);
    const [v, p, t] = await Promise.all([
      supabase.from('video_analyses').select('*').order('created_at', { ascending: false }),
      supabase.from('players').select('id,first_name,last_name'),
      supabase.from('teams').select('id,name'),
    ]);
    setVideos((v.data ?? []) as VideoAnalysis[]);
    setPlayers((p.data ?? []) as Player[]);
    setTeams((t.data ?? []) as Team[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createVideo(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('video_analyses').insert({
      coach_id: user.id,
      title: form.title,
      video_url: form.video_url || null,
      team_id: form.team_id || null,
      player_id: form.player_id || null,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
    });
    if (!error) { setModal(false); setForm({ title: '', video_url: '', team_id: '', player_id: '', tags: '' }); load(); }
  }

  function openVideo(v: VideoAnalysis) {
    setActiveVideo(v);
    setAnnotations(v.annotations || []);
    setCurrent(0);
  }

  function addAnnotation() {
    if (!newTag.text.trim()) return;
    const ann: VideoAnnotation = {
      id: uid(),
      timestamp_seconds: Math.floor(currentTime),
      type: newTag.type as any,
      text: newTag.text,
    };
    const next = [...annotations, ann].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);
    setAnnotations(next);
    setNewTag({ type: 'note', text: '' });
    // Auto-save
    if (activeVideo) {
      supabase.from('video_analyses').update({ annotations: next }).eq('id', activeVideo.id);
    }
  }

  function removeAnnotation(id: string) {
    const next = annotations.filter((a) => a.id !== id);
    setAnnotations(next);
    if (activeVideo) {
      supabase.from('video_analyses').update({ annotations: next }).eq('id', activeVideo.id);
    }
  }

  function seekTo(seconds: number) {
    if (videoRef.current) { videoRef.current.currentTime = seconds; }
  }

  function step(delta: number) {
    if (videoRef.current) { videoRef.current.currentTime += delta; }
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const tagTypes = ['pass', 'shot', 'tackle', 'goal', 'foul', 'note'] as const;
  const tagColors: Record<string, string> = {
    pass: 'bg-blue-100 text-blue-800', shot: 'bg-orange-100 text-orange-800',
    tackle: 'bg-yellow-100 text-yellow-800', goal: 'bg-green-100 text-green-800',
    foul: 'bg-red-100 text-red-800', note: 'bg-slate-100 text-slate-800',
  };

  async function deleteVideo(id: string) {
    if (!confirm('Delete this video analysis?')) return;
    await supabase.from('video_analyses').delete().eq('id', id);
    if (activeVideo?.id === id) setActiveVideo(null);
    load();
  }

  // Video player view
  if (activeVideo) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <button onClick={() => setActiveVideo(null)} className="text-sm text-brand-600 font-semibold hover:underline">← Back to videos</button>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{activeVideo.title}</h1>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {activeVideo.video_url ? (
              <div className="rounded-xl overflow-hidden card">
                <video ref={videoRef} src={activeVideo.video_url}
                  className="w-full aspect-video bg-black"
                  onTimeUpdate={() => setCurrent(videoRef.current?.currentTime ?? 0)}
                  onEnded={() => setPlaying(false)}
                />
                <div className="flex items-center gap-2 p-3">
                  <button onClick={() => step(-5)} className="p-2 rounded hover:bg-brand-50"><SkipBack size={16} /></button>
                  <button onClick={() => step(-1 / 30)} className="p-2 rounded hover:bg-brand-50 text-xs font-mono">-1f</button>
                  <button onClick={togglePlay} className="p-2 rounded-lg gradient-brand text-white">
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button onClick={() => step(1 / 30)} className="p-2 rounded hover:bg-brand-50 text-xs font-mono">+1f</button>
                  <button onClick={() => step(5)} className="p-2 rounded hover:bg-brand-50"><SkipForward size={16} /></button>
                  <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-secondary)' }}>{formatTime(currentTime)}</span>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Video size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No video URL. Add one to start analysis.</p>
              </div>
            )}

            {/* Add annotation */}
            <div className="card p-4">
              <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Add annotation at {formatTime(currentTime)}</h3>
              <div className="flex gap-2 flex-wrap">
                <select value={newTag.type} onChange={(e) => setNewTag({ ...newTag, type: e.target.value })} className="input-base w-28 py-1.5 text-xs">
                  {tagTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={newTag.text} onChange={(e) => setNewTag({ ...newTag, text: e.target.value })}
                  className="input-base flex-1 py-1.5 text-xs" placeholder="Description..." />
                <Button size="sm" onClick={addAnnotation}>Add</Button>
              </div>
            </div>
          </div>

          {/* Annotations sidebar */}
          <div className="card p-4 max-h-[600px] overflow-y-auto scrollbar-thin">
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              Annotations ({annotations.length})
            </h3>
            {annotations.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No annotations yet. Play the video and add tags.</p>
            ) : (
              <ul className="space-y-2">
                {annotations.map((ann) => (
                  <li key={ann.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-700 cursor-pointer group"
                    onClick={() => seekTo(ann.timestamp_seconds)}
                  >
                    <span className="text-xs font-mono font-bold text-brand-600 shrink-0 mt-0.5 w-10">{formatTime(ann.timestamp_seconds)}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tagColors[ann.type]}`}>{ann.type}</span>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{ann.text}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id); }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 p-1"><Trash2 size={12} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Video list view
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Video Analysis</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Upload, annotate, and analyze match footage</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus size={16} /> New Video</Button>
      </div>

      {loading ? <div className="card p-8 text-center text-sm">Loading…</div> : videos.length === 0 ? (
        <div className="card p-12 text-center">
          <Video size={48} className="mx-auto mb-3 opacity-30" />
          <p style={{ color: 'var(--text-secondary)' }}>No video analyses yet. Add your first match footage.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <div key={v.id} className="card p-4 card-hover cursor-pointer group" onClick={() => openVideo(v)}>
              <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 overflow-hidden">
                {v.video_url ? (
                  <video src={v.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                ) : (
                  <Video size={32} className="opacity-30" />
                )}
              </div>
              <h3 className="font-bold text-sm group-hover:text-brand-600 transition" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
              <div className="flex gap-1 mt-2 flex-wrap">
                {v.tags?.map((t, i) => <Badge key={i} variant="brand">{t}</Badge>)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v.annotations?.length || 0} annotations</span>
                <button onClick={(e) => { e.stopPropagation(); deleteVideo(v.id); }} className="text-red-500 text-xs hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Video Analysis">
        <form onSubmit={createVideo} className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Match vs Al Ain" />
          <Input label="Video URL" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://… (MP4, WebM)" />
          <div className="grid md:grid-cols-2 gap-3">
            <Select label="Team" value={form.team_id} onChange={(e) => setForm({ ...form, team_id: e.target.value })}>
              <option value="">All teams</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Select label="Player" value={form.player_id} onChange={(e) => setForm({ ...form, player_id: e.target.value })}>
              <option value="">All players</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
            </Select>
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="match, set-piece, goal" />
          <Button type="submit">Create</Button>
        </form>
      </Modal>
    </div>
  );
}
