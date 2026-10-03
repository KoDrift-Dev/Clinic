'use client';

import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { X, Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ---------------------------------- Button --------------------------------- */
type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
}

const btnStyles: Record<BtnVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-glow',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200',
  outline: 'bg-white text-ink-900 border border-ink-900/15 hover:border-brand-600 hover:text-brand-700',
  ghost: 'text-ink-600 hover:text-brand-700 hover:bg-brand-50',
  dark: 'bg-pine-900 text-white hover:bg-pine-800',
  danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
};

const btnSizes: Record<BtnSize, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-6 text-sm gap-2',
  lg: 'h-[52px] px-8 text-[15px] gap-2',
  icon: 'size-10',
};

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap transition-all duration-200 cursor-pointer',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        btnStyles[variant],
        btnSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
      )}
      {children}
    </button>
  );
}

/* ----------------------------------- Card ---------------------------------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('bg-white rounded-3xl border border-ink-900/[0.07] shadow-soft', className)}>
      {children}
    </div>
  );
}

/* ---------------------------------- Inputs --------------------------------- */
const inputBase =
  'w-full rounded-2xl border border-ink-900/15 bg-white px-4 py-3 text-[15px] font-medium text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, 'min-h-28 resize-y', props.className)} />;
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-[13px] font-bold text-ink-600 mb-1.5', className)}>
      {children}
    </label>
  );
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cn(inputBase, 'appearance-none pr-10 cursor-pointer', className)}>
      {children}
    </select>
  );
}

/* ---------------------------------- Badge ---------------------------------- */
export function Badge({ children, tone = 'brand', className }: { children: ReactNode; tone?: 'brand' | 'amber' | 'pine' | 'muted'; className?: string }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-800 border-brand-200',
    amber: 'bg-glow-100 text-[#8a5a12] border-[#ecd9a8]',
    pine: 'bg-pine-900 text-white border-pine-900',
    muted: 'bg-ink-900/[0.05] text-ink-600 border-ink-900/10',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold', tones[tone], className)}>
      {children}
    </span>
  );
}

/* --------------------------------- Avatar ---------------------------------- */
const avatarTones = [
  'bg-brand-600',
  'bg-pine-800',
  'bg-[#b0762a]',
  'bg-[#3f6d8e]',
  'bg-[#7c5cbf]',
  'bg-[#b0526b]',
];

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const initials = name.replace(/^Dr\.\s*/i, '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '•';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const tone = avatarTones[hash % avatarTones.length];
  const sizes = {
    sm: 'size-10 text-sm',
    md: 'size-14 text-lg',
    lg: 'size-20 text-2xl',
    xl: 'size-28 text-4xl',
  };
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-full flex items-center justify-center text-white font-extrabold shrink-0',
        'ring-4 ring-white shadow-soft',
        tone,
        sizes[size],
        className,
      )}
    >
      <span className="font-display tracking-wide">{initials}</span>
    </div>
  );
}

/* ---------------------------------- Stars ---------------------------------- */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-glow-500', className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} className="size-3.5 fill-current" />;
        if (i === full && half) return <StarHalf key={i} className="size-3.5 fill-current" />;
        return <Star key={i} className="size-3.5 text-ink-900/15 fill-current" />;
      })}
    </span>
  );
}

/* -------------------------------- StatusPill -------------------------------- */
const statusStyles: Record<string, string> = {
  Pending: 'bg-glow-100 text-[#8a5a12] border-[#ecd9a8]',
  Confirmed: 'bg-brand-50 text-brand-800 border-brand-200',
  Completed: 'bg-pine-900 text-white border-pine-900',
  Canceled: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide', statusStyles[status] ?? 'bg-ink-900/[0.05] text-ink-600 border-ink-900/10', className)}>
      <span className="size-1.5 rounded-full bg-current mr-1.5" aria-hidden />
      {status}
    </span>
  );
}

/* ------------------------------- SectionHeading ----------------------------- */
export function SectionHeading({
  eyebrow,
  title,
  copy,
  dark,
  align = 'center',
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  dark?: boolean;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}>
      <span className={cn('eyebrow', dark && 'on-dark', align === 'center' && 'justify-center')}>{eyebrow}</span>
      <h2 className={cn('font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.12] tracking-tight mt-4', dark ? 'text-white' : 'text-ink-900')}>
        {title}
      </h2>
      {copy && <p className={cn('mt-4 text-[15px] sm:text-base leading-relaxed', dark ? 'text-white/70' : 'text-ink-500')}>{copy}</p>}
    </div>
  );
}

/* ---------------------------------- Reveal ---------------------------------- */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn('reveal', className)} style={{ ['--reveal-delay' as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------------------------- Modal ----------------------------------- */
export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-pine-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-3xl shadow-lift w-full max-h-[92vh] overflow-y-auto animate-fade-up', wide ? 'max-w-3xl' : 'max-w-lg')}>
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 size-9 rounded-full bg-ink-900/[0.05] hover:bg-ink-900/10 flex items-center justify-center text-ink-600 transition-colors z-10"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------- FAQ accordion ------------------------------ */
export function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={cn('bg-white rounded-2xl border transition-all', open ? 'border-brand-300 shadow-soft' : 'border-ink-900/[0.08]')}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5 cursor-pointer"
      >
        <span className="font-bold text-[15px] text-ink-900">{q}</span>
        <span className={cn('size-8 rounded-full flex items-center justify-center shrink-0 transition-all', open ? 'bg-brand-600 text-white rotate-45' : 'bg-brand-50 text-brand-700')}>
          <span className="text-xl leading-none font-light">+</span>
        </span>
      </button>
      <div className={cn('grid transition-all duration-300 ease-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <p className="px-5 sm:px-6 pb-6 text-[14px] leading-relaxed text-ink-500">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- EmptyState -------------------------------- */
export function EmptyState({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="size-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4">
        <span className="font-display text-2xl text-brand-600 italic">—</span>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
      <p className="text-sm text-ink-500 mt-2 max-w-sm mx-auto">{copy}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------------------------- PageHero --------------------------------- */
export function PageHero({ eyebrow, title, copy }: { eyebrow: string; title: ReactNode; copy?: string }) {
  return (
    <section className="relative overflow-hidden bg-pine-900">
      <div className="absolute inset-0 dot-grid-light opacity-60" aria-hidden />
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-glow-500/10 blur-3xl" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <span className="eyebrow on-dark">{eyebrow}</span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.08] mt-5 max-w-3xl">
          {title}
        </h1>
        {copy && <p className="mt-5 text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed">{copy}</p>}
      </div>
    </section>
  );
}
