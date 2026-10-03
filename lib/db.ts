// Local data layer (TazaMart pattern): all data lives inside the app.
// Bundled fictional seed data + browser localStorage for user changes.
// No backend, no network calls. Demo-grade: do not store real personal data here.

export type Role = 'admin' | 'doctor' | 'patient';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  password?: string; // demo only — plain text in localStorage
  specialty?: string;
  qual?: string;
  exp?: string;
  fee?: number;
  hospital?: string;
  city?: string;
  avail?: string;
  off_days?: string;
  rating?: number;
  reviews?: number;
  initials?: string;
  bg?: string;
  photo?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  blood_group?: string;
  weight?: string;
  height?: string;
  allergies?: string;
  chronic_diseases?: string;
  disability?: string;
  emergency_contact?: string;
  current_symptoms?: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient_name: string;
  disease?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string;
  type?: string;
  payment_method?: string;
  fee?: number;
  status: string; // Pending | Confirmed | Completed | Canceled
  created_at?: string;
  doctor?: Profile | null;
  patient?: Profile | null;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_name?: string;
  title?: string;
  report_type?: string;
  file_url?: string;
  uploaded_by?: string;
  created_at?: string;
}

// ---------- date helpers (keeps demo data perpetually fresh) ----------
const dstr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};
const dts = (offsetDays: number, h = 10, m = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const rxFile = (text: string) =>
  'data:text/plain;charset=utf-8,' + encodeURIComponent(text);

// ---------- fictional seed data (all names/phones are invented) ----------
const SEED_PROFILES: Profile[] = [
  { id: 'adm-1', full_name: 'System Administrator', email: 'admin@crescentcare.pk', role: 'admin', password: 'demo123', initials: 'SA', bg: 'from-purple-600 to-purple-400', phone: '051-1112233', created_at: dts(-400) },

  { id: 'doc-1', full_name: 'Dr. Ayesha Khan', email: 'ayesha.khan@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'Cardiologist', qual: 'MBBS, FCPS (Cardiology)', exp: '12 years', fee: 3000, hospital: 'Shaukat Khanum Hospital', city: 'Lahore', avail: 'Mon–Sat, 10am–6pm', off_days: 'Sunday', rating: 4.9, reviews: 214, initials: 'AK', bg: 'from-blue-600 to-blue-400', photo: 'https://images.pexels.com/photos/7578811/pexels-photo-7578811.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0301-1112233', gender: 'Female', created_at: dts(-380) },
  { id: 'doc-2', full_name: 'Dr. Tariq Mahmood', email: 'tariq.mahmood@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'Dermatologist', qual: 'MBBS, DDSc', exp: '15 years', fee: 2500, hospital: 'Aga Khan University Hospital', city: 'Karachi', avail: 'Mon–Fri, 4pm–9pm', off_days: 'Saturday, Sunday', rating: 4.8, reviews: 186, initials: 'TM', bg: 'from-emerald-600 to-emerald-400', photo: 'https://images.pexels.com/photos/5888143/pexels-photo-5888143.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0302-2223344', gender: 'Male', created_at: dts(-370) },
  { id: 'doc-3', full_name: 'Dr. Sana Ahmed', email: 'sana.ahmed@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'Pediatrician', qual: 'MBBS, DCH', exp: '8 years', fee: 2000, hospital: "The Children's Hospital", city: 'Lahore', avail: 'Mon–Sat, 9am–2pm', off_days: 'Sunday', rating: 4.9, reviews: 243, initials: 'SA', bg: 'from-rose-500 to-rose-400', photo: 'https://images.pexels.com/photos/19963168/pexels-photo-19963168.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0303-3334455', gender: 'Female', created_at: dts(-360) },
  { id: 'doc-4', full_name: 'Dr. Bilal Hussain', email: 'bilal.hussain@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'Orthopedic Surgeon', qual: 'MBBS, MS (Ortho)', exp: '10 years', fee: 3500, hospital: 'Shifa International Hospital', city: 'Islamabad', avail: 'Tue–Sat, 11am–7pm', off_days: 'Sunday, Monday', rating: 4.7, reviews: 158, initials: 'BH', bg: 'from-amber-600 to-amber-400', photo: 'https://images.pexels.com/photos/4989148/pexels-photo-4989148.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0304-4445566', gender: 'Male', created_at: dts(-350) },
  { id: 'doc-5', full_name: 'Dr. Maria Siddiqui', email: 'maria.siddiqui@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'Gynecologist', qual: 'MBBS, FCPS', exp: '11 years', fee: 2800, hospital: 'Liaquat National Hospital', city: 'Karachi', avail: 'Mon–Sat, 10am–5pm', off_days: 'Sunday', rating: 4.8, reviews: 197, initials: 'MS', bg: 'from-purple-600 to-purple-400', photo: 'https://images.pexels.com/photos/5998467/pexels-photo-5998467.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0305-5556677', gender: 'Female', created_at: dts(-340) },
  { id: 'doc-6', full_name: 'Dr. Usman Farooq', email: 'usman.farooq@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'Neurologist', qual: 'MBBS, FCPS (Neurology)', exp: '9 years', fee: 3200, hospital: 'Punjab Institute of Neurosciences', city: 'Lahore', avail: 'Mon–Fri, 12pm–8pm', off_days: 'Saturday, Sunday', rating: 4.9, reviews: 176, initials: 'UF', bg: 'from-cyan-600 to-cyan-400', photo: 'https://images.pexels.com/photos/26886763/pexels-photo-26886763.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0306-6667788', gender: 'Male', created_at: dts(-330) },
  { id: 'doc-7', full_name: 'Dr. Hina Shahid', email: 'hina.shahid@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'General Physician', qual: 'MBBS', exp: '6 years', fee: 1500, hospital: 'Crescent Care Medical Center', city: 'Islamabad', avail: 'Mon–Sat, 9am–9pm', off_days: 'Sunday', rating: 4.6, reviews: 132, initials: 'HS', bg: 'from-teal-600 to-teal-400', photo: 'https://images.pexels.com/photos/5998482/pexels-photo-5998482.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0307-7778899', gender: 'Female', created_at: dts(-320) },
  { id: 'doc-8', full_name: 'Dr. Kamran Ali', email: 'kamran.ali@crescentcare.pk', role: 'doctor', password: 'demo123', specialty: 'Dentist', qual: 'BDS, MDS', exp: '7 years', fee: 1800, hospital: 'Crescent Care Medical Center', city: 'Lahore', avail: 'Mon–Sat, 10am–8pm', off_days: 'Sunday', rating: 4.7, reviews: 119, initials: 'KA', bg: 'from-indigo-600 to-indigo-400', photo: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg?auto=compress&cs=tinysrgb&w=600', phone: '0308-8889900', gender: 'Male', created_at: dts(-310) },

  { id: 'pat-1', full_name: 'Ahmed Raza', email: 'ahmed.raza@example.pk', role: 'patient', password: 'demo123', phone: '0321-4455667', gender: 'Male', dob: '1990-05-14', blood_group: 'O+', weight: '78 kg', height: '5 ft 10 in', allergies: 'Penicillin', chronic_diseases: 'Hypertension', disability: 'None', emergency_contact: '0300-9998887', current_symptoms: 'Chest discomfort on exertion', initials: 'AR', bg: 'from-slate-600 to-slate-400', created_at: dts(-200) },
  { id: 'pat-2', full_name: 'Fatima Noor', email: 'fatima.noor@example.pk', role: 'patient', password: 'demo123', phone: '0333-7788990', gender: 'Female', dob: '1985-11-02', blood_group: 'B+', weight: '62 kg', height: '5 ft 4 in', allergies: 'None', chronic_diseases: 'Diabetes Type 2', disability: 'None', emergency_contact: '0321-1122334', current_symptoms: 'Frequent headaches', initials: 'FN', bg: 'from-slate-600 to-slate-400', created_at: dts(-180) },
  { id: 'pat-3', full_name: 'Hassan Sheikh', email: 'hassan.sheikh@example.pk', role: 'patient', password: 'demo123', phone: '0345-2233445', gender: 'Male', dob: '1995-02-20', blood_group: 'A-', weight: '85 kg', height: '6 ft 0 in', allergies: 'Dust', chronic_diseases: 'None', disability: 'None', emergency_contact: '0301-5566778', current_symptoms: 'Knee pain after football', initials: 'HS', bg: 'from-slate-600 to-slate-400', created_at: dts(-160) },
  { id: 'pat-4', full_name: 'Amina Tariq', email: 'amina.tariq@example.pk', role: 'patient', password: 'demo123', phone: '0312-6677889', gender: 'Female', dob: '1992-08-30', blood_group: 'AB+', weight: '58 kg', height: '5 ft 3 in', allergies: 'None', chronic_diseases: 'None', disability: 'None', emergency_contact: '0333-4455667', current_symptoms: 'Skin rash on arms', initials: 'AT', bg: 'from-slate-600 to-slate-400', created_at: dts(-140) },
  { id: 'pat-5', full_name: 'Omar Farooq', email: 'omar.farooq@example.pk', role: 'patient', password: 'demo123', phone: '0300-3344556', gender: 'Male', dob: '1988-12-11', blood_group: 'O-', weight: '90 kg', height: '5 ft 11 in', allergies: 'Sulfa drugs', chronic_diseases: 'None', disability: 'None', emergency_contact: '0321-7788990', current_symptoms: 'Toothache, lower left molar', initials: 'OF', bg: 'from-slate-600 to-slate-400', created_at: dts(-120) },
  { id: 'pat-6', full_name: 'Zainab Malik', email: 'zainab.malik@example.pk', role: 'patient', password: 'demo123', phone: '0332-9900112', gender: 'Female', dob: '2001-04-25', blood_group: 'B-', weight: '55 kg', height: '5 ft 2 in', allergies: 'None', chronic_diseases: 'Asthma', disability: 'None', emergency_contact: '0302-3344556', current_symptoms: 'Fever and cough for 3 days', initials: 'ZM', bg: 'from-slate-600 to-slate-400', created_at: dts(-100) },
];

const SEED_APPOINTMENTS: Appointment[] = [
  { id: 'appt-1', doctor_id: 'doc-1', patient_id: 'pat-1', patient_name: 'Ahmed Raza', disease: 'Chest discomfort', appointment_date: dstr(-21), appointment_time: '10:00 AM', type: 'Consultation', payment_method: 'Online', fee: 3000, status: 'Completed', created_at: dts(-21) },
  { id: 'appt-2', doctor_id: 'doc-3', patient_id: 'pat-6', patient_name: 'Zainab Malik', disease: 'Fever and cough', appointment_date: dstr(-18), appointment_time: '11:30 AM', type: 'Consultation', payment_method: 'Cash', fee: 2000, status: 'Completed', created_at: dts(-18) },
  { id: 'appt-3', doctor_id: 'doc-2', patient_id: 'pat-4', patient_name: 'Amina Tariq', disease: 'Skin rash', appointment_date: dstr(-15), appointment_time: '04:00 PM', type: 'Consultation', payment_method: 'Online', fee: 2500, status: 'Completed', created_at: dts(-15) },
  { id: 'appt-4', doctor_id: 'doc-7', patient_id: 'pat-2', patient_name: 'Fatima Noor', disease: 'Headache', appointment_date: dstr(-12), appointment_time: '10:30 AM', type: 'Follow-up', payment_method: 'Cash', fee: 1500, status: 'Completed', created_at: dts(-12) },
  { id: 'appt-5', doctor_id: 'doc-4', patient_id: 'pat-3', patient_name: 'Hassan Sheikh', disease: 'Knee pain', appointment_date: dstr(-9), appointment_time: '05:00 PM', type: 'Consultation', payment_method: 'Online', fee: 3500, status: 'Completed', created_at: dts(-9) },
  { id: 'appt-6', doctor_id: 'doc-5', patient_id: 'pat-2', patient_name: 'Fatima Noor', disease: 'Routine checkup', appointment_date: dstr(-6), appointment_time: '11:00 AM', type: 'Follow-up', payment_method: 'Cash', fee: 2800, status: 'Completed', created_at: dts(-6) },
  { id: 'appt-7', doctor_id: 'doc-8', patient_id: 'pat-5', patient_name: 'Omar Farooq', disease: 'Toothache', appointment_date: dstr(-4), appointment_time: '04:30 PM', type: 'Consultation', payment_method: 'Online', fee: 1800, status: 'Completed', created_at: dts(-4) },
  { id: 'appt-8', doctor_id: 'doc-6', patient_id: 'pat-1', patient_name: 'Ahmed Raza', disease: 'Migraine evaluation', appointment_date: dstr(-2), appointment_time: '05:30 PM', type: 'Consultation', payment_method: 'Cash', fee: 3200, status: 'Completed', created_at: dts(-2) },
  { id: 'appt-9', doctor_id: 'doc-1', patient_id: 'pat-2', patient_name: 'Fatima Noor', disease: 'BP review', appointment_date: dstr(-1), appointment_time: '10:00 AM', type: 'Follow-up', payment_method: 'Online', fee: 3000, status: 'Completed', created_at: dts(-1) },
  { id: 'appt-10', doctor_id: 'doc-3', patient_id: 'pat-6', patient_name: 'Zainab Malik', disease: 'Fever and cough', appointment_date: dstr(-1), appointment_time: '11:30 AM', type: 'Follow-up', payment_method: 'Cash', fee: 2000, status: 'Canceled', created_at: dts(-1) },
  { id: 'appt-11', doctor_id: 'doc-1', patient_id: 'pat-1', patient_name: 'Ahmed Raza', disease: 'ECG follow-up', appointment_date: dstr(0), appointment_time: '10:30 AM', type: 'Follow-up', payment_method: 'Online', fee: 3000, status: 'Pending', created_at: dts(0, 9) },
  { id: 'appt-12', doctor_id: 'doc-7', patient_id: 'pat-6', patient_name: 'Zainab Malik', disease: 'General checkup', appointment_date: dstr(0), appointment_time: '04:00 PM', type: 'Consultation', payment_method: 'Cash', fee: 1500, status: 'Pending', created_at: dts(0, 9, 30) },
  { id: 'appt-13', doctor_id: 'doc-2', patient_id: 'pat-4', patient_name: 'Amina Tariq', disease: 'Skin rash review', appointment_date: dstr(1), appointment_time: '05:00 PM', type: 'Follow-up', payment_method: 'Online', fee: 2500, status: 'Confirmed', created_at: dts(0, 11) },
  { id: 'appt-14', doctor_id: 'doc-5', patient_id: 'pat-4', patient_name: 'Amina Tariq', disease: 'Prenatal visit', appointment_date: dstr(2), appointment_time: '11:00 AM', type: 'Consultation', payment_method: 'Cash', fee: 2800, status: 'Pending', created_at: dts(0, 12) },
  { id: 'appt-15', doctor_id: 'doc-4', patient_id: 'pat-3', patient_name: 'Hassan Sheikh', disease: 'Knee pain review', appointment_date: dstr(3), appointment_time: '11:30 AM', type: 'Follow-up', payment_method: 'Online', fee: 3500, status: 'Pending', created_at: dts(0, 13) },
  { id: 'appt-16', doctor_id: 'doc-6', patient_id: 'pat-2', patient_name: 'Fatima Noor', disease: 'Headache evaluation', appointment_date: dstr(5), appointment_time: '04:30 PM', type: 'Consultation', payment_method: 'Cash', fee: 3200, status: 'Pending', created_at: dts(0, 14) },
  { id: 'appt-17', doctor_id: 'doc-8', patient_id: 'pat-5', patient_name: 'Omar Farooq', disease: 'Root canal follow-up', appointment_date: dstr(7), appointment_time: '05:30 PM', type: 'Follow-up', payment_method: 'Online', fee: 1800, status: 'Confirmed', created_at: dts(0, 15) },
  { id: 'appt-18', doctor_id: 'doc-7', patient_id: 'pat-3', patient_name: 'Hassan Sheikh', disease: 'General checkup', appointment_date: dstr(9), appointment_time: '10:00 AM', type: 'Consultation', payment_method: 'Cash', fee: 1500, status: 'Pending', created_at: dts(0, 16) },
];

const SEED_RECORDS: MedicalRecord[] = [
  { id: 'rec-1', patient_id: 'pat-1', doctor_name: 'Dr. Ayesha Khan', title: 'ECG Report', report_type: 'Lab Report', uploaded_by: 'Doctor', created_at: dts(-21, 12), file_url: rxFile('CRESCENT CARE - ECG REPORT\nPatient: Ahmed Raza\nFinding: Normal sinus rhythm. No acute ischemic changes.\nAdvised: Continue current medication, review in 4 weeks.\n— Dr. Ayesha Khan') },
  { id: 'rec-2', patient_id: 'pat-1', doctor_name: 'Dr. Ayesha Khan', title: 'Cardiac Prescription', report_type: 'Prescription', uploaded_by: 'Doctor', created_at: dts(-21, 13), file_url: rxFile('PRESCRIPTION — Dr. Ayesha Khan\nPatient: Ahmed Raza\n1. Tab. Bisoprolol 5mg — 1 daily (morning)\n2. Tab. Aspirin 75mg — 1 daily (night)\n3. Low-salt diet, 30 min walk daily.\nReview after 4 weeks.') },
  { id: 'rec-3', patient_id: 'pat-2', doctor_name: 'Dr. Sana Ahmed', title: 'Blood Sugar Report', report_type: 'Lab Report', uploaded_by: 'Patient', created_at: dts(-12, 10), file_url: rxFile('BLOOD SUGAR REPORT — City Lab\nPatient: Fatima Noor\nFasting: 132 mg/dL | Random: 188 mg/dL\nNote: Slightly elevated. Consult physician.') },
  { id: 'rec-4', patient_id: 'pat-4', doctor_name: 'Dr. Tariq Mahmood', title: 'Dermatology Prescription', report_type: 'Prescription', uploaded_by: 'Doctor', created_at: dts(-15, 17), file_url: rxFile('PRESCRIPTION — Dr. Tariq Mahmood\nPatient: Amina Tariq\n1. Betnovate cream — apply twice daily on affected area\n2. Tab. Rigix 10mg — 1 at night for 7 days\nAvoid harsh soaps.') },
  { id: 'rec-5', patient_id: 'pat-6', doctor_name: 'Dr. Sana Ahmed', title: 'CBC Report', report_type: 'Lab Report', uploaded_by: 'Patient', created_at: dts(-18, 9), file_url: rxFile('CBC REPORT — City Lab\nPatient: Zainab Malik\nHb: 12.1 g/dL | TLC: 11,200 (mildly raised)\nImpression: Viral picture. Symptomatic treatment advised.') },
];

// ---------- storage ----------
const DB_KEY = 'medibook_db_v2'; // bumped 2026-10-03: seed now includes doctor photos

interface DBShape { profiles: Profile[]; appointments: Appointment[]; medical_records: MedicalRecord[]; }

function seed(): DBShape {
  return {
    profiles: JSON.parse(JSON.stringify(SEED_PROFILES)),
    appointments: JSON.parse(JSON.stringify(SEED_APPOINTMENTS)),
    medical_records: JSON.parse(JSON.stringify(SEED_RECORDS)),
  };
}

function load(): DBShape {
  if (typeof window === 'undefined') return seed();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.profiles)) return parsed as DBShape;
    }
  } catch { /* corrupted -> reseed */ }
  const s = seed();
  try { window.localStorage.setItem(DB_KEY, JSON.stringify(s)); } catch { /* quota */ }
  return s;
}

function save(db: DBShape) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* quota */ }
}

const nid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// ---------- profiles ----------
export async function listDoctors(): Promise<Profile[]> {
  return load().profiles.filter(p => p.role === 'doctor');
}
export async function listPatients(): Promise<Profile[]> {
  return load().profiles.filter(p => p.role === 'patient');
}
export async function getProfile(id: string): Promise<Profile | null> {
  return load().profiles.find(p => p.id === id) ?? null;
}
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const e = email.trim().toLowerCase();
  return load().profiles.find(p => (p.email || '').toLowerCase() === e) ?? null;
}
export async function createProfile(data: Partial<Profile>): Promise<Profile> {
  const db = load();
  const profile: Profile = {
    id: nid(data.role === 'doctor' ? 'doc' : data.role === 'admin' ? 'adm' : 'pat'),
    full_name: data.full_name || 'New User',
    email: data.email || '',
    role: data.role || 'patient',
    created_at: new Date().toISOString(),
    ...data,
  } as Profile;
  db.profiles.push(profile);
  save(db);
  return profile;
}
export async function updateProfile(id: string, patch: Partial<Profile>): Promise<Profile | null> {
  const db = load();
  const i = db.profiles.findIndex(p => p.id === id);
  if (i < 0) return null;
  db.profiles[i] = { ...db.profiles[i], ...patch };
  save(db);
  return db.profiles[i];
}
export async function deleteProfile(id: string): Promise<void> {
  const db = load();
  db.profiles = db.profiles.filter(p => p.id !== id);
  save(db);
}

// ---------- appointments ----------
function withJoins(db: DBShape, a: Appointment): Appointment {
  return {
    ...a,
    doctor: db.profiles.find(p => p.id === a.doctor_id) ?? null,
    patient: db.profiles.find(p => p.id === a.patient_id) ?? null,
  };
}
export async function listAppointments(): Promise<Appointment[]> {
  const db = load();
  return db.appointments.map(a => withJoins(db, a))
    .sort((x, y) => (y.appointment_date + y.appointment_time).localeCompare(x.appointment_date + x.appointment_time));
}
export async function appointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
  const db = load();
  return db.appointments.filter(a => a.doctor_id === doctorId).map(a => withJoins(db, a))
    .sort((x, y) => (y.appointment_date + y.appointment_time).localeCompare(x.appointment_date + x.appointment_time));
}
export async function appointmentsForPatient(patientId: string): Promise<Appointment[]> {
  const db = load();
  return db.appointments.filter(a => a.patient_id === patientId).map(a => withJoins(db, a))
    .sort((x, y) => (y.appointment_date + y.appointment_time).localeCompare(x.appointment_date + x.appointment_time));
}
export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const db = load();
  const appt: Appointment = {
    id: nid('appt'),
    doctor_id: data.doctor_id || '',
    patient_id: data.patient_id || '',
    patient_name: data.patient_name || 'Patient',
    appointment_date: data.appointment_date || dstr(0),
    appointment_time: data.appointment_time || '10:00 AM',
    status: data.status || 'Pending',
    created_at: new Date().toISOString(),
    ...data,
  } as Appointment;
  db.appointments.push(appt);
  save(db);
  return withJoins(db, appt);
}
export async function updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment | null> {
  const db = load();
  const i = db.appointments.findIndex(a => a.id === id);
  if (i < 0) return null;
  db.appointments[i] = { ...db.appointments[i], ...patch };
  save(db);
  return withJoins(db, db.appointments[i]);
}
export async function deleteAppointment(id: string): Promise<void> {
  const db = load();
  db.appointments = db.appointments.filter(a => a.id !== id);
  save(db);
}

