import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui-kit';
import { HeartPulse, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40" aria-hidden />
        <div className="absolute top-1/4 left-1/4 size-72 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative text-center px-4 py-20 max-w-2xl mx-auto">
          <span className="size-16 rounded-3xl bg-pine-900 inline-flex items-center justify-center mb-6">
            <HeartPulse className="size-8 text-glow-400" />
          </span>
          <p className="font-display text-[7rem] sm:text-[10rem] leading-none font-semibold text-pine-900 tnum select-none">
            404
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight mt-2">
            This page is off the charts
          </h1>
          <p className="text-ink-500 mt-3 max-w-md mx-auto leading-relaxed">
            The page you are looking for does not exist or was moved. Let&apos;s get you back to your care.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="size-4" /> Back to home
              </Button>
            </Link>
            <Link href="/doctors">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Compass className="size-4" /> Find a doctor
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
