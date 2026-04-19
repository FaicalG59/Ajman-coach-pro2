'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setInfo('Check your email to confirm your account, then sign in.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 animate-fade-in-up">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4"><Logo size={64} /></div>
          <h1 className="text-2xl font-extrabold text-brand-800">Create account</h1>
          <p className="text-sm text-slate-500 mt-1">Start managing your squad today</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mohamed Al Zaabi" />
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@ajman.ae" />
          <Input label="Password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
          {info && <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">{info}</div>}
          <Button type="submit" loading={loading} className="w-full">Create account</Button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