// ---------- medical records ----------
export async function recordsForPatient(patientId: string): Promise<MedicalRecord[]> {
  return load().medical_records
    .filter(r => r.patient_id === patientId)
    .sort((x, y) => (y.created_at || '').localeCompare(x.created_at || ''));
}
export async function createRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
  const db = load();
  const rec: MedicalRecord = {
    id: nid('rec'),
    patient_id: data.patient_id || '',
    created_at: new Date().toISOString(),
    ...data,
  } as MedicalRecord;
  db.medical_records.unshift(rec);
  save(db);
  return rec;
}
export async function updateRecord(id: string, patch: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
  const db = load();
  const i = db.medical_records.findIndex(r => r.id === id);
  if (i < 0) return null;
  db.medical_records[i] = { ...db.medical_records[i], ...patch };
  save(db);
  return db.medical_records[i];
}
export async function deleteRecord(id: string): Promise<void> {
  const db = load();
  db.medical_records = db.medical_records.filter(r => r.id !== id);
  save(db);
}

// ---------- maintenance ----------
export async function resetDemoData(): Promise<void> {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DB_KEY);
  load();
}

// ---------- specialties (derived) ----------
export interface SpecialtyInfo { name: string; count: number; cities: string[]; minFee: number; }
export async function doctorSpecialties(): Promise<SpecialtyInfo[]> {
  const doctors = await listDoctors();
  const map = new Map<string, SpecialtyInfo>();
  for (const d of doctors) {
    const name = d.specialty || 'General Physician';
    const cur = map.get(name) ?? { name, count: 0, cities: [], minFee: Number.MAX_SAFE_INTEGER };
    cur.count += 1;
    if (d.city && !cur.cities.includes(d.city)) cur.cities.push(d.city);
    if (typeof d.fee === 'number' && d.fee < cur.minFee) cur.minFee = d.fee;
    map.set(name, cur);
  }
  return [...map.values()]
    .map(s => ({ ...s, minFee: s.minFee === Number.MAX_SAFE_INTEGER ? 0 : s.minFee }))
    .sort((a, b) => b.count - a.count);
}

// ---------- contact messages (local inbox for the demo) ----------
const CONTACT_KEY = 'medibook_contact_v1';
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at: string;
}
function loadContact(): ContactMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CONTACT_KEY);
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) return p as ContactMessage[]; }
  } catch { /* ignore */ }
  return [];
}
export async function createContactMessage(data: Omit<ContactMessage, 'id' | 'created_at'>): Promise<ContactMessage> {
  const msg: ContactMessage = { ...data, id: nid('msg'), created_at: new Date().toISOString() };
  const all = loadContact();
  all.unshift(msg);
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(CONTACT_KEY, JSON.stringify(all)); } catch { /* quota */ }
  }
  return msg;
}
export async function listContactMessages(): Promise<ContactMessage[]> {
  return loadContact();
}
