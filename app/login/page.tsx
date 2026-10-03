'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login, register, demoLogin, dashboardPath } from '@/lib/auth';
import { Button, Input, Label, Card } from '@/components/ui-kit';
import { HeartPulse, ArrowLeft, ShieldCheck, CalendarCheck2, Users, Lock } from 'lucide-react';

const DEMOS = [
  { label: 'Patient', email: 'ahmed.raza@example.pk' },
  { label: 'Doctor', email: 'ayesha.khan@crescentcare.pk' },
  { label: 'Admin', email: 'admin@crescentcare.pk' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const go = (r: 'admin' | 'doctor' | 'patient') => {
    router.push(returnTo || dashboardPath(r));
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'signup') {
        const res = await register(name, email, password, role);
        if (!res.ok) setError(res.error || 'Sign up failed.');
        else go(res.session!.role);
      } else {
        const res = await login(email, password);
        if (!res.ok) setError(res.error || 'Sign in failed.');
        else go(res.session!.role);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoEmail: string) => {
    setLoading(true);
    setError('');
    const res = await demoLogin(demoEmail);
    if (!res.ok) {
      setError(res.error || 'Demo sign-in failed.');
      setLoading(false);
    } else {
      go(res.session!.role);
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
          <span className="eyebrow on-dark">Medibook Portal</span>
          <h1 className="font-display text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-[1.1] mt-5">
            Your health journey, beautifully organised.
          </h1>
          <p className="text-white/70 mt-5 leading-relaxed">
            Book trusted doctors in minutes, keep every prescription and lab report in one place, and get reminders before every visit.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: CalendarCheck2, text: 'Same-day appointments with verified specialists' },
              { icon: ShieldCheck, text: 'Private by design — records stay on your device' },
              { icon: Users, text: 'One account for the whole family' },
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
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-ink-500 hover:text-brand-700 font-bold mb-6 text-sm">
            <ArrowLeft className="size-4" /> Back to home
          </Link>

          <span className="eyebrow lg:hidden">Sign in</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight mt-2">
            {tab === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-ink-500 mt-2 text-[15px]">
            {tab === 'signup' ? 'Join Crescent Care to book appointments in minutes.' : 'Sign in to manage your appointments and records.'}
          </p>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-ink-900/[0.05] rounded-full mt-7">
            {(['signin', 'signup'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(''); }}
                className={`py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                  tab === t ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {t === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <Card className="mt-5 p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-2xl mb-5">
                {error}
              </div>
            )}

            {tab === 'signup' && (
              <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-ink-900/[0.04] rounded-full mb-5">
                {(['patient', 'doctor'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-full font-bold text-sm capitalize transition-all cursor-pointer ${
                      role === r ? 'bg-pine-900 text-white' : 'text-ink-500 hover:text-ink-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" type="text" placeholder="Ahmed Raza" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.pk" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Minimum 4 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
              </div>
              <Button type="submit" size="lg" loading={loading} className="w-full">
                {tab === 'signup' ? 'Create account' : 'Sign in'}
              </Button>
            </form>

            {/* Demo quick sign-in */}
            <div className="mt-7 pt-6 border-t border-ink-900/[0.07]">
              <p className="eyebrow justify-center mb-4">Try the demo — one click</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMOS.map(d => (
                  <Button key={d.email} type="button" variant="outline" size="sm" disabled={loading} onClick={() => handleDemo(d.email)}>
                    {d.label}
                  </Button>
                ))}
              </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50" />}>
      <LoginForm />
    </Suspense>
  );
}
