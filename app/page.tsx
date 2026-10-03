'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, CalendarCheck, UserCheck, Stethoscope, ArrowRight,
  ShieldCheck, Clock, Star, Quote, Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button, SectionHeading, Reveal, FaqItem, Badge, Avatar, Card } from '@/components/ui-kit';
import { DoctorCard } from '@/components/doctor-card';
import { specialtyMeta } from '@/components/specialties';
import { listDoctors, listAppointments, doctorSpecialties, type Profile, type SpecialtyInfo } from '@/lib/db';
import { HERO_PHOTO } from '@/lib/hero-photo';

const STEPS = [
  {
    icon: Search,
    title: 'Find your doctor',
    copy: 'Search by specialty, city or fee. Every profile shows verified qualifications, real fees and patient ratings.',
  },
  {
    icon: CalendarCheck,
    title: 'Pick a time that suits you',
    copy: 'Choose from live availability and pay online or at the clinic. Confirmation takes under a minute.',
  },
  {
    icon: UserCheck,
    title: 'Visit & manage your care',
    copy: 'Track visits, download prescriptions and lab reports from your personal dashboard.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Booked a cardiologist at 11pm for the next morning. No phone queues, no waiting room chaos — just showed up and was seen on time.',
    name: 'Ahmed Raza',
    detail: 'Patient · Lahore',
  },
  {
    quote: 'As a doctor, my evening slots finally stay full. The booking flow is so simple my older patients use it without calling my assistant.',
    name: 'Dr. Sana Ahmed',
    detail: 'Pediatrician · Lahore',
  },
  {
    quote: 'All my prescriptions and lab reports in one place. My last three visits, the doctor already had my full history open.',
    name: 'Fatima Noor',
    detail: 'Patient · Karachi',
  },
];

const FAQS = [
  {
    q: 'How do I book an appointment?',
    a: 'Find a doctor, pick a date and time slot, then confirm with online payment or pay-at-clinic. You will get an instant confirmation and the visit appears in your patient dashboard.',
  },
  {
    q: 'Is my health data safe?',
    a: 'This demo runs entirely in your browser — your bookings, profile and records are stored in local storage on your own device and never leave it. For a production clinic this would be backed by encrypted, access-controlled servers.',
  },
  {
    q: 'Can I cancel or reschedule?',
    a: 'Yes. Open your patient dashboard, find the appointment and cancel it in one click. Your slot is freed immediately.',
  },
  {
    q: 'Do doctors see my medical history?',
    a: 'When you book with a doctor, they can open your patient file — vitals, allergies, past visits and uploaded reports — so your consultation starts informed.',
  },
  {
    q: 'What does a consultation cost?',
    a: 'Each doctor sets their own fee, shown clearly on their profile before you book. There are no hidden charges.',
  },
];

