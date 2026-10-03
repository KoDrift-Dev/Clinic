'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, CalendarDays, Clock, CreditCard, Wallet,
  CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight, X, Lock, User, Phone, FileText,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button, Card, Avatar, Stars, Badge, Input, Label, Textarea, EmptyState } from '@/components/ui-kit';
import { getProfile, createAppointment, type Profile } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { cn } from '@/lib/utils';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'];

type Step = 1 | 2 | 3;

function fmtDB(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().split('T')[0];
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [doctor, setDoctor] = useState<Profile | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>(1);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [month, setMonth] = useState(new Date());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [payMethod, setPayMethod] = useState<'online' | 'cash'>('online');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const doc = await getProfile(doctorId);
      if (doc && doc.role === 'doctor') setDoctor(doc);
      const s = getSession();
      if (s) {
        setSessionName(s.full_name);
        setName(s.full_name);
        const p = await getProfile(s.profileId);
        if (p?.phone) setPhone(p.phone);
        if (p?.current_symptoms) setReason(p.current_symptoms);
      }
      setLoading(false);
    })();
  }, [doctorId]);

  const offDays = useMemo(() => (doctor?.off_days ?? '').toLowerCase(), [doctor]);
  const isOff = (d: Date) => {
    const n = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return offDays.includes(n) || offDays.includes(n.slice(0, 3));
  };
  const isPast = (d: Date) => fmtDB(d) < fmtDB(new Date());

  const days = useMemo(() => {
    const y = month.getFullYear(), m = month.getMonth();
    const first = new Date(y, m, 1).getDay();
    const count = new Date(y, m + 1, 0).getDate();
    return { first, count };
  }, [month]);

  const canNext1 = date && time;
  const canNext2 = name.trim().length > 1 && phone.trim().length >= 7;

  const fee = doctor?.fee ?? 1000;
  const total = fee; // no hidden platform fee — transparent pricing

  const confirm = async () => {
    setError('');
    if (!sessionName) {
      router.push(`/login?returnTo=/book/${doctorId}`);
      return;
    }
    if (!doctor || !date || !time) return;
    setProcessing(true);
    try {
      const s = getSession();
      await createAppointment({
        doctor_id: doctor.id,
        patient_id: s?.profileId ?? '',
        patient_name: name.trim(),
        disease: reason.trim() || 'General Checkup',
        appointment_date: fmtDB(date),
        appointment_time: time,
        type: 'Consultation',
        payment_method: payMethod === 'online' ? 'Online' : 'Cash',
        fee,
        status: 'Pending',
      });
      setDone(true);
    } catch {
      setError('Something went wrong while saving your booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-4 py-20"><div className="animate-pulse h-64 bg-white rounded-3xl border border-ink-900/[0.07]" /></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft max-w-md w-full">
            <EmptyState title="Doctor not found" copy="Let's find you another specialist." action={<Link href="/doctors"><Button>Browse doctors</Button></Link>} />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="max-w-md w-full p-8 sm:p-10 text-center animate-fade-up">
            <span className="size-20 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto shadow-glow animate-pulse-ring">
              <CheckCircle2 className="size-10" />
            </span>
            <h1 className="font-display text-3xl font-semibold text-ink-900 mt-6">Booking confirmed</h1>
            <p className="text-ink-500 text-[15px] mt-3 leading-relaxed">
              Your visit with <strong className="text-ink-900">{doctor.full_name}</strong> on{' '}
              <strong className="text-ink-900">{date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at{' '}
              <strong className="text-ink-900 tnum">{time}</strong> is saved.
            </p>
            <div className="mt-6 rounded-2xl bg-cream-50 border border-ink-900/[0.06] p-4 flex items-center justify-between text-sm font-bold">
              <span className="text-ink-500">Total {payMethod === 'online' ? 'paid' : 'due at clinic'}</span>
              <span className="font-display text-xl text-ink-900 tnum">Rs. {total.toLocaleString()}</span>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/dashboard/patient"><Button className="w-full">View my appointments</Button></Link>
              <Link href="/doctors"><Button variant="outline" className="w-full">Book another visit</Button></Link>
            </div>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const steps: { n: Step; label: string; icon: typeof CalendarDays }[] = [
    { n: 1, label: 'Date & time', icon: CalendarDays },
    { n: 2, label: 'Your details', icon: User },
    { n: 3, label: 'Confirm', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-ink-500 hover:text-brand-700 text-sm font-bold mb-8 cursor-pointer transition-colors">
            <ArrowLeft className="size-4" /> Back
          </button>

          {/* Stepper */}
          <ol className="flex items-center gap-2 sm:gap-3 mb-10" aria-label="Booking steps">
            {steps.map((s, i) => (
              <li key={s.n} className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none">
                <span className={cn(
                  'size-10 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 transition-all',
                  step > s.n ? 'bg-brand-600 text-white' : step === s.n ? 'bg-brand-600 text-white shadow-glow' : 'bg-white border border-ink-900/15 text-ink-400',
                )}>
                  {step > s.n ? <CheckCircle2 className="size-5" /> : s.n}
                </span>
                <span className={cn('text-sm font-extrabold hidden sm:block', step === s.n ? 'text-ink-900' : 'text-ink-400')}>{s.label}</span>
                {i < steps.length - 1 && <span className={cn('flex-1 h-0.5 rounded-full mx-1', step > s.n ? 'bg-brand-500' : 'bg-ink-900/10')} aria-hidden />}
              </li>
            ))}
          </ol>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div>
              {/* STEP 1 */}
              {step === 1 && (
                <Card className="p-6 sm:p-8 animate-fade-up">
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Choose a date & time</h1>
                  <p className="text-sm text-ink-500 font-medium mt-1.5 flex items-center gap-1.5">
                    <Clock className="size-4 text-brand-600" /> {doctor.full_name} · Off: {doctor.off_days ?? '—'}
                  </p>

                  <div className="mt-6 max-w-md">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="size-9 rounded-full hover:bg-brand-50 flex items-center justify-center text-ink-600 cursor-pointer" aria-label="Previous month">
                        <ChevronLeft className="size-5" />
                      </button>
                      <p className="font-display text-lg font-semibold text-ink-900">{MONTHS[month.getMonth()]} {month.getFullYear()}</p>
                      <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="size-9 rounded-full hover:bg-brand-50 flex items-center justify-center text-ink-600 cursor-pointer" aria-label="Next month">
                        <ChevronRight className="size-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 mb-1">
                      {DOW.map(d => <div key={d} className="text-center text-[11px] font-extrabold text-ink-400 py-2">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: days.first }).map((_, i) => <div key={`e${i}`} />)}
                      {Array.from({ length: days.count }).map((_, i) => {
                        const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
                        const disabled = isOff(d) || isPast(d);
                        const selected = date && fmtDB(date) === fmtDB(d);
                        const today = fmtDB(d) === fmtDB(new Date());
                        return (
                          <button
                            key={i + 1}
                            disabled={disabled}
                            onClick={() => { setDate(d); setTime(''); }}
                            className={cn(
                              'h-11 rounded-xl text-sm font-bold transition-all',
                              selected ? 'bg-brand-600 text-white shadow-glow scale-105'
                                : disabled ? 'text-ink-900/20 cursor-not-allowed'
                                : today ? 'bg-brand-50 text-brand-800 hover:bg-brand-100 cursor-pointer'
                                : 'text-ink-700 hover:bg-brand-50 cursor-pointer',
                            )}
                            aria-label={d.toLocaleDateString()}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={cn('mt-8 transition-opacity', !date && 'opacity-40 pointer-events-none')}>
                    <h2 className="font-bold text-ink-900 mb-3 flex items-center gap-2">
                      <Clock className="size-4 text-brand-600" />
                      {date ? `Slots for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` : 'Select a date to see slots'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {SLOTS.map(t => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={cn(
                            'py-3 rounded-2xl border-2 text-sm font-extrabold transition-all cursor-pointer tnum',
                            time === t ? 'bg-brand-600 text-white border-brand-600 shadow-glow' : 'bg-white border-ink-900/10 text-ink-700 hover:border-brand-400',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button size="lg" disabled={!canNext1} onClick={() => setStep(2)}>
                      Continue <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <Card className="p-6 sm:p-8 animate-fade-up">
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Your details</h1>
                  <p className="text-sm text-ink-500 font-medium mt-1.5">The doctor sees this before your visit.</p>
                  {!sessionName && (
                    <div className="mt-5 rounded-2xl bg-glow-100 border border-[#ecd9a8] p-4 text-sm font-semibold text-[#7a5210] flex items-center justify-between gap-3">
                      <span>You'll sign in before confirming — your booking is kept.</span>
                      <Link href={`/login?returnTo=/book/${doctorId}`}><Button size="sm" variant="dark">Sign in</Button></Link>
                    </div>
                  )}
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bk-name">Full name</Label>
                      <Input id="bk-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div>
                      <Label htmlFor="bk-phone">Phone number</Label>
                      <Input id="bk-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" inputMode="tel" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="bk-reason">Reason for visit <span className="text-ink-400 font-semibold">(optional)</span></Label>
                    <Textarea id="bk-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly describe your symptoms or concern…" />
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="size-4" /> Back</Button>
                    <Button size="lg" disabled={!canNext2} onClick={() => setStep(3)}>
                      Review booking <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <Card className="p-6 sm:p-8 animate-fade-up">
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Confirm your visit</h1>

                  <div className="mt-6 rounded-2xl bg-cream-50 border border-ink-900/[0.06] p-5 space-y-3">
                    {[
                      { icon: User, k: 'Patient', v: name },
                      { icon: Phone, k: 'Phone', v: phone },
                      { icon: CalendarDays, k: 'Date', v: date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) ?? '' },
                      { icon: Clock, k: 'Time', v: time },
                      ...(reason.trim() ? [{ icon: FileText, k: 'Reason', v: reason.trim() }] : []),
                    ].map(r => (
                      <div key={r.k} className="flex items-center gap-3 text-sm">
                        <r.icon className="size-4 text-brand-600 shrink-0" />
                        <span className="text-ink-400 font-bold w-16">{r.k}</span>
                        <span className="font-bold text-ink-900">{r.v}</span>
                      </div>
                    ))}
                  </div>

                  <h2 className="font-bold text-ink-900 mt-7 mb-3">Payment method</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { id: 'online' as const, icon: CreditCard, t: 'Pay online', d: 'Debit / credit card' },
                      { id: 'cash' as const, icon: Wallet, t: 'Pay at clinic', d: 'Cash on arrival' },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        className={cn(
                          'rounded-2xl border-2 p-5 text-left transition-all cursor-pointer',
                          payMethod === m.id ? 'border-brand-600 bg-brand-50/60' : 'border-ink-900/10 hover:border-brand-300',
                        )}
                        aria-pressed={payMethod === m.id}
                      >
                        <m.icon className={cn('size-6', payMethod === m.id ? 'text-brand-700' : 'text-ink-400')} />
                        <p className="font-extrabold text-ink-900 mt-2 text-[15px]">{m.t}</p>
                        <p className="text-xs text-ink-500 font-semibold mt-0.5">{m.d}</p>
                      </button>
                    ))}
                  </div>

                  {error && <p className="mt-4 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3.5">{error}</p>}

                  <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="size-4" /> Back</Button>
                    <Button size="lg" loading={processing} onClick={confirm} className="sm:min-w-64">
                      <Lock className="size-4" /> Confirm · Rs. {total.toLocaleString()}
                    </Button>
                  </div>
                  <p className="mt-4 text-center text-xs text-ink-400 font-semibold">Free cancellation up to 2 hours before your visit.</p>
                </Card>
              )}
            </div>

            {/* Summary sidebar */}
            <aside className="lg:sticky lg:top-24">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar name={doctor.full_name} size="md" />
                  <div>
                    <p className="font-bold text-ink-900 text-[15px] leading-snug">{doctor.full_name}</p>
                    <p className="text-[13px] font-bold text-brand-700">{doctor.specialty}</p>
                    <Stars rating={doctor.rating ?? 0} className="mt-1" />
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-ink-900/[0.06] space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-ink-500 font-semibold">Consultation</span><span className="font-extrabold text-ink-900 tnum">Rs. {fee.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-ink-500 font-semibold">Platform fee</span><span className="font-extrabold text-brand-700">Free</span></div>
                  <div className="flex justify-between pt-2.5 border-t border-ink-900/[0.06]"><span className="font-extrabold text-ink-900">Total</span><span className="font-display text-xl font-semibold text-ink-900 tnum">Rs. {total.toLocaleString()}</span></div>
                </div>
                {(date || time) && (
                  <div className="mt-4">
                    <Badge tone="brand" className="w-full justify-center py-2">
                      {date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} {time && `· ${time}`}
                    </Badge>
                  </div>
                )}
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
