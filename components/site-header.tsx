'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Stethoscope, Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSession, logout, dashboardPath, type Session } from '@/lib/auth';
import { Button } from './ui-kit';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/services', label: 'Specialties' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setSession(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-cream-50/85 backdrop-blur-xl shadow-soft border-b border-ink-900/[0.06]'
          : 'bg-cream-50/60 backdrop-blur-md border-b border-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Crescent Care home">
            <span className="size-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-glow group-hover:bg-brand-700 transition-colors">
              <Stethoscope className="size-5" />
            </span>
            <span className="leading-none">
              <span className="block font-display font-semibold text-[19px] tracking-tight text-ink-900">Crescent Care</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700 mt-0.5">Medibook Clinic</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold transition-colors',
                  pathname === l.href ? 'text-brand-800 bg-brand-50' : 'text-ink-600 hover:text-brand-800 hover:bg-brand-50/60',
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link href={dashboardPath(session.role)}>
                  <Button variant="secondary" size="sm">
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="size-9 rounded-full flex items-center justify-center text-ink-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <User className="size-4" /> Sign in
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button size="sm">Book a visit</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden size-10 rounded-full flex items-center justify-center text-ink-900 hover:bg-brand-50 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-900/[0.06] bg-cream-50/95 backdrop-blur-xl px-4 pt-2 pb-6 animate-fade-up">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-2xl text-[15px] font-bold',
                  pathname === l.href ? 'text-brand-800 bg-brand-50' : 'text-ink-600 hover:bg-brand-50/60',
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3 px-1">
              {session ? (
                <>
                  <Link href={dashboardPath(session.role)} onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="secondary" className="w-full">Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>Sign out</Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/doctors" onClick={() => setOpen(false)} className="flex-1">
                    <Button className="w-full">Book a visit</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
