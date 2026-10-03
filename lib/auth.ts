// Demo auth (localStorage session). Demo-grade only: passwords are stored
// in plain text in the browser. There is no server and no real security
// here — this exists so the demo dashboards keep working offline.

import { getProfile, getProfileByEmail, createProfile, type Profile, type Role } from './db';

export interface Session {
  profileId: string;
  email: string;
  full_name: string;
  role: Role;
}

const SESSION_KEY = 'medibook_session_v1';

function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  if (typeof window === 'undefined') return;
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

export function getSession(): Session | null {
  return readSession();
}

export async function getSessionProfile(): Promise<Profile | null> {
  const s = readSession();
  if (!s) return null;
  const p = await getProfile(s.profileId);
  if (!p) { writeSession(null); return null; }
  return p;
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string; session?: Session }> {
  const profile = await getProfileByEmail(email);
  if (!profile || profile.password !== password) {
    return { ok: false, error: 'Invalid email or password.' };
  }
  const session: Session = { profileId: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role };
  writeSession(session);
  return { ok: true, session };
}

/** One-click demo sign-in used by the login page's quick buttons. */
export async function demoLogin(email: string): Promise<{ ok: boolean; error?: string; session?: Session }> {
  const profile = await getProfileByEmail(email);
  if (!profile) return { ok: false, error: 'Demo account not found.' };
  const session: Session = { profileId: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role };
  writeSession(session);
  return { ok: true, session };
}

export async function register(name: string, email: string, password: string, role: Role): Promise<{ ok: boolean; error?: string; session?: Session }> {
  const existing = await getProfileByEmail(email);
  if (existing) return { ok: false, error: 'An account with this email already exists. Please sign in.' };
  const profile = await createProfile({
    full_name: name,
    email,
    password,
    role,
    initials: name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U',
    bg: 'from-slate-600 to-slate-400',
  });
  const session: Session = { profileId: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role };
  writeSession(session);
  return { ok: true, session };
}

export function logout() {
  writeSession(null);
}

export function dashboardPath(role: Role): string {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'doctor') return '/dashboard/doctor';
  return '/dashboard/patient';
}
