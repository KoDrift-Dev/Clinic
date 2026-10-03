'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, register, demoLogin, dashboardPath } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const go = (r: 'admin' | 'doctor' | 'patient') => {
    router.push(dashboardPath(r));
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground font-bold mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <Card className="glass-card rounded-3xl border border-blue-100 dark:border-zinc-800 shadow-premium">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <CardTitle className="text-3xl font-black">Welcome to <span className="text-gradient">Crescent Care</span></CardTitle>
            <CardDescription className="font-medium">
              {isSignUp ? 'Create your account to book appointments' : 'Sign in to manage your health'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            {/* Role Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
              {(['patient', 'doctor'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl font-black text-sm capitalize transition-all ${
                    role === r
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="text-sm font-bold text-foreground mb-1.5 block">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Ahmed Raza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-2xl py-6 font-medium"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-2xl py-6 font-medium"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  className="rounded-2xl py-6 font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-2xl py-6 text-base btn-glow border-0 hover-wave disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-sm font-bold text-primary hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            {/* Demo quick sign-in */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-bold text-foreground-muted text-center mb-3 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Try the demo — one click, no password needed
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleDemo('ahmed.raza@example.pk')}
                  className="rounded-2xl font-bold text-xs py-5 hover-wave"
                >
                  Patient
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleDemo('ayesha.khan@crescentcare.pk')}
                  className="rounded-2xl font-bold text-xs py-5 hover-wave"
                >
                  Doctor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleDemo('admin@crescentcare.pk')}
                  className="rounded-2xl font-bold text-xs py-5 hover-wave border-purple-500/50 text-purple-500"
                >
                  Admin
                </Button>
              </div>
              <p className="text-[11px] text-foreground-muted text-center mt-3 font-medium">
                Demo mode — your data is stored only in this browser.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
