import Link from 'next/link';
import { Stethoscope, Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';

const COLS = [
  {
    title: 'Explore',
    links: [
      { href: '/doctors', label: 'Find a doctor' },
      { href: '/services', label: 'Specialties' },
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/dashboard/patient', label: 'Patient dashboard' },
      { href: '/dashboard/doctor', label: 'Doctor dashboard' },
      { href: '/admin/login', label: 'Admin access' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-pine-950 text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="size-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center">
                <Stethoscope className="size-5" />
              </span>
              <span className="leading-none">
                <span className="block font-display font-semibold text-xl tracking-tight text-white">Crescent Care</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300 mt-0.5">Medibook Clinic</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed max-w-xs">
              Trusted healthcare in Lahore, Karachi and Islamabad. Verified doctors, transparent fees and appointments that take seconds — not phone queues.
            </p>
          </div>

          {COLS.map(col => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50 mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm font-semibold hover:text-brand-300 transition-colors inline-flex items-center gap-1.5 group">
                      {l.label}
                      <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50 mb-4">Visit us</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex gap-2.5"><MapPin className="size-4 text-brand-300 shrink-0 mt-0.5" /> 14-B Main Boulevard, Gulberg III, Lahore</li>
              <li className="flex gap-2.5"><Phone className="size-4 text-brand-300 shrink-0 mt-0.5" /> 042-3577-8899</li>
              <li className="flex gap-2.5"><Mail className="size-4 text-brand-300 shrink-0 mt-0.5" /> care@crescentcare.pk</li>
              <li className="flex gap-2.5"><Clock className="size-4 text-brand-300 shrink-0 mt-0.5" /> Mon–Sat · 9:00 AM – 9:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-white/40">
          <p>© {new Date().getFullYear()} Crescent Care Medibook. Demo experience — no real patient data.</p>
          <p className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand-400" aria-hidden />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
