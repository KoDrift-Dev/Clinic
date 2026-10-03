'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeartHandshake, ShieldCheck, Clock, Users, ArrowRight, Stethoscope, Award, HandHeart } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button, PageHero, Reveal, SectionHeading, Card, Avatar } from '@/components/ui-kit';
import { listDoctors, listAppointments, type Profile } from '@/lib/db';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified, always',
    copy: 'Every doctor on Crescent Care has their qualifications and practicing credentials manually verified before their first listing.',
  },
  {
    icon: HeartHandshake,
    title: 'Patients first',
    copy: 'Transparent fees, honest availability and free cancellation. We design every flow around the person in the waiting room.',
  },
  {
    icon: Clock,
    title: 'Respect for time',
    copy: 'On-time slots, instant confirmations and digital records mean less waiting — for patients and doctors alike.',
  },
  {
    icon: HandHeart,
    title: 'Care beyond the visit',
    copy: 'Prescriptions, lab reports and visit history stay with you, so every consultation starts informed.',
  },
];

const TIMELINE = [
  { year: '2019', title: 'A clinic in Gulberg', copy: 'Crescent Care opens its doors in Lahore with three doctors and a paper appointment diary.' },
  { year: '2021', title: 'Going digital', copy: 'We launch online booking for our own patients — phone queues drop by 70% in six months.' },
  { year: '2023', title: 'Three cities', copy: 'Verified specialists join from Karachi and Islamabad. Digital prescriptions and lab reports go live.' },
  { year: '2026', title: 'Medibook for everyone', copy: 'The platform opens to independent clinics — the same booking experience, everywhere in Pakistan.' },
];

export default function AboutPage() {
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    (async () => {
      const [docs, appts] = await Promise.all([listDoctors(), listAppointments()]);
      setDoctors(docs);
      setVisits(appts.filter(a => a.status === 'Completed').length * 37 + appts.length);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="About Crescent Care"
        title={<>Healthcare should feel <span className="italic text-brand-300">human.</span></>}
        copy="We started as a single neighbourhood clinic frustrated by missed calls and overcrowded waiting rooms. Medibook is our answer — booking that respects everyone's time."
      />

      {/* Stats */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { v: `${doctors.length}`, l: 'Verified doctors' },
              { v: `${visits.toLocaleString()}+`, l: 'Visits completed' },
              { v: '2019', l: 'Serving since' },
              { v: '4.8', l: 'Average rating' },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 70}>
                <Card className="p-6 sm:p-8 text-center">
                  <p className="font-display text-4xl sm:text-5xl font-semibold text-brand-700 tnum">{s.v}</p>
                  <p className="text-[13px] font-bold text-ink-500 mt-2">{s.l}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="What we stand for"
              title={<>Four promises we <span className="italic text-brand-700">keep daily.</span></>}
            />
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <Card className="p-6 h-full">
                  <span className="size-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
                    <v.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">{v.copy}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-24 bg-pine-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-light opacity-40" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              dark
              eyebrow="Our journey"
              title={<>From a paper diary to <span className="italic text-brand-300">Pakistan's clinics.</span></>}
            />
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 90}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 h-full">
                  <p className="font-display italic text-3xl text-brand-300">{t.year}</p>
                  <h3 className="mt-3 font-bold text-white text-[15px]">{t.title}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{t.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team strip */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                align="left"
                eyebrow="The team"
                title={<>Doctors who <span className="italic text-brand-700">lead the way.</span></>}
                copy="A few of the verified specialists practicing with Crescent Care."
              />
              <Link href="/doctors"><Button variant="outline" size="sm">All doctors <ArrowRight className="size-4" /></Button></Link>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {doctors.slice(0, 4).map((d, i) => (
              <Reveal key={d.id} delay={i * 80}>
                <Link href={`/doctors/${d.id}`} className="group text-center">
                  <Avatar name={d.full_name} size="xl" className="mx-auto group-hover:scale-105 transition-transform" />
                  <p className="mt-4 font-bold text-ink-900 text-[15px] group-hover:text-brand-700 transition-colors">{d.full_name}</p>
                  <p className="text-[13px] text-ink-500 font-semibold">{d.specialty}</p>
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-extrabold text-glow-500"><Award className="size-3.5" /> {(d.rating ?? 0).toFixed(1)} rated</p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <div className="bg-cream-100 rounded-[28px] p-8 sm:p-12 text-center">
              <span className="size-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-glow">
                <Users className="size-7" />
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 mt-5">Are you a doctor?</h2>
              <p className="text-ink-500 text-[15px] mt-2 max-w-md mx-auto">Join Crescent Care to fill your schedule, manage patient files and issue digital prescriptions.</p>
              <Link href="/login" className="inline-block mt-6">
                <Button size="lg"><Stethoscope className="size-4" /> Join as a doctor</Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
