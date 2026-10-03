'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSessionProfile } from '@/lib/auth';
import { updateProfile, recordsForPatient, createRecord, deleteRecord, type Profile, type MedicalRecord } from '@/lib/db';
import { Button, Card, Avatar, Input, Label, Textarea, Modal, EmptyState, Reveal } from '@/components/ui-kit';
import { ArrowLeft, Save, FileText, Download, Trash2, Plus, UserRound, Activity, Droplets, UploadCloud } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const REPORT_TYPES = ['Blood Test Report', 'Prescription', 'X-Ray / MRI Scan', 'Urine Test Report', 'Discharge Summary', 'Other'];

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [form, setForm] = useState({
    full_name: '', phone: '', city: '', dob: '', gender: '',
    blood_group: '', weight: '', height: '', allergies: '',
    chronic_diseases: '', emergency_contact: '', current_symptoms: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [upload, setUpload] = useState({ title: '', type: 'Blood Test Report', notes: '', file: null as File | null });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const load = async () => {
      const p = await getSessionProfile();
      if (!p) {
        router.replace('/login');
        return;
      }
      setProfile(p);
      setForm({
        full_name: p.full_name || '', phone: p.phone || '', city: p.city || '',
        dob: p.dob || '', gender: p.gender || '', blood_group: p.blood_group || '',
        weight: p.weight || '', height: p.height || '', allergies: p.allergies || '',
        chronic_diseases: p.chronic_diseases || '', emergency_contact: p.emergency_contact || '',
        current_symptoms: p.current_symptoms || '',
      });
      if (p.role === 'patient') {
        setRecords(await recordsForPatient(p.id));
      }
      setIsLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSavedMsg('');
    await updateProfile(profile.id, { ...form });
    setProfile({ ...profile, ...form });
    setIsSaving(false);
    setSavedMsg('Profile saved successfully.');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUploading(true);
    try {
      let fileUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`${upload.type}\n${upload.notes || 'Uploaded by patient (no file attached).'}`);
      if (upload.file) {
        try {
          fileUrl = await fileToDataUrl(upload.file);
        } catch {
          setUploading(false);
          return;
        }
      }
      const rec = await createRecord({
        patient_id: profile.id,
        doctor_name: upload.notes || undefined,
        title: upload.title || upload.file?.name || upload.type,
        report_type: upload.type,
        file_url: fileUrl,
        uploaded_by: 'Patient',
        created_at: new Date().toISOString(),
      });
      setRecords(cur => [rec, ...cur]);
      setShowUpload(false);
      setUpload({ title: '', type: 'Blood Test Report', notes: '', file: null });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Permanently delete this report?')) return;
    await deleteRecord(id);
    setRecords(cur => cur.filter(r => r.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
          <p className="font-display text-xl text-ink-900">Loading your profile</p>
        </div>
      </div>
    );
  }

  const isPatient = profile?.role === 'patient';
  const backHref = profile ? `/dashboard/${profile.role}` : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <SiteHeader />

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)}>
        <form onSubmit={handleUpload} className="p-8">
          <h3 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
            <UploadCloud className="size-6 text-brand-600" /> Upload medical report
          </h3>
          <p className="text-ink-500 text-sm mt-1">Attach a lab result or prescription for your doctor to review.</p>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="rec-title">Title</Label>
              <Input id="rec-title" placeholder="e.g. CBC Report — Chughtai Lab" value={upload.title} onChange={e => setUpload({ ...upload, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="rec-type">Report type</Label>
              <select id="rec-type" value={upload.type} onChange={e => setUpload({ ...upload, type: e.target.value })}
                className="w-full rounded-2xl border border-ink-900/15 bg-white px-4 py-3 text-[15px] font-medium text-ink-900 appearance-none pr-10 cursor-pointer focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none">
                {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="rec-notes">Notes</Label>
              <Textarea id="rec-notes" placeholder="Anything your doctor should know…" value={upload.notes} onChange={e => setUpload({ ...upload, notes: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="rec-file">Attach file (PDF or image)</Label>
              <input id="rec-file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUpload({ ...upload, file: e.target.files?.[0] || null })}
                className="w-full text-sm text-ink-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all cursor-pointer" />
            </div>
          </div>
          <Button type="submit" loading={uploading} className="w-full mt-6" size="lg">
            Save report
          </Button>
        </form>
      </Modal>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
          <Reveal>
            <Link href={backHref} className="inline-flex items-center gap-2 text-ink-500 hover:text-brand-700 font-bold text-sm mb-4">
              <ArrowLeft className="size-4" /> Back to dashboard
            </Link>
            <div className="flex items-center gap-4">
              <Avatar name={profile?.full_name || 'User'} size="lg" />
              <div>
                <span className="eyebrow">My profile</span>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tracking-tight mt-1">
                  {profile?.full_name}
                </h1>
                <p className="text-ink-500 text-sm mt-1 capitalize">{profile?.role} · {profile?.email}</p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <Card className="p-6 sm:p-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink-900 flex items-center gap-2 pb-4 mb-6 border-b border-ink-900/[0.07]">
                    <UserRound className="size-5 text-brand-600" /> Personal information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" value={form.full_name} onChange={set('full_name')} /></div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" placeholder="03xx xxxxxxx" value={form.phone} onChange={set('phone')} /></div>
                    <div><Label htmlFor="city">City</Label><Input id="city" placeholder="Karachi" value={form.city} onChange={set('city')} /></div>
                    <div><Label htmlFor="dob">Date of birth</Label><Input id="dob" type="date" value={form.dob} onChange={set('dob')} /></div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select id="gender" value={form.gender} onChange={set('gender')}
                        className="w-full rounded-2xl border border-ink-900/15 bg-white px-4 py-3 text-[15px] font-medium text-ink-900 appearance-none pr-10 cursor-pointer focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none">
                        <option value="">Select…</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div><Label htmlFor="emergency">Emergency contact</Label><Input id="emergency" placeholder="Relative's phone number" value={form.emergency_contact} onChange={set('emergency_contact')} /></div>
                  </div>
                </div>

                {isPatient && (
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink-900 flex items-center gap-2 pb-4 mb-6 border-b border-ink-900/[0.07]">
                      <Activity className="size-5 text-red-600" /> Medical profile
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-5 mb-5">
                      <div>
                        <Label htmlFor="blood">Blood group</Label>
                        <select id="blood" value={form.blood_group} onChange={set('blood_group')}
                          className="w-full rounded-2xl border border-ink-900/15 bg-white px-4 py-3 text-[15px] font-medium text-ink-900 appearance-none pr-10 cursor-pointer focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none">
                          <option value="">Select…</option>
                          {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div><Label htmlFor="weight">Weight</Label><Input id="weight" placeholder="e.g. 72 kg" value={form.weight} onChange={set('weight')} /></div>
                      <div><Label htmlFor="height">Height</Label><Input id="height" placeholder="e.g. 5 ft 10 in" value={form.height} onChange={set('height')} /></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div><Label htmlFor="allergies">Known allergies</Label><Input id="allergies" placeholder="e.g. Penicillin, dust" value={form.allergies} onChange={set('allergies')} /></div>
                      <div><Label htmlFor="chronic">Chronic diseases</Label><Input id="chronic" placeholder="e.g. Diabetes, hypertension" value={form.chronic_diseases} onChange={set('chronic_diseases')} /></div>
                    </div>
                    <div className="mt-5">
                      <Label htmlFor="symptoms">Current symptoms</Label>
                      <Textarea id="symptoms" placeholder="Describe what you are feeling…" value={form.current_symptoms} onChange={set('current_symptoms')} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-ink-900/[0.07]">
                  {savedMsg && <p className="text-sm font-bold text-brand-700">{savedMsg}</p>}
                  <Button type="submit" loading={isSaving} size="lg">
                    <Save className="size-4" /> {isSaving ? 'Saving…' : 'Save profile'}
                  </Button>
                </div>
              </form>
            </Card>
          </Reveal>

          {isPatient && (
            <Reveal>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl font-semibold text-ink-900 flex items-center gap-2">
                  <FileText className="size-6 text-brand-600" /> My medical records
                </h2>
                <Button onClick={() => setShowUpload(true)}>
                  <Plus className="size-4" /> Upload report
                </Button>
              </div>
              {records.length === 0 ? (
                <Card>
                  <EmptyState
                    title="No records uploaded"
                    copy="Keep your lab reports and prescriptions here so they are always at hand during a visit."
                    action={<Button variant="secondary" onClick={() => setShowUpload(true)}>Upload your first report</Button>}
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {records.map(rec => (
                    <Card key={rec.id} className="lift p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-800 border border-brand-200 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide">
                            {rec.report_type || 'Report'}
                          </span>
                          <h3 className="font-bold text-ink-900 mt-2 truncate">{rec.title || 'Untitled report'}</h3>
                          <p className="text-xs text-ink-500 mt-1">
                            {rec.uploaded_by === 'Doctor' ? `Dr. ${rec.doctor_name || '—'}` : 'Uploaded by you'} · {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          aria-label="Delete report"
                          className="size-9 rounded-full text-ink-500 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
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
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
