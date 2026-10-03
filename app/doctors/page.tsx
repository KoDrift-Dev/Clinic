'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button, Input, Label, Select, PageHero, Reveal, EmptyState } from '@/components/ui-kit';
import { DoctorCard } from '@/components/doctor-card';
import { listDoctors, type Profile } from '@/lib/db';
import { cn } from '@/lib/utils';

type SortKey = 'rating' | 'fee-low' | 'fee-high' | 'exp';

function DoctorsContent() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [maxFee, setMaxFee] = useState<number>(4000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>('rating');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setDoctors(await listDoctors());
      setLoading(false);
    })();
  }, []);

  const specialties = useMemo(() => [...new Set(doctors.map(d => d.specialty).filter(Boolean) as string[])].sort(), [doctors]);
  const cities = useMemo(() => [...new Set(doctors.map(d => d.city).filter(Boolean) as string[])].sort(), [doctors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = doctors.filter(d => {
      if (q && !`${d.full_name} ${d.specialty} ${d.hospital}`.toLowerCase().includes(q)) return false;
      if (specialty && d.specialty !== specialty) return false;
      if (city && d.city !== city) return false;
      if ((d.fee ?? 0) > maxFee) return false;
      if ((d.rating ?? 0) < minRating) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === 'fee-low') return (a.fee ?? 0) - (b.fee ?? 0);
      if (sort === 'fee-high') return (b.fee ?? 0) - (a.fee ?? 0);
      const exp = (s?: string) => parseInt(s ?? '0', 10) || 0;
      return exp(b.exp) - exp(a.exp);
    });
    return out;
  }, [doctors, query, specialty, city, maxFee, minRating, sort]);

  const activeFilters = [specialty, city, minRating > 0 ? `${minRating}+ stars` : '', maxFee < 4000 ? `Under Rs. ${maxFee}` : ''].filter(Boolean).length;

  const clearAll = () => {
    setQuery(''); setSpecialty(''); setCity(''); setMaxFee(4000); setMinRating(0); setSort('rating');
  };

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <Label>Specialty</Label>
        <div className="relative">
          <Select value={specialty} onChange={e => setSpecialty(e.target.value)} aria-label="Filter by specialty">
            <option value="">All specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </div>
      <div>
        <Label>City</Label>
        <Select value={city} onChange={e => setCity(e.target.value)} aria-label="Filter by city">
          <option value="">All cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>
      <div>
        <Label>Max fee · <span className="text-brand-700 tnum">Rs. {maxFee.toLocaleString()}</span></Label>
        <input
          type="range" min={1000} max={4000} step={250} value={maxFee}
          onChange={e => setMaxFee(Number(e.target.value))}
          className="w-full accent-[#0e7c6b] cursor-pointer"
          aria-label="Maximum consultation fee"
        />
        <div className="flex justify-between text-[11px] font-bold text-ink-400 mt-1"><span>Rs. 1,000</span><span>Rs. 4,000</span></div>
      </div>
      <div>
        <Label>Minimum rating</Label>
        <div className="flex gap-2">
          {[0, 4.5, 4.7, 4.9].map(r => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={cn(
                'flex-1 rounded-full border py-2 text-[13px] font-extrabold transition-all cursor-pointer',
                minRating === r ? 'bg-brand-600 text-white border-brand-600' : 'border-ink-900/15 text-ink-600 hover:border-brand-500',
              )}
            >
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </div>
      {(activeFilters > 0) && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <X className="size-4" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Find a doctor"
        title={<>Meet the specialists <span className="italic text-brand-300">behind your care.</span></>}
        copy="Every doctor is verified — qualifications, fees and patient ratings shown upfront. No surprises."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Search + sort bar */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink-400" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, specialty or hospital…"
              className="pl-12 h-[52px] rounded-full shadow-soft"
              aria-label="Search doctors"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden flex-1">
              <SlidersHorizontal className="size-4" /> Filters {activeFilters > 0 && `(${activeFilters})`}
            </Button>
            <div className="relative flex-1 md:flex-none">
              <Select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="rounded-full h-[52px] md:w-56 font-bold" aria-label="Sort doctors">
                <option value="rating">Sort: Top rated</option>
                <option value="fee-low">Sort: Fee low to high</option>
                <option value="fee-high">Sort: Fee high to low</option>
                <option value="exp">Sort: Most experienced</option>
              </Select>
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="md:hidden mt-4 bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft p-6 animate-fade-up">
            {filterPanel}
          </div>
        )}

        <div className="mt-8 grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Desktop filters */}
          <aside className="hidden md:block sticky top-24 bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-5 flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-brand-600" /> Filters
            </h2>
            {filterPanel}
          </aside>

          {/* Results */}
          <div>
            <p className="text-sm font-bold text-ink-500 mb-5" role="status">
              {loading ? 'Finding doctors…' : <><span className="text-ink-900 tnum">{filtered.length}</span> doctor{filtered.length === 1 ? '' : 's'} found</>}
            </p>
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-ink-900/[0.07] p-6 h-64 animate-pulse">
                    <div className="flex gap-4"><div className="size-20 rounded-full bg-cream-200" /><div className="flex-1 space-y-2"><div className="h-4 bg-cream-200 rounded w-2/3" /><div className="h-3 bg-cream-200 rounded w-1/2" /></div></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft">
                <EmptyState
                  title="No doctors match your filters"
                  copy="Try widening the fee range or clearing a filter or two."
                  action={<Button variant="outline" onClick={clearAll}>Clear all filters</Button>}
                />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {filtered.map((d, i) => (
                  <Reveal key={d.id} delay={Math.min(i, 6) * 60}>
                    <DoctorCard doctor={d} className="h-full" />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cities strip */}
        <div className="mt-14 bg-pine-900 rounded-[28px] p-7 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid-light opacity-40" aria-hidden />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">Prefer to visit in person?</h2>
              <p className="text-white/60 text-sm mt-1.5 flex items-center gap-1.5"><MapPin className="size-4" /> Our flagship clinic: 14-B Main Boulevard, Gulberg III, Lahore</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => { setCity(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="rounded-full border border-white/20 text-white text-sm font-bold px-4 py-2 hover:bg-white hover:text-pine-900 transition-all cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50" />}>
      <DoctorsContent />
    </Suspense>
  );
}
