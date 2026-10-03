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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-foreground-muted">Loading your dashboard...</p>
      </div>
    </div>
  );
}
