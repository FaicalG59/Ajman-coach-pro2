'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import PhotoUpload from '@/components/PhotoUpload';
import type { Player, AgeGroup } from '@/lib/types';

const ageGroups: AgeGroup[] = ['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','U21','U22','U23','Senior'];

type FormData = Partial<Player>;

export default function PlayerForm({ initial, teams }: { initial?: Player; teams?: any[] }) {
  const router = useRouter();
  const [data, setData] = useState<FormData>(
    initial ?? {
      first_name: '', last_name: '', date_of_birth: '',
      position: 'MID' as const, team_id: null, age_group: 'U13' as AgeGroup,
      jersey_number: null, height_cm: null, weight_kg: null,
      nationality: '', whatsapp_number: '', photo_url: '', status: 'fit' as const, notes: '',
    }
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function upd<K extends keyof FormData>(key: K, val: FormData[K]) {
    setData((d) => ({ ...d, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let photo_url = initial?.photo_url ?? null;
    let photo_bucket_path = initial?.photo_bucket_path ?? null;

    if (file) {
      const bucket = 'player_photos';
      const path = `${Date.now()}-${file.name}`;
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/upload?bucket=${bucket}&path=${path}`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) { setLoading(false); return setError('Photo upload failed'); }
      photo_bucket_path = path;
      photo_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    }

    const url = initial ? `/api/players/${initial.id}` : '/api/players';
    const method = initial ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, photo_url, photo_bucket_path }),
    });

    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return setError(j.error || 'Failed');
    }
    const saved = await res.json();
    router.push(`/dashboard/players/${initial ? initial.id : saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="First name" required value={data.first_name ?? ''} onChange={(e) => upd('first_name', e.target.value)} />
        <Input label="Last name" required value={data.last_name ?? ''} onChange={(e) => upd('last_name', e.target.value)} />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Input label="Date of birth" type="date" required value={data.date_of_birth ?? ''} onChange={(e) => upd('date_of_birth', e.target.value)} />
        <Select label="Position" required value={data.position ?? 'MID'} onChange={(e) => upd('position', e.target.value as any)}>
          <option value="GK">Goalkeeper</option>
          <option value="DEF">Defender</option>
          <option value="MID">Midfielder</option>
          <option value="FWD">Forward</option>
        </Select>
        <Select label="Age group" value={data.age_group ?? ''} onChange={(e) => upd('age_group', e.target.value as AgeGroup)}>
          <option value="">Select age group</option>
          {ageGroups.map((ag) => (
            <option key={ag} value={ag}>{ag}</option>
          ))}
        </Select>
        {teams && (
          <Select label="Team" value={data.team_id ?? ''} onChange={(e) => upd('team_id', e.target.value || null)}>
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Input label="Jersey #" type="number" min={1} max={99} value={data.jersey_number ?? ''} onChange={(e) => upd('jersey_number', e.target.value ? Number(e.target.value) : null)} />
        <Input label="Height (cm)" type="number" step={0.1} value={data.height_cm ?? ''} onChange={(e) => upd('height_cm', e.target.value ? Number(e.target.value) : null)} />
        <Input label="Weight (kg)" type="number" step={0.1} value={data.weight_kg ?? ''} onChange={(e) => upd('weight_kg', e.target.value ? Number(e.target.value) : null)} />
        <Input label="Nationality" value={data.nationality ?? ''} onChange={(e) => upd('nationality', e.target.value)} />
      </div>

      <Input label="WhatsApp number" value={data.whatsapp_number ?? ''} onChange={(e) => upd('whatsapp_number', e.target.value)} placeholder="+971..." />

      <div className="grid md:grid-cols-2 gap-4">
        <Select label="Status" value={data.status ?? 'fit'} onChange={(e) => upd('status', e.target.value as any)}>
          <option value="fit">Fit</option>
          <option value="injured">Injured</option>
          <option value="recovering">Recovering</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      <PhotoUpload onFile={setFile} preview={initial?.photo_url || undefined} />

      <div className="flex flex-col gap-1.5">
        <label className="label">Notes</label>
        <textarea
          className="input-base min-h-[88px]"
          value={data.notes ?? ''}
          onChange={(e) => upd('notes', e.target.value)}
          placeholder="Any additional info…"
        />
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{initial ? 'Save changes' : 'Create player'}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
