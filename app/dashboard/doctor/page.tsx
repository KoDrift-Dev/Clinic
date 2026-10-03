'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSessionProfile } from '@/lib/auth';
import { getProfile, appointmentsForDoctor, updateAppointment, recordsForPatient, createRecord, type Appointment, type Profile, type MedicalRecord } from '@/lib/db';
import { Button, Card, Avatar, StatusPill, EmptyState, Modal, Label, Textarea, Reveal } from '@/components/ui-kit';
import { Users, Clock, BadgeCheck, Wallet, CalendarDays, FileText, Download, FilePlus2, Activity, Droplets, Scale, Ruler, Stethoscope, X } from 'lucide-react';

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function fmtDate(d: string) {
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

const mkPrescriptionDoc = (doctor: Profile, patientName: string, reason: string, notes: string) =>
  'data:text/plain;charset=utf-8,' +
  encodeURIComponent(
    `DIGITAL PRESCRIPTION\n` +
      `Crescent Care Medibook\n\n` +
      `Doctor: ${doctor.full_name} — ${doctor.specialty || 'General'}\n` +
      `${doctor.hospital || ''}${doctor.hospital && doctor.city ? ', ' : ''}${doctor.city || ''}\n\n` +
      `Patient: ${patientName}\n` +
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Diagnosis / reason: ${reason || 'General consultation'}\n\n` +
      `Doctor's notes:\n${notes || '—'}\n\n` +
      `— ${doctor.full_name}\n` +
      `This prescription was issued digitally through Crescent Care Medibook.`,
  );

export default function DoctorDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [doctor, setDoctor] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Patient file modal
  const [fileAppt, setFileAppt] = useState<Appointment | null>(null);
  const [patientProfile, setPatientProfile] = useState<Profile | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [loadingFile, setLoadingFile] = useState(false);

  // Prescription composer
  const [rxNotes, setRxNotes] = useState('');
  const [savingRx, setSavingRx] = useState(false);

  // Cancel confirm
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  useEffect(() => {
    const load = async () => {
      const profile = await getSessionProfile();
      if (!profile) {
        router.replace('/login');
        return;
      }
      if (profile.role !== 'doctor' && profile.role !== 'admin') {
        router.replace('/');
        return;
      }
      setDoctor(profile);
      const data = await appointmentsForDoctor(profile.id);
      setAppointments(data);
      setIsLoading(false);
    };
    load();
  }, [router]);

  const updateStatus = async (id: string, status: string) => {
    setAppointments(cur => cur.map(a => (a.id === id ? { ...a, status } : a)));
    await updateAppointment(id, { status });
    if (cancelTarget?.id === id) setCancelTarget(null);
  };

  const openFile = async (appt: Appointment) => {
    setFileAppt(appt);
    setRxNotes('');
    setLoadingFile(true);
    setPatientProfile(null);
    setPatientRecords([]);
    const [profile, records] = await Promise.all([
      getProfile(appt.patient_id),
      recordsForPatient(appt.patient_id),
    ]);
    setPatientProfile(profile);
    setPatientRecords(records);
    setLoadingFile(false);
  };

  const handlePrescribe = async () => {
    if (!fileAppt || !doctor) return;
    setSavingRx(true);
    const patientName = fileAppt.patient_name || patientProfile?.full_name || 'Patient';
    const record = await createRecord({
      patient_id: fileAppt.patient_id,
      doctor_name: doctor.full_name,
      title: `Digital Prescription — ${new Date().toLocaleDateString()}`,
      report_type: 'Prescription',
      uploaded_by: 'Doctor',
      file_url: mkPrescriptionDoc(doctor, patientName, fileAppt.disease || '', rxNotes),
      created_at: new Date().toISOString(),
    });
    setPatientRecords(cur => [record, ...cur]);
    setRxNotes('');
    setSavingRx(false);
  };

  const groups = useMemo(() => {
    const active = appointments.filter(a => !['Canceled', 'Completed'].includes(a.status));
    return {
      today: active.filter(a => isToday(a.appointment_date)),
      upcoming: active.filter(a => !isToday(a.appointment_date)),
      completed: appointments.filter(a => a.status === 'Completed'),
    };
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
          <p className="font-display text-xl text-ink-900">Syncing your schedule</p>
        </div>
      </div>
    );
  }

  const completedRevenue = groups.completed.reduce((sum, a) => sum + (a.fee || 0), 0);
  const pendingRevenue = [...groups.today, ...groups.upcoming].reduce((sum, a) => sum + (a.fee || 0), 0);

  const stats = [
    { label: "Today's patients", value: groups.today.length, icon: Users, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Pending queue', value: groups.upcoming.length + groups.today.filter(a => a.status === 'Pending').length, icon: Clock, tone: 'bg-glow-100 text-[#8a5a12]' },
    { label: 'Completed visits', value: groups.completed.length, icon: BadgeCheck, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Revenue (completed)', value: `Rs. ${completedRevenue.toLocaleString()}`, icon: Wallet, tone: 'bg-pine-900 text-white' },
  ];

  const RowActions = ({ appt }: { appt: Appointment }) => (
    <div className="flex flex-wrap justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => openFile(appt)}>
        <FileText className="size-3.5" /> Patient file
      </Button>
      {appt.status === 'Pending' && (
        <Button variant="secondary" size="sm" onClick={() => updateStatus(appt.id, 'Confirmed')}>
          Confirm
        </Button>
      )}
      {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
        <Button variant="primary" size="sm" onClick={() => updateStatus(appt.id, 'Completed')}>
          Mark complete
        </Button>
      )}
      {!['Canceled', 'Completed'].includes(appt.status) && (
        <Button variant="danger" size="sm" onClick={() => setCancelTarget(appt)}>
          Cancel
        </Button>
      )}
    </div>
  );

  const ApptTable = ({ title, data, emptyCopy, icon: Icon }: { title: string; data: Appointment[]; emptyCopy: string; icon: typeof Users }) => (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b border-ink-900/[0.07] flex items-center gap-3">
        <span className="size-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <Icon className="size-5" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
        <span className="ml-auto font-display text-2xl font-semibold text-ink-900 tnum">{data.length}</span>
      </div>
      {data.length === 0 ? (
        <EmptyState title={title} copy={emptyCopy} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[680px]">
            <thead>
              <tr className="bg-cream-50 text-ink-500 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-bold">Date & time</th>
                <th className="p-4 font-bold">Patient</th>
                <th className="p-4 font-bold">Reason</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.06]">
              {data.map(appt => (
                <tr key={appt.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-ink-900 text-sm">{fmtDate(appt.appointment_date)}</div>
                    <div className="text-xs text-ink-500">{appt.appointment_time}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={appt.patient_name || appt.patient?.full_name || 'Patient'} size="sm" />
                      <span className="font-bold text-ink-900 text-sm">{appt.patient_name || appt.patient?.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-ink-500 max-w-44 truncate">{appt.disease || 'General consultation'}</td>
                  <td className="p-4"><StatusPill status={appt.status} /></td>
                  <td className="p-4"><RowActions appt={appt} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <SiteHeader />

      {/* Cancel confirm */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)}>
        <div className="p-8 text-center">
          <div className="size-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <X className="size-6 text-red-600" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-ink-900">Cancel this appointment?</h3>
          <p className="text-ink-500 text-sm mt-2">{cancelTarget?.patient_name || 'The patient'} will need to book again.</p>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)}>Keep it</Button>
            <Button variant="danger" className="flex-1" onClick={() => cancelTarget && updateStatus(cancelTarget.id, 'Canceled')}>Yes, cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Patient file modal */}
      <Modal open={!!fileAppt} onClose={() => setFileAppt(null)} wide>
        <div className="p-6 sm:p-8">
          <h3 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-3 pr-10">
            <Avatar name={fileAppt?.patient_name || 'Patient'} size="md" />
            <span>
              {fileAppt?.patient_name || 'Patient'}
              <span className="block text-sm font-sans font-medium text-ink-500">Appointment · {fileAppt && fmtDate(fileAppt.appointment_date)} · {fileAppt?.appointment_time}</span>
            </span>
          </h3>

          {loadingFile ? (
            <div className="py-12 text-center">
              <div className="size-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-ink-500">Loading patient file…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Vitals */}
              <div>
                <Card className="p-6">
                  <h4 className="font-bold text-ink-900 flex items-center gap-2 mb-4">
                    <Activity className="size-4 text-red-600" /> Vitals & health notes
                  </h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div><dt className="text-[11px] uppercase tracking-wide font-bold text-ink-500 flex items-center gap-1"><Droplets className="size-3.5 text-red-500" /> Blood group</dt><dd className="font-bold text-ink-900">{patientProfile?.blood_group || '—'}</dd></div>
                    <div><dt className="text-[11px] uppercase tracking-wide font-bold text-ink-500">Gender</dt><dd className="font-bold text-ink-900">{patientProfile?.gender || '—'}</dd></div>
                    <div><dt className="text-[11px] uppercase tracking-wide font-bold text-ink-500 flex items-center gap-1"><Scale className="size-3.5 text-brand-600" /> Weight</dt><dd className="font-bold text-ink-900">{patientProfile?.weight || '—'}</dd></div>
                    <div><dt className="text-[11px] uppercase tracking-wide font-bold text-ink-500 flex items-center gap-1"><Ruler className="size-3.5 text-brand-600" /> Height</dt><dd className="font-bold text-ink-900">{patientProfile?.height || '—'}</dd></div>
                  </dl>
                  <div className="mt-4 pt-4 border-t border-ink-900/[0.07] space-y-3 text-sm">
                    <div><p className="text-[11px] uppercase tracking-wide font-bold text-ink-500">Allergies</p><p className="font-medium text-ink-900">{patientProfile?.allergies || 'None recorded'}</p></div>
                    <div><p className="text-[11px] uppercase tracking-wide font-bold text-ink-500">Chronic diseases</p><p className="font-medium text-ink-900">{patientProfile?.chronic_diseases || 'None recorded'}</p></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-ink-900/[0.07]">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-ink-500 flex items-center gap-1.5"><Stethoscope className="size-3.5 text-glow-400" /> Appointment reason</p>
                    <p className="mt-1.5 text-sm font-medium text-[#8a5a12] bg-glow-100 border border-[#ecd9a8] rounded-2xl px-4 py-3">{fileAppt?.disease || 'General consultation'}</p>
                  </div>
                </Card>
              </div>

              {/* Records + prescription */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-bold text-ink-900 flex items-center gap-2 mb-4">
                    <FileText className="size-4 text-brand-600" /> Medical records ({patientRecords.length})
                  </h4>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {patientRecords.length === 0 ? (
                      <p className="text-sm text-ink-500 italic">No records on file for this patient.</p>
                    ) : (
                      patientRecords.map(rec => (
                        <div key={rec.id} className="flex items-center justify-between gap-3 border border-ink-900/[0.08] rounded-2xl px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink-900 truncate">{rec.title || rec.report_type || 'Report'}</p>
                            <p className="text-xs text-ink-500 truncate">{rec.report_type || ''} · {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : ''}</p>
                          </div>
                          {rec.file_url && (
                            <a href={rec.file_url} download={rec.title || 'report'} className="shrink-0">
                              <Button variant="outline" size="sm" className="px-3"><Download className="size-3.5" /></Button>
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-bold text-ink-900 flex items-center gap-2 mb-1">
                    <FilePlus2 className="size-4 text-brand-600" /> Digital prescription
                  </h4>
                  <p className="text-xs text-ink-500 mb-3">Write your notes — a downloadable prescription document is saved to the patient&apos;s file.</p>
                  <Label htmlFor="rx-notes">Prescription notes</Label>
                  <Textarea id="rx-notes" placeholder="e.g. Tab. Paracetamol 500mg — twice daily after meals for 5 days…" value={rxNotes} onChange={e => setRxNotes(e.target.value)} />
                  <Button onClick={handlePrescribe} loading={savingRx} className="w-full mt-4">
                    <FilePlus2 className="size-4" /> Save prescription
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <Avatar name={doctor?.full_name || 'Doctor'} size="lg" photo={doctor?.photo} />
                <div>
                  <span className="eyebrow">Doctor dashboard</span>
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight mt-1">
                    Dr. {doctor?.full_name?.replace(/^Dr\.\s*/i, '') || '—'}
                  </h1>
                  <p className="text-ink-500 text-sm mt-1">{doctor?.specialty || ''}{doctor?.hospital ? ` · ${doctor.hospital}` : ''}</p>
                </div>
              </div>
              <StatusPill status="Live" />
            </div>
          </Reveal>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <Card className="lift p-5 flex items-center gap-3.5">
                  <span className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${s.tone}`}>
                    <s.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl sm:text-2xl font-semibold text-ink-900 tnum truncate">{s.value}</p>
                    <p className="text-xs text-ink-500 font-medium">{s.label}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Financial summary band */}
          <Reveal>
            <div className="bg-pine-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 dot-grid-light opacity-40" aria-hidden />
              <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                <div>
                  <span className="eyebrow on-dark">Financial summary</span>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-2">Your practice at a glance</h2>
                </div>
                <div className="flex flex-wrap gap-8 sm:gap-12 sm:ml-auto">
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wide">Earned (completed)</p>
                    <p className="font-display text-3xl font-semibold text-white tnum mt-1">Rs. {completedRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wide">Expected (queued)</p>
                    <p className="font-display text-3xl font-semibold text-glow-400 tnum mt-1">Rs. {pendingRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <ApptTable title="Today's schedule" data={groups.today} icon={CalendarDays} emptyCopy="Nothing booked for today. New requests will appear here." />
          </Reveal>
          <Reveal>
            <ApptTable title="Upcoming queue" data={groups.upcoming} icon={Clock} emptyCopy="No upcoming appointments beyond today." />
          </Reveal>
          <Reveal>
            <ApptTable title="Completed visits" data={groups.completed} icon={BadgeCheck} emptyCopy="No completed visits yet." />
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
