'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, BadgeCheck, Clock, Wallet, CalendarCheck,
  Building2, GraduationCap, Briefcase, Phone, ChevronRight, Star,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button, Card, Avatar, Stars, Badge, Reveal, EmptyState } from '@/components/ui-kit';
import { DoctorCard } from '@/components/doctor-card';
import { specialtyMeta } from '@/components/specialties';
import { getProfile, listDoctors, appointmentsForDoctor, type Profile, type Appointment } from '@/lib/db';
import { cn } from '@/lib/utils';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function parseSchedule(avail?: string, offDays?: string) {
  // avail like "Mon–Sat, 10am–6pm"; off_days like "Sunday" or "Saturday, Sunday"
  const off = (offDays ?? '').toLowerCase();
  return DAY_ORDER.map(day => ({
    day,
    off: off.includes(day.toLowerCase()) || off.includes(day.slice(0, 3).toLowerCase()),
    hours: avail ?? '',
  }));
}

function nextSlots(doctor: Profile): string[] {
  const off = (doctor.off_days ?? '').toLowerCase();
  const slots: string[] = [];
  const d = new Date();
  let guard = 0;
  while (slots.length < 3 && guard < 14) {
    const name = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (!off.includes(name) && !off.includes(name.slice(0, 3))) {
      const label = guard === 0 ? 'Today' : guard === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      slots.push(label);
    }
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return slots;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [doctor, setDoctor] = useState<Profile | null>(null);
  const [visits, setVisits] = useState<Appointment[]>([]);
  const [others, setOthers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [doc, all] = await Promise.all([getProfile(id), listDoctors()]);
      if (!doc || doc.role !== 'doctor') {
        setLoading(false);
        return;
      }
      setDoctor(doc);
      setVisits((await appointmentsForDoctor(doc.id)).filter(a => a.status === 'Completed'));
      setOthers(all.filter(d => d.id !== doc.id && d.specialty === doc.specialty).slice(0, 3));
      setLoading(false);
    })();
  }, [id]);

  const schedule = useMemo(() => parseSchedule(doctor?.avail, doctor?.off_days), [doctor]);
  const slots = useMemo(() => (doctor ? nextSlots(doctor) : []), [doctor]);
  const meta = specialtyMeta(doctor?.specialty ?? '');
  const SpecIcon = meta.icon;

  // Deterministic rating distribution from the doctor's rating
  const dist = useMemo(() => {
    const r = doctor?.rating ?? 4.5;
    const five = Math.round(((r - 3.6) / 1.4) * 78 + 12);
    const four = Math.round((100 - five) * 0.62);
    const three = Math.round((100 - five - four) * 0.6);
    const two = Math.round((100 - five - four - three) * 0.5);
    return [
      { stars: 5, pct: Math.min(96, five) },
      { stars: 4, pct: four },
      { stars: 3, pct: three },
      { stars: 2, pct: two },
      { stars: 1, pct: Math.max(1, 100 - five - four - three - two) },
    ];
  }, [doctor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <SiteHeader />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-cream-200 rounded w-1/3" />
            <div className="h-64 bg-white rounded-3xl border border-ink-900/[0.07]" />
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft max-w-md w-full">
            <EmptyState
              title="Doctor not found"
              copy="This profile may have been removed. Let's find you another specialist."
              action={<Link href="/doctors"><Button>Browse doctors</Button></Link>}
            />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <SiteHeader />

      {/* Profile header */}
      <section className="relative overflow-hidden bg-pine-900">
        <div className="absolute inset-0 dot-grid-light opacity-50" aria-hidden />
        <div className="absolute -top-24 right-16 size-72 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold mb-8 cursor-pointer transition-colors">
            <ArrowLeft className="size-4" /> Back to doctors
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar name={doctor.full_name} size="xl" className="ring-white/20" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 text-white border-white/15"><BadgeCheck className="size-3.5" /> Verified doctor</Badge>
                <Badge className="bg-brand-500/20 text-brand-200 border-brand-400/30">{doctor.specialty}</Badge>
              </div>
              <h1 className="font-display text-3xl sm:text-[2.6rem] font-semibold text-white tracking-tight mt-3">{doctor.full_name}</h1>
              <p className="text-white/60 text-sm font-medium mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5"><GraduationCap className="size-4" /> {doctor.qual}</span>
                <span className="flex items-center gap-1.5"><Building2 className="size-4" /> {doctor.hospital}</span>
                <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {doctor.city}</span>
              </p>
            </div>
            <div className="flex sm:flex-col items-center gap-3 bg-white/10 backdrop-blur rounded-3xl border border-white/10 px-6 py-5">
              <div className="text-center">
                <p className="font-display text-4xl font-semibold text-white tnum">{(doctor.rating ?? 0).toFixed(1)}</p>
                <Stars rating={doctor.rating ?? 0} className="mt-1 justify-center" />
                <p className="text-white/50 text-xs font-bold mt-1 tnum">{doctor.reviews ?? 0} reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-6 min-w-0">
            {/* About */}
            <Reveal>
              <Card className="p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900">About {doctor.full_name.replace(/^Dr\.\s*/i, 'Dr. ')}</h2>
                <div className="mt-5 grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Briefcase, label: 'Experience', value: doctor.exp ?? '—' },
                    { icon: Wallet, label: 'Consultation fee', value: `Rs. ${(doctor.fee ?? 0).toLocaleString()}` },
                    { icon: Clock, label: 'Availability', value: doctor.avail ?? '—' },
                  ].map(f => (
                    <div key={f.label} className="rounded-2xl bg-cream-50 border border-ink-900/[0.06] p-4">
                      <f.icon className="size-5 text-brand-600" />
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400 mt-2">{f.label}</p>
                      <p className="font-bold text-ink-900 text-[15px] mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[15px] text-ink-600 leading-relaxed">
                  {doctor.full_name} is a {doctor.specialty?.toLowerCase() ?? 'medical specialist'} practicing at {doctor.hospital ?? 'Crescent Care'} in {doctor.city ?? 'Lahore'}
                  with {doctor.exp ?? 'several years'} of clinical experience. {meta.blurb} Consultations are available {doctor.avail ?? 'on weekdays'}.
                </p>
                {doctor.phone && (
                  <p className="mt-4 flex items-center gap-2 text-sm font-bold text-ink-600">
                    <Phone className="size-4 text-brand-600" /> Clinic line: <span className="tnum">{doctor.phone}</span>
                  </p>
                )}
              </Card>
            </Reveal>

            {/* Weekly schedule */}
            <Reveal>
              <Card className="p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900">Weekly schedule</h2>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {schedule.map(s => (
                    <div
                      key={s.day}
                      className={cn(
                        'rounded-2xl border p-3 text-center',
                        s.off ? 'bg-ink-900/[0.03] border-ink-900/[0.06]' : 'bg-brand-50/60 border-brand-200/60',
                      )}
                    >
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">{s.day.slice(0, 3)}</p>
                      <p className={cn('text-[13px] font-extrabold mt-1', s.off ? 'text-ink-400' : 'text-brand-800')}>
                        {s.off ? 'Off' : 'Open'}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[13px] text-ink-500 font-medium flex items-center gap-1.5">
                  <Clock className="size-4 text-brand-600" /> Hours: {doctor.avail ?? '—'} · Off: {doctor.off_days ?? '—'}
                </p>
              </Card>
            </Reveal>

            {/* Reviews */}
            <Reveal>
              <Card className="p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900">Patient feedback</h2>
                <div className="mt-6 grid sm:grid-cols-[220px_1fr] gap-8">
                  <div className="text-center sm:text-left">
                    <p className="font-display text-6xl font-semibold text-ink-900 tnum">{(doctor.rating ?? 0).toFixed(1)}</p>
                    <Stars rating={doctor.rating ?? 0} className="mt-2 justify-center sm:justify-start" />
                    <p className="text-sm text-ink-500 font-semibold mt-2 tnum">{doctor.reviews ?? 0} verified reviews</p>
                  </div>
                  <div className="space-y-2.5">
                    {dist.map(d => (
                      <div key={d.stars} className="flex items-center gap-3">
                        <span className="text-[13px] font-extrabold text-ink-500 w-8 flex items-center gap-1">{d.stars} <Star className="size-3 text-glow-500 fill-current" /></span>
                        <div className="flex-1 h-2.5 rounded-full bg-ink-900/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="text-[13px] font-bold text-ink-400 w-10 text-right tnum">{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {visits.length > 0 && (
                  <div className="mt-7 pt-6 border-t border-ink-900/[0.06]">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-ink-400 mb-4">Recent verified visits</h3>
                    <div className="space-y-2.5">
                      {visits.slice(0, 4).map(v => (
                        <div key={v.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream-50 border border-ink-900/[0.05] px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={v.patient_name} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-ink-900 truncate">{v.patient_name}</p>
                              <p className="text-xs text-ink-400 font-semibold">{v.type} · {new Date(v.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <Stars rating={5} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </Reveal>

            {/* Similar doctors */}
            {others.length > 0 && (
              <Reveal>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-2xl font-semibold text-ink-900">Similar specialists</h2>
                  <Link href={`/doctors?specialty=${encodeURIComponent(doctor.specialty ?? '')}`} className="text-sm font-extrabold text-brand-700 hover:underline underline-offset-4 flex items-center gap-1">
                    View all <ChevronRight className="size-4" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {others.map(o => <DoctorCard key={o.id} doctor={o} />)}
                </div>
              </Reveal>
            )}
          </div>

          {/* Sticky booking card */}
          <aside className="lg:sticky lg:top-24">
            <Reveal delay={100}>
              <Card className="p-6 sm:p-7 border-brand-200/60">
                <div className="flex items-center gap-3">
                  <span className={`size-12 rounded-2xl flex items-center justify-center ${meta.accent}`}>
                    <SpecIcon className="size-6" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">Consultation fee</p>
                    <p className="font-display text-2xl font-semibold text-ink-900 tnum">Rs. {(doctor.fee ?? 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400 mb-2.5">Next available days</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map(s => (
                      <span key={s} className="rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[13px] font-bold px-3.5 py-1.5">{s}</span>
                    ))}
                  </div>
                </div>
                <Link href={`/book/${doctor.id}`}>
                  <Button size="lg" className="w-full mt-6">
                    <CalendarCheck className="size-4" /> Book appointment
                  </Button>
                </Link>
                <p className="mt-3 text-center text-xs text-ink-400 font-semibold">Free cancellation · Pay online or at clinic</p>
              </Card>
            </Reveal>
          </aside>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-ink-900/10 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">Consultation</p>
          <p className="font-display text-xl font-semibold text-ink-900 tnum">Rs. {(doctor.fee ?? 0).toLocaleString()}</p>
        </div>
        <Link href={`/book/${doctor.id}`} className="flex-1 max-w-[220px]">
          <Button className="w-full">Book visit</Button>
        </Link>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />

      <SiteFooter />
    </div>
  );
}
