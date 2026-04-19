'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 animate-fade-in-up">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4"><Logo size={64} /></div>
          <h1 className="text-2xl font-extrabold text-brand-800">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your squad</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@ajman.ae" />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
          <Button type="submit" loading={loading} className="w-full">Sign in</Button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-6">
          No account?{' '}
          <Link href="/signup" className="text-brand-600 font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </main>
  );
}
