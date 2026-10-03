'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button, PageHero, Reveal, SectionHeading } from '@/components/ui-kit';
import { specialtyMeta } from '@/components/specialties';
import { doctorSpecialties, type SpecialtyInfo } from '@/lib/db';

export default function ServicesPage() {
  const [specs, setSpecs] = useState<SpecialtyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setSpecs(await doctorSpecialties());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Specialties & services"
        title={<>Every specialty, <span className="italic text-brand-300">one roof.</span></>}
        copy="Browse our departments, see who practices in each, and book directly with the right specialist."
      />

      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 bg-white rounded-3xl border border-ink-900/[0.07] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {specs.map((s, i) => {
                const meta = specialtyMeta(s.name);
                const Icon = meta.icon;
                return (
                  <Reveal key={s.name} delay={Math.min(i, 8) * 60}>
                    <Link
                      href={`/doctors?specialty=${encodeURIComponent(s.name)}`}
                      className="group bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft p-7 block lift h-full"
                    >
                      <div className="flex items-start justify-between">
                        <span className={`size-14 rounded-2xl flex items-center justify-center ${meta.accent}`}>
                          <Icon className="size-7" />
                        </span>
                        <span className="size-10 rounded-full bg-cream-100 text-ink-500 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                          <ArrowUpRight className="size-4" />
                        </span>
                      </div>
                      <h2 className="mt-5 font-display text-[1.35rem] font-semibold text-ink-900 group-hover:text-brand-700 transition-colors">{s.name}</h2>
                      <p className="mt-2 text-sm text-ink-500 leading-relaxed">{meta.blurb}</p>
                      <div className="mt-5 pt-5 border-t border-ink-900/[0.06] flex items-center justify-between text-[13px] font-bold">
                        <span className="text-ink-900 tnum">{s.count} doctor{s.count > 1 ? 's' : ''}</span>
                        <span className="text-ink-400 flex items-center gap-1"><MapPin className="size-3.5" /> {s.cities.join(' · ')}</span>
                        <span className="text-brand-700 tnum">from Rs. {s.minFee.toLocaleString()}</span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Care promise band */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="bg-brand-600 rounded-[28px] p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 dot-grid-light opacity-40" aria-hidden />
              <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <SectionHeading
                    dark
                    align="left"
                    eyebrow="Not sure where to start?"
                    title={<>Start with a <span className="italic text-brand-200">general physician.</span></>}
                    copy="They'll assess your concern and refer you to the right specialist — the fastest route to the right care."
                  />
                </div>
                <Link href="/doctors?specialty=General%20Physician" className="shrink-0">
                  <Button size="lg" className="bg-white text-brand-800 hover:bg-cream-100 shadow-none">
                    Find a physician <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
