'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, demoLogin } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowLeft, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground font-bold mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <Card className="glass-card rounded-3xl border border-purple-200 dark:border-zinc-800 shadow-premium">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black">Admin <span className="text-gradient">Portal</span></CardTitle>
            <CardDescription className="font-medium">
              Restricted access — administrators only
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block">Admin Email</label>
                <Input
                  type="email"
                  placeholder="admin@crescentcare.pk"
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
                  className="rounded-2xl py-6 font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-black rounded-2xl py-6 text-base border-0 hover-wave disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </form>

            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-bold text-foreground-muted text-center mb-3 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo admin — one click
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleDemo}
                className="w-full rounded-2xl font-bold py-5 hover-wave border-purple-500/50 text-purple-500"
              >
                Sign in as Demo Admin
              </Button>
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
