'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSessionProfile } from '@/lib/auth';
import { appointmentsForPatient, updateAppointment, recordsForPatient, type Profile, type Appointment, type MedicalRecord } from '@/lib/db';
import { Button, Card, Avatar, StatusPill, EmptyState, Modal, Input, Label, Reveal } from '@/components/ui-kit';
import { CalendarDays, Clock, CalendarCheck2, FileText, Download, UserRound, X, Pencil, AlertTriangle, History, ArrowRight, BadgeCheck } from 'lucide-react';

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '04:00 PM', '05:00 PM'];

function fmtDate(d: string) {
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PatientDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [patient, setPatient] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [reschedTarget, setReschedTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const load = async () => {
      const profile = await getSessionProfile();
      if (!profile) {
        router.replace('/login');
        return;
      }
      if (profile.role !== 'patient') {
        router.replace('/');
        return;
      }
      setPatient(profile);
      const [appts, recs] = await Promise.all([
        appointmentsForPatient(profile.id),
        recordsForPatient(profile.id),
      ]);
      setAppointments(appts);
      setRecords(recs);
      setCheckingAuth(false);
    };
    load();
  }, [router]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setAppointments(cur => cur.map(a => (a.id === cancelTarget.id ? { ...a, status: 'Canceled' } : a)));
    await updateAppointment(cancelTarget.id, { status: 'Canceled' });
    setCancelTarget(null);
  };

  const handleReschedule = async () => {
    if (!reschedTarget || !newDate || !newTime) return;
    setAppointments(cur =>
      cur.map(a => (a.id === reschedTarget.id ? { ...a, appointment_date: newDate, appointment_time: newTime } : a)),
    );
    await updateAppointment(reschedTarget.id, { appointment_date: newDate, appointment_time: newTime });
    setReschedTarget(null);
    setNewDate('');
    setNewTime('');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
          <p className="font-display text-xl text-ink-900">Loading your dashboard</p>
        </div>
      </div>
    );
  }

  const upcoming = appointments.filter(a => ['Pending', 'Upcoming', 'Confirmed'].includes(a.status));
  const past = appointments.filter(a => ['Completed', 'Canceled'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'Completed');

  const stats = [
    { label: 'Upcoming visits', value: upcoming.length, icon: CalendarCheck2, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Completed visits', value: completed.length, icon: BadgeCheck, tone: 'bg-glow-100 text-[#8a5a12]' },
    { label: 'Medical records', value: records.length, icon: FileText, tone: 'bg-pine-900 text-white' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <SiteHeader />

      {/* Cancel modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)}>
        <div className="p-8 text-center">
          <div className="size-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="size-6 text-red-600" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-ink-900">Cancel this visit?</h3>
          <p className="text-ink-500 text-sm mt-2">
            {cancelTarget?.doctor?.full_name ? `Your appointment with ${cancelTarget.doctor.full_name} on ${fmtDate(cancelTarget.appointment_date)} will be cancelled.` : 'This action cannot be undone.'}
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)}>Keep it</Button>
            <Button variant="danger" className="flex-1" onClick={handleCancel}>Yes, cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule modal */}
      <Modal open={!!reschedTarget} onClose={() => setReschedTarget(null)}>
        <div className="p-8">
          <h3 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
            <Pencil className="size-5 text-brand-600" /> Reschedule
          </h3>
          <p className="text-ink-500 text-sm mt-1">Pick a new date and time for this visit.</p>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="new-date">New date</Label>
              <Input id="new-date" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
            <div className={!newDate ? 'opacity-50 pointer-events-none' : ''}>
              <Label>New time slot</Label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewTime(t)}
                    className={`py-2.5 px-3 rounded-full font-bold text-sm border transition-all cursor-pointer ${
                      newTime === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-900 border-ink-900/15 hover:border-brand-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleReschedule} disabled={!newDate || !newTime} className="w-full" size="lg">
              Confirm new schedule
            </Button>
          </div>
        </div>
      </Modal>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
          {/* Greeting header */}
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <Avatar name={patient?.full_name || 'Patient'} size="lg" />
                <div>
                  <span className="eyebrow">Patient dashboard</span>
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight mt-1">
                    Hello, {patient?.full_name?.split(' ')[0] || 'there'}
                  </h1>
                  <p className="text-ink-500 text-sm mt-1">Here is what is happening with your care.</p>
                </div>
              </div>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full sm:w-auto">
                  <UserRound className="size-4" /> My profile & records
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <Card className="lift p-6 flex items-center gap-4">
                  <span className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${s.tone}`}>
                    <s.icon className="size-6" />
                  </span>
                  <div>
                    <p className="font-display text-3xl font-semibold text-ink-900 tnum">{s.value}</p>
                    <p className="text-sm text-ink-500 font-medium">{s.label}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Upcoming */}
          <Reveal>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
                <CalendarDays className="size-6 text-brand-600" /> Upcoming appointments
              </h2>
              <Link href="/doctors" className="text-sm font-bold text-brand-700 hover:underline inline-flex items-center gap-1">
                Book new <ArrowRight className="size-4" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <Card>
                <EmptyState
                  title="No upcoming visits"
                  copy="You are all caught up. When you are ready, book a consultation with a verified doctor."
                  action={<Link href="/doctors"><Button>Find a doctor</Button></Link>}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcoming.map(appt => (
                  <Card key={appt.id} className="lift p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={appt.doctor?.full_name || 'Doctor'} size="md" photo={appt.doctor?.photo} />
                        <div>
                          <h3 className="font-bold text-ink-900">{appt.doctor?.full_name || 'Doctor'}</h3>
                          <p className="text-brand-700 font-bold text-xs">{appt.doctor?.specialty || 'Consultation'}</p>
                        </div>
                      </div>
                      <StatusPill status={appt.status} />
                    </div>
                    <div className="bg-cream-50 border border-ink-900/[0.06] rounded-2xl p-4 mt-5 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays className="size-5 text-ink-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-ink-500 font-bold uppercase tracking-wide">Date</p>
                          <p className="text-sm font-bold text-ink-900">{fmtDate(appt.appointment_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 border-l border-ink-900/[0.07] pl-4">
                        <Clock className="size-5 text-ink-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-ink-500 font-bold uppercase tracking-wide">Time</p>
                          <p className="text-sm font-bold text-ink-900">{appt.appointment_time}</p>
                        </div>
                      </div>
                    </div>
                    {appt.disease && (
                      <p className="text-sm text-ink-500 mt-4"><span className="font-bold text-ink-900">Reason:</span> {appt.disease}</p>
                    )}
                    <div className="flex gap-2.5 mt-5">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setReschedTarget(appt)}>
                        <Pencil className="size-3.5" /> Reschedule
                      </Button>
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => setCancelTarget(appt)}>
                        <X className="size-3.5" /> Cancel
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Reveal>

          {/* Past appointments */}
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2 mb-4">
              <History className="size-6 text-ink-400" /> Visit history
            </h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[540px]">
                  <thead>
                    <tr className="bg-cream-50 text-ink-500 text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold">Doctor</th>
                      <th className="p-4 font-bold">Date & time</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-900/[0.06]">
                    {past.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-ink-500 font-medium text-sm">No past visits yet.</td></tr>
                    ) : (
                      past.map(appt => (
                        <tr key={appt.id} className="hover:bg-cream-50/60 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-ink-900 text-sm">{appt.doctor?.full_name || 'Doctor'}</div>
                            <div className="text-xs text-ink-500">{appt.doctor?.specialty || 'Consultation'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-ink-900 text-sm">{fmtDate(appt.appointment_date)}</div>
                            <div className="text-xs text-ink-500">{appt.appointment_time}</div>
                          </td>
                          <td className="p-4"><StatusPill status={appt.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </Reveal>

          {/* Medical records */}
          <Reveal>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
                <FileText className="size-6 text-brand-600" /> Medical records
              </h2>
              <Link href="/dashboard/profile" className="text-sm font-bold text-brand-700 hover:underline inline-flex items-center gap-1">
                Manage <ArrowRight className="size-4" />
              </Link>
            </div>
            {records.length === 0 ? (
              <Card>
                <EmptyState
                  title="No records yet"
                  copy="Upload lab reports and prescriptions from your profile so your doctor can see them before your visit."
                  action={<Link href="/dashboard/profile"><Button variant="secondary">Go to my profile</Button></Link>}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.slice(0, 6).map(rec => (
                  <Card key={rec.id} className="lift p-5">
                    <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide">
                      {rec.report_type || 'Report'}
                    </span>
                    <h3 className="font-bold text-ink-900 mt-2.5 line-clamp-1">{rec.title || 'Untitled report'}</h3>
                    <p className="text-xs text-ink-500 mt-1">{rec.doctor_name || '—'} · {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : ''}</p>
                    {rec.file_url && (
                      <a href={rec.file_url} download={rec.title || 'report'} className="mt-4 inline-flex">
                        <Button variant="outline" size="sm"><Download className="size-3.5" /> Download</Button>
                      </a>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
