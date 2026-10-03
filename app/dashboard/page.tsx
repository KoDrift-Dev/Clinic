'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, dashboardPath } from '@/lib/auth';

// Routes the logged-in user to the right dashboard based on their role.
export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
    } else {
      router.replace(dashboardPath(session.role));
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="text-center">
        <div className="size-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
        <p className="font-display text-xl text-ink-900">Opening your dashboard</p>
        <p className="font-medium text-ink-500 text-sm mt-1">One moment…</p>
      </div>
    </div>
  );
}
