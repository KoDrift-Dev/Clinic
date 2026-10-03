import Link from 'next/link';
import { MapPin, ArrowUpRight, BadgeCheck } from 'lucide-react';
import type { Profile } from '@/lib/db';
import { Avatar, Stars, Badge } from './ui-kit';
import { cn } from '@/lib/utils';

export function DoctorCard({ doctor, className }: { doctor: Profile; className?: string }) {
  return (
    <Link
      href={`/doctors/${doctor.id}`}
      className={cn(
        'group bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft p-6 flex flex-col lift',
        className,
      )}
      aria-label={`View profile of ${doctor.full_name}`}
    >
      <div className="flex items-start gap-4">
        <Avatar name={doctor.full_name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-ink-900 leading-snug group-hover:text-brand-700 transition-colors">
            {doctor.full_name}
          </h3>
          <p className="text-[13px] font-bold text-brand-700 mt-0.5 flex items-center gap-1">
            <BadgeCheck className="size-3.5" /> {doctor.specialty}
          </p>
          <p className="text-xs text-ink-400 font-medium mt-1 truncate">{doctor.qual}</p>
        </div>
        <span className="size-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-all">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-ink-500">
        <Stars rating={doctor.rating ?? 0} />
        <span className="tnum">{(doctor.rating ?? 0).toFixed(1)}</span>
        <span className="text-ink-400 font-medium">({doctor.reviews ?? 0} reviews)</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="muted"><MapPin className="size-3" /> {doctor.city}</Badge>
        <Badge tone="muted">{doctor.exp} exp.</Badge>
      </div>

      <div className="mt-5 pt-4 border-t border-ink-900/[0.06] flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Consultation</p>
          <p className="font-display text-xl font-semibold text-ink-900 tnum">Rs. {(doctor.fee ?? 0).toLocaleString()}</p>
        </div>
        <span className="text-[13px] font-extrabold text-brand-700 group-hover:underline underline-offset-4">
          Book visit
        </span>
      </div>
    </Link>
  );
}
