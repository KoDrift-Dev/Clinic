'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSessionProfile } from '@/lib/auth';
import {
  listDoctors, listPatients, listAppointments, updateProfile, deleteProfile,
  deleteAppointment, resetDemoData, listContactMessages,
  type Profile, type Appointment, type ContactMessage,
} from '@/lib/db';
import { Button, Card, Avatar, StatusPill, EmptyState, Modal, Input, Label, Badge, Reveal } from '@/components/ui-kit';
import {
  Activity, Users, Stethoscope, CalendarDays, Wallet, Trash2, Pencil, X, Save,
  Search, RotateCcw, Inbox, ShieldCheck, ChevronDown,
} from 'lucide-react';

type Tab = 'overview' | 'doctors' | 'patients' | 'appointments' | 'messages';

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'messages', label: 'Inbox', icon: Inbox },
];

const STATUSES = ['All', 'Pending', 'Confirmed', 'Completed', 'Canceled'];

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [patients, setPatients] = useState<Profile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Edit user modal
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Appointments filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const profile = await getSessionProfile();
      if (!profile) {
        router.replace('/login');
        return;
      }
      if (profile.role !== 'admin') {
        router.replace('/');
        return;
      }
      const [docs, pats, appts, msgs] = await Promise.all([
        listDoctors(),
        listPatients(),
        listAppointments(),
        listContactMessages(),
      ]);
      setDoctors(docs);
      setPatients(pats);
      setAppointments(appts);
      setMessages(msgs);
      setIsLoading(false);
    };
    load();
  }, [router]);

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    const updated = await updateProfile(editingUser.id, { ...editForm, id: undefined });
    if (updated) {
      if (editingUser.role === 'doctor') setDoctors(ds => ds.map(d => (d.id === editingUser.id ? { ...d, ...editForm } : d)));
      else setPatients(ps => ps.map(p => (p.id === editingUser.id ? { ...p, ...editForm } : p)));
      setEditingUser(null);
    }
    setIsSaving(false);
  };

  const handleDeleteUser = async (id: string, role: string) => {
    if (!window.confirm(`Permanently delete this ${role}? This cannot be undone.`)) return;
    await deleteProfile(id);
    if (role === 'doctor') setDoctors(ds => ds.filter(d => d.id !== id));
    else setPatients(ps => ps.filter(p => p.id !== id));
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Delete this appointment record forever?')) return;
    await deleteAppointment(id);
    setAppointments(as => as.filter(a => a.id !== id));
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all demo data back to the original seed? Your changes will be lost.')) return;
    setResetting(true);
    await resetDemoData();
    window.location.reload();
  };

  const totalRevenue = useMemo(
    () => appointments.filter(a => a.status === 'Completed').reduce((s, a) => s + (a.fee || 0), 0),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter(a => {
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const hay = `${a.patient_name || ''} ${a.patient?.full_name || ''} ${a.doctor?.full_name || ''} ${a.appointment_date} ${a.appointment_time}`.toLowerCase();
      return matchesStatus && (!q || hay.includes(q));
    });
  }, [appointments, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
          <p className="font-display text-xl text-ink-900">Loading command center</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Doctors', value: doctors.length, icon: Stethoscope, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Patients', value: patients.length, icon: Users, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Appointments', value: appointments.length, icon: CalendarDays, tone: 'bg-glow-100 text-[#8a5a12]' },
    { label: 'Revenue (completed)', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: Wallet, tone: 'bg-pine-900 text-white' },
  ];

  const UserRow = ({ user }: { user: Profile }) => (
    <tr className="hover:bg-cream-50/60 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.full_name} size="sm" />
          <div>
            <p className="font-bold text-ink-900 text-sm">{user.full_name}</p>
            <p className="text-xs text-ink-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-sm text-ink-500">
        {user.role === 'doctor' ? (
          <>
            <p className="font-bold text-brand-700">{user.specialty || 'Unassigned'}</p>
            <p className="text-xs">{user.hospital || 'No clinic'} · {user.city || 'No city'}</p>
          </>
        ) : (
          <>
            <p>{user.phone || 'No phone'}</p>
            <p className="text-xs">Blood: {user.blood_group || '—'}</p>
          </>
        )}
      </td>
      {user.role === 'doctor' && (
        <td className="p-4 font-display font-semibold text-ink-900 tnum">Rs. {(user.fee || 0).toLocaleString()}</td>
      )}
      <td className="p-4 text-right whitespace-nowrap">
        <button
          onClick={() => { setEditingUser(user); setEditForm({ ...user }); }}
          aria-label={`Edit ${user.full_name}`}
          className="size-9 rounded-full text-ink-500 hover:text-brand-700 hover:bg-brand-50 inline-flex items-center justify-center transition-colors cursor-pointer mr-1"
        >
          <Pencil className="size-4" />
        </button>
        <button
          onClick={() => handleDeleteUser(user.id, user.role)}
          aria-label={`Delete ${user.full_name}`}
          className="size-9 rounded-full text-ink-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition-colors cursor-pointer"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <SiteHeader />

      {/* Edit user modal */}
      <Modal open={!!editingUser} onClose={() => setEditingUser(null)}>
        <div className="p-8">
          <h3 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
            <Pencil className="size-5 text-brand-600" /> Edit {editingUser?.role}
          </h3>
          <div className="mt-6 space-y-4">
            <div><Label>Full name</Label><Input value={editForm.full_name || ''} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
            {editingUser?.role === 'doctor' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Specialty</Label><Input value={editForm.specialty || ''} onChange={e => setEditForm({ ...editForm, specialty: e.target.value })} /></div>
                  <div><Label>Fee (Rs.)</Label><Input type="number" value={editForm.fee || ''} onChange={e => setEditForm({ ...editForm, fee: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Hospital / clinic</Label><Input value={editForm.hospital || ''} onChange={e => setEditForm({ ...editForm, hospital: e.target.value })} /></div>
                <div><Label>City</Label><Input value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} /></div>
              </>
            )}
            {editingUser?.role === 'patient' && (
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                <div><Label>Blood group</Label><Input value={editForm.blood_group || ''} onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })} /></div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button className="flex-1" loading={isSaving} onClick={handleSaveUser}><Save className="size-4" /> Save changes</Button>
          </div>
        </div>
      </Modal>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
              <div>
                <span className="eyebrow">Admin console</span>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight mt-2 flex items-center gap-3">
                  Command center
                  <Badge tone="pine"><ShieldCheck className="size-3.5" /> Admin</Badge>
                </h1>
                <p className="text-ink-500 text-sm mt-1">Full control over users, appointments and demo data.</p>
              </div>
              <Button variant="danger" onClick={handleReset} loading={resetting}>
                <RotateCcw className="size-4" /> Reset demo data
              </Button>
            </div>
          </Reveal>

          {/* Tabs */}
          <div className="overflow-x-auto pb-2 mb-8">
            <div className="flex gap-2 w-max">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-pine-900 text-white shadow-soft' : 'bg-white text-ink-600 border border-ink-900/[0.08] hover:border-brand-400'
                  }`}
                >
                  <tab.icon className="size-4" /> {tab.label}
                  {tab.id === 'messages' && messages.length > 0 && (
                    <span className="size-5 rounded-full bg-glow-400 text-ink-900 text-[10px] font-extrabold flex items-center justify-center tnum">{messages.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <Reveal key={s.label} delay={i * 70}>
                    <Card className="lift p-6">
                      <span className={`size-11 rounded-2xl flex items-center justify-center ${s.tone} mb-4`}>
                        <s.icon className="size-5" />
                      </span>
                      <p className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 tnum">{s.value}</p>
                      <p className="text-sm text-ink-500 font-medium">{s.label}</p>
                    </Card>
                  </Reveal>
                ))}
              </div>
              <Reveal>
                <Card className="p-6 sm:p-8">
                  <h2 className="font-display text-xl font-semibold text-ink-900 mb-2">Platform health</h2>
                  <p className="text-sm text-ink-500 mb-5">Local demo mode — all data lives in this browser&apos;s storage.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Session & auth', 'Local database', 'Browser storage'].map(name => (
                      <div key={name} className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-brand-50 border border-brand-200">
                        <span className="font-bold text-brand-900 text-sm">{name}</span>
                        <span className="inline-flex items-center gap-1.5 text-brand-700 text-xs font-extrabold">
                          <span className="size-2 rounded-full bg-brand-600 animate-pulse" /> Operational
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Reveal>
            </div>
          )}

          {activeTab === 'doctors' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[680px]">
                  <thead><tr className="bg-cream-50 text-ink-500 text-[11px] uppercase tracking-wider">
                    <th className="p-4 font-bold">Doctor</th><th className="p-4 font-bold">Specialty & clinic</th><th className="p-4 font-bold">Fee</th><th className="p-4 font-bold text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-ink-900/[0.06]">
                    {doctors.length === 0
                      ? <tr><td colSpan={4}><EmptyState title="No doctors" copy="Doctor accounts will appear here once registered." /></td></tr>
                      : doctors.map(d => <UserRow key={d.id} user={d} />)}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'patients' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[620px]">
                  <thead><tr className="bg-cream-50 text-ink-500 text-[11px] uppercase tracking-wider">
                    <th className="p-4 font-bold">Patient</th><th className="p-4 font-bold">Contact & health</th><th className="p-4 font-bold text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-ink-900/[0.06]">
                    {patients.length === 0
                      ? <tr><td colSpan={3}><EmptyState title="No patients" copy="Patient accounts will appear here once registered." /></td></tr>
                      : patients.map(p => <UserRow key={p.id} user={p} />)}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <Card className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                  <Input placeholder="Search patient, doctor, date…" value={search} onChange={e => setSearch(e.target.value)} className="pl-11" />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="appearance-none w-full sm:w-48 rounded-2xl border border-ink-900/15 bg-white pl-4 pr-10 py-3 text-[15px] font-medium text-ink-900 cursor-pointer focus:border-brand-500 focus:outline-none"
                    aria-label="Filter by status"
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="size-4 absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                </div>
              </Card>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead><tr className="bg-cream-50 text-ink-500 text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold">Date & time</th><th className="p-4 font-bold">Doctor</th><th className="p-4 font-bold">Patient</th><th className="p-4 font-bold">Status & fee</th><th className="p-4 font-bold text-right">Delete</th>
                    </tr></thead>
                    <tbody className="divide-y divide-ink-900/[0.06]">
                      {filteredAppointments.length === 0 ? (
                        <tr><td colSpan={5}><EmptyState title="No appointments match" copy="Try a different search or status filter." /></td></tr>
                      ) : (
                        filteredAppointments.map(a => (
                          <tr key={a.id} className="hover:bg-cream-50/60 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-ink-900 text-sm">{new Date(a.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              <p className="text-xs text-ink-500">{a.appointment_time}</p>
                            </td>
                            <td className="p-4 text-sm font-bold text-ink-900">{a.doctor?.full_name || '—'}</td>
                            <td className="p-4 text-sm text-ink-900">{a.patient?.full_name || a.patient_name || '—'}</td>
                            <td className="p-4">
                              <StatusPill status={a.status} />
                              <p className="text-xs text-ink-500 font-bold mt-1.5 tnum">Rs. {(a.fee || 0).toLocaleString()}</p>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteAppointment(a.id)}
                                aria-label="Delete appointment"
                                className="size-9 rounded-full text-ink-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <Card><EmptyState title="Inbox is empty" copy="Messages from the contact page will land here." /></Card>
              ) : (
                messages.map(m => (
                  <Card key={m.id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="sm" />
                        <div>
                          <p className="font-bold text-ink-900 text-sm">{m.name}</p>
                          <p className="text-xs text-ink-500">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                        </div>
                      </div>
                      <p className="text-xs text-ink-400 font-medium">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    {m.subject && <p className="font-bold text-ink-900 text-sm mt-4">Subject: {m.subject}</p>}
                    <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{m.message}</p>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