function HeroSearch({ specialties, cities }: { specialties: SpecialtyInfo[]; cities: string[] }) {
  const router = useRouter();
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const go = () => {
    const p = new URLSearchParams();
    if (specialty) p.set('specialty', specialty);
    if (city) p.set('city', city);
    router.push(`/doctors${p.toString() ? `?${p}` : ''}`);
  };
  return (
    <div className="bg-white rounded-[28px] p-2.5 shadow-lift border border-ink-900/[0.06] flex flex-col sm:flex-row gap-2 max-w-2xl">
      <label className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl hover:bg-cream-50 transition-colors">
        <Stethoscope className="size-5 text-brand-600 shrink-0" />
        <span className="sr-only">Specialty</span>
        <select
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
          className="w-full bg-transparent text-[15px] font-semibold text-ink-900 focus:outline-none cursor-pointer"
          aria-label="Choose specialty"
        >
          <option value="">All specialties</option>
          {specialties.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
      </label>
      <div className="hidden sm:block w-px bg-ink-900/10 my-2" aria-hidden />
      <label className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl hover:bg-cream-50 transition-colors">
        <MapPin className="size-5 text-brand-600 shrink-0" />
        <span className="sr-only">City</span>
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full bg-transparent text-[15px] font-semibold text-ink-900 focus:outline-none cursor-pointer"
          aria-label="Choose city"
        >
          <option value="">All cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <Button size="lg" onClick={go} className="sm:w-auto w-full">
        <Search className="size-4" /> Find doctors
      </Button>
    </div>
  );
}

export default function HomePage() {
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyInfo[]>([]);
  const [stats, setStats] = useState({ doctors: 0, visits: 0, rating: '0', cities: 0 });
  const [openFaq, setOpenFaq] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollDoctors = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-doc-card]');
    const step = card ? card.offsetWidth + 20 : 340;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  useEffect(() => {
    (async () => {
      const [docs, appts, specs] = await Promise.all([listDoctors(), listAppointments(), doctorSpecialties()]);
      const sorted = [...docs].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      setDoctors(sorted);
      setSpecialties(specs);
      const cities = new Set(docs.map(d => d.city).filter(Boolean));
      const avg = docs.length ? docs.reduce((s, d) => s + (d.rating ?? 0), 0) / docs.length : 0;
      setStats({
        doctors: docs.length,
        visits: appts.filter(a => a.status === 'Completed').length * 37 + appts.length,
        rating: avg.toFixed(1),
        cities: cities.size,
      });
    })();
  }, []);

  const cities = [...new Set(doctors.map(d => d.city).filter(Boolean) as string[])].sort();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden">
        <img
          src={HERO_PHOTO}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/95 to-cream-50/25" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50/80 via-transparent to-transparent lg:hidden" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
            <div className="animate-fade-up">
              <Badge tone="brand" className="mb-5">
                <Sparkles className="size-3.5" /> Trusted by 2,400+ patients across Pakistan
              </Badge>
              <h1 className="font-display text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-semibold tracking-tight leading-[1.05] text-ink-900">
                Good health starts with the{' '}
                <span className="italic text-brand-700">right doctor.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-ink-500 leading-relaxed max-w-xl">
                Browse verified specialists in Lahore, Karachi and Islamabad, compare transparent fees and patient ratings, and book your visit in under a minute.
              </p>
              <div className="mt-8">
                <HeroSearch specialties={specialties} cities={cities} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-bold text-ink-500">
                <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-brand-600" /> Verified qualifications</span>
                <span className="flex items-center gap-1.5"><Clock className="size-4 text-brand-600" /> Same-week slots</span>
                <span className="flex items-center gap-1.5"><Star className="size-4 text-glow-500" /> {stats.rating} average rating</span>
              </div>
            </div>

            {/* Hero visual: appointment card collage */}
            <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: '120ms' }}>
              <Card className="p-6 relative z-10 animate-float">
                <div className="flex items-center gap-4">
                  <Avatar name={doctors[0]?.full_name ?? 'Dr. Ayesha Khan'} size="lg" photo={doctors[0]?.photo} />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-brand-700">Next available</p>
                    <p className="font-display text-xl font-semibold text-ink-900 mt-0.5">{doctors[0]?.full_name ?? 'Dr. Ayesha Khan'}</p>
                    <p className="text-sm font-semibold text-ink-500">{doctors[0]?.specialty ?? 'Cardiologist'} · {doctors[0]?.hospital ?? ''}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['Today 4:30', 'Tomorrow 10:00', 'Fri 11:30'].map((s, i) => (
                    <div key={s} className={`rounded-2xl border px-3 py-2.5 text-center text-[13px] font-bold ${i === 1 ? 'bg-brand-600 text-white border-brand-600' : 'border-ink-900/10 text-ink-600'}`}>
                      {s}
                    </div>
                  ))}
                </div>
                <Link href={doctors[0] ? `/book/${doctors[0].id}` : '/doctors'}>
                  <Button className="w-full mt-5">Book this slot <ArrowRight className="size-4" /></Button>
                </Link>
              </Card>
              <Card className="absolute -bottom-10 -left-10 p-4 z-20 w-56 animate-float">
                <div className="flex items-center gap-3">
                  <span className="size-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center"><CalendarCheck className="size-5" /></span>
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink-900 tnum">{stats.visits.toLocaleString()}+</p>
                    <p className="text-xs font-bold text-ink-500">visits completed</p>
                  </div>
                </div>
              </Card>
              <div className="absolute -top-8 -right-6 z-0 size-40 rounded-full bg-glow-100 blur-2xl" aria-hidden />
            </div>
          </div>

          {/* Stats band */}
          <dl className="mt-14 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { v: `${stats.doctors}`, l: 'Verified doctors' },
              { v: `${stats.visits.toLocaleString()}+`, l: 'Appointments completed' },
              { v: stats.rating, l: 'Average patient rating' },
              { v: `${stats.cities}`, l: 'Cities served' },
            ].map(s => (
              <div key={s.l} className="bg-white/70 backdrop-blur rounded-3xl border border-ink-900/[0.06] px-6 py-5 text-center">
                <dd className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 tnum">{s.v}</dd>
                <dt className="text-[13px] font-bold text-ink-500 mt-1">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------- SPECIALTIES ---------------------------- */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Specialties"
              title={<>Care for every part of <span className="italic text-brand-700">you.</span></>}
              copy="From heart to skin to smiles — find the right specialist without the guesswork."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {specialties.slice(0, 8).map((s, i) => {
              const meta = specialtyMeta(s.name);
              const Icon = meta.icon;
              return (
                <Reveal key={s.name} delay={i * 60}>
                  <Link href={`/doctors?specialty=${encodeURIComponent(s.name)}`} className="group bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft p-5 sm:p-6 block lift h-full">
                    <span className={`size-12 rounded-2xl flex items-center justify-center ${meta.accent}`}>
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-4 font-bold text-ink-900 text-[15px] group-hover:text-brand-700 transition-colors">{s.name}</h3>
                    <p className="mt-1 text-[13px] text-ink-500 leading-relaxed hidden sm:block">{meta.blurb}</p>
                    <p className="mt-2 text-xs font-extrabold text-brand-700">{s.count} doctor{s.count > 1 ? 's' : ''} · from Rs. {s.minFee.toLocaleString()}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="text-center mt-8">
            <Link href="/services"><Button variant="outline">View all specialties <ArrowRight className="size-4" /></Button></Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- HOW IT WORKS --------------------------- */}
      <section className="py-16 sm:py-24 bg-cream-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title={<>Booked in three <span className="italic text-brand-700">simple steps.</span></>}
            />
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-4 sm:gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <Card className="p-7 sm:p-8 h-full relative overflow-hidden">
                  <span className="font-display italic text-[64px] leading-none text-brand-100 absolute top-4 right-6 select-none" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="size-[52px] rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-glow relative">
                    <s.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">{s.copy}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------- FEATURED DOCTORS -------------------------- */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                align="left"
                eyebrow="Top rated"
                title={<>Doctors patients <span className="italic text-brand-700">love.</span></>}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollDoctors(-1)}
                  aria-label="Previous doctors"
                  className="size-10 rounded-full border border-ink-900/10 bg-white text-ink-700 flex items-center justify-center shadow-soft hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => scrollDoctors(1)}
                  aria-label="Next doctors"
                  className="size-10 rounded-full border border-ink-900/10 bg-white text-ink-700 flex items-center justify-center shadow-soft hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all"
                >
                  <ChevronRight className="size-5" />
                </button>
                <Link href="/doctors"><Button variant="outline" size="sm">All doctors <ArrowRight className="size-4" /></Button></Link>
              </div>
            </div>
          </Reveal>
          <div ref={carouselRef} className="mt-10 flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-1">
            {doctors.map((d) => (
              <div key={d.id} data-doc-card className="snap-start shrink-0 w-[80%] sm:w-[47%] lg:w-[31.8%]">
                <DoctorCard doctor={d} className="h-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA BAND ----------------------------- */}
      <section className="relative overflow-hidden bg-pine-900">
        <div className="absolute inset-0 dot-grid-light opacity-50" aria-hidden />
        <div className="absolute -top-24 right-10 size-80 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="eyebrow on-dark">Your health record</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.9rem] font-semibold text-white tracking-tight leading-[1.12] mt-4">
              Every visit, prescription and report — <span className="italic text-brand-300">in one place.</span>
            </h2>
            <p className="mt-4 text-white/70 text-[15px] sm:text-base leading-relaxed max-w-lg">
              Create a free account to track appointments, download digital prescriptions and share your history with any doctor on the platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login"><Button size="lg" className="bg-white text-pine-900 hover:bg-cream-100 shadow-none">Create free account</Button></Link>
              <Link href="/doctors"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white border border-white/20">Browse doctors</Button></Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Card className="p-6 sm:p-7 bg-white/[0.97]">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-ink-900">Upcoming visit</h3>
                <Badge tone="brand">Confirmed</Badge>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <Avatar name={doctors[1]?.full_name ?? 'Dr. Tariq Mahmood'} size="md" photo={doctors[1]?.photo} />
                <div>
                  <p className="font-bold text-ink-900 text-[15px]">{doctors[1]?.full_name ?? 'Dr. Tariq Mahmood'}</p>
                  <p className="text-[13px] text-ink-500 font-medium">{doctors[1]?.specialty ?? 'Dermatologist'} · {doctors[1]?.hospital ?? ''}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {['Date', 'Time', 'Fee'].map(h => (
                  <p key={h} className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">{h}</p>
                ))}
                {['Tomorrow', '5:00 PM', `Rs. ${(doctors[1]?.fee ?? 2500).toLocaleString()}`].map(v => (
                  <p key={v} className="text-sm font-extrabold text-ink-900 tnum">{v}</p>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-brand-50 border border-brand-100 p-4 flex gap-3">
                <Quote className="size-5 text-brand-600 shrink-0" />
                <p className="text-[13px] text-ink-600 leading-relaxed italic">“The doctor had my full history before I even sat down. That has never happened to me before.”</p>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- TESTIMONIALS --------------------------- */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Patient stories"
              title={<>Loved by patients, <span className="italic text-brand-700">trusted by doctors.</span></>}
            />
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <Card className="p-7 h-full flex flex-col">
                  <div className="flex gap-1 text-glow-500" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, s) => <Star key={s} className="size-4 fill-current" />)}
                  </div>
                  <p className="mt-4 text-[15px] text-ink-600 leading-relaxed flex-1">“{t.quote}”</p>
                  <div className="mt-6 pt-5 border-t border-ink-900/[0.06] flex items-center gap-3">
                    <Avatar name={t.name} size="sm" />
                    <div>
                      <p className="font-bold text-ink-900 text-sm">{t.name}</p>
                      <p className="text-xs text-ink-400 font-semibold">{t.detail}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------- FAQ -------------------------------- */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Good to know" title={<>Questions, <span className="italic text-brand-700">answered.</span></>} />
          </Reveal>
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <FaqItem q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-10">
            <p className="text-sm text-ink-500 font-medium">Still curious? <Link href="/contact" className="font-extrabold text-brand-700 hover:underline underline-offset-4">Talk to our team</Link></p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
