'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, demoLogin } from '@/lib/auth';
import { Button, Input, Label, Card } from '@/components/ui-kit';
import { HeartPulse, ShieldCheck, Lock, ClipboardCheck, Users, Settings } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (!res.ok) {
        setError(res.error || 'Sign in failed.');
      } else if (res.session!.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.');
      } else {
        router.push('/dashboard/admin');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    const res = await demoLogin('admin@crescentcare.pk');
    if (!res.ok) {
      setError(res.error || 'Demo sign-in failed.');
      setLoading(false);
    } else {
      router.push('/dashboard/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left brand panel */}
      <aside className="hidden lg:flex lg:w-[46%] bg-pine-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 dot-grid-light opacity-50" aria-hidden />
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-glow-500/10 blur-3xl" aria-hidden />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <span className="size-11 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow">
              <HeartPulse className="size-6 text-white" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight">Crescent Care</span>
          </Link>
        </div>
        <div className="relative max-w-md">
          <span className="eyebrow on-dark">Admin Portal</span>
          <h1 className="font-display text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-[1.1] mt-5">
            Mission control for the whole clinic.
          </h1>
          <p className="text-white/70 mt-5 leading-relaxed">
            Oversee doctors, patients, every appointment, and the contact inbox from a single secure console.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Users, text: 'Manage doctors and patients' },
              { icon: ClipboardCheck, text: 'Audit appointments and platform revenue' },
              { icon: Settings, text: 'Reset demo data whenever you need' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/85 text-[15px]">
                <span className="size-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-glow-400" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex items-center gap-2 text-white/60 text-sm">
          <Lock className="size-4" />
          Demo mode — your data is stored only in this browser.
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-md">
          <span className="eyebrow lg:hidden">Admin portal</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight mt-2 flex items-center gap-3">
            <span className="size-12 rounded-2xl bg-pine-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-6 text-white" />
            </span>
            Admin sign in
          </h2>
          <p className="text-ink-500 mt-2 text-[15px]">Restricted access — administrators only.</p>

          <Card className="mt-6 p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-2xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Admin email</Label>
                <Input id="email" type="email" placeholder="admin@crescentcare.pk" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" size="lg" loading={loading} className="w-full" variant="dark">
                Access dashboard
              </Button>
            </form>

            <div className="mt-7 pt-6 border-t border-ink-900/[0.07]">
              <p className="eyebrow justify-center mb-4">Try the demo — one click</p>
              <Button type="button" variant="outline" size="md" disabled={loading} onClick={handleDemo} className="w-full">
                Sign in as demo admin
              </Button>
              <p className="text-[12px] text-ink-500 text-center mt-4 font-medium flex items-center justify-center gap-1.5">
                <Lock className="size-3.5" /> Demo mode — your data is stored only in this browser.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
