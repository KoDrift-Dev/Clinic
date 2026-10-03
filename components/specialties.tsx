import {
  HeartPulse, Sparkles, Baby, Bone, Venus, Brain, Stethoscope, SmilePlus,
  Activity, Eye, Ear, Syringe, Leaf, Ribbon, type LucideIcon,
} from 'lucide-react';

export interface SpecialtyMeta {
  icon: LucideIcon;
  blurb: string;
  accent: string; // soft bg class
}

const FALLBACK: SpecialtyMeta = {
  icon: Stethoscope,
  blurb: 'Comprehensive care for everyday health concerns.',
  accent: 'bg-brand-50 text-brand-700',
};

const MAP: Record<string, SpecialtyMeta> = {
  Cardiologist: {
    icon: HeartPulse,
    blurb: 'Heart health, blood pressure, ECG and cardiac care.',
    accent: 'bg-[#fdecec] text-[#b0523f]',
  },
  Dermatologist: {
    icon: Sparkles,
    blurb: 'Skin, hair and nail treatments that actually work.',
    accent: 'bg-[#f3ecfd] text-[#7c5cbf]',
  },
  Pediatrician: {
    icon: Baby,
    blurb: 'Gentle, expert care for newborns to teenagers.',
    accent: 'bg-[#fdf0ec] text-[#c06a3f]',
  },
  'Orthopedic Surgeon': {
    icon: Bone,
    blurb: 'Bones, joints, fractures and sports injuries.',
    accent: 'bg-glow-100 text-[#8a5a12]',
  },
  Gynecologist: {
    icon: Venus,
    blurb: "Women's health, pregnancy and hormonal care.",
    accent: 'bg-[#fdeef4] text-[#b0526b]',
  },
  Neurologist: {
    icon: Brain,
    blurb: 'Brain, nerves, migraines and sleep disorders.',
    accent: 'bg-[#e9f3fd] text-[#3f6d8e]',
  },
  'General Physician': {
    icon: Stethoscope,
    blurb: 'First stop for fevers, infections and checkups.',
    accent: 'bg-brand-50 text-brand-700',
  },
  Dentist: {
    icon: SmilePlus,
    blurb: 'Cleanings, fillings, braces and smile design.',
    accent: 'bg-[#eef8f5] text-brand-800',
  },
  Ophthalmologist: {
    icon: Eye,
    blurb: 'Eye exams, vision correction and eye surgery.',
    accent: 'bg-[#e9f3fd] text-[#3f6d8e]',
  },
  'ENT Specialist': {
    icon: Ear,
    blurb: 'Ear, nose, throat and hearing care.',
    accent: 'bg-[#f3ecfd] text-[#7c5cbf]',
  },
  Psychiatrist: {
    icon: Leaf,
    blurb: 'Confidential mental health and wellness support.',
    accent: 'bg-brand-50 text-brand-700',
  },
  Oncologist: {
    icon: Ribbon,
    blurb: 'Cancer screening, diagnosis and treatment plans.',
    accent: 'bg-[#fdeef4] text-[#b0526b]',
  },
  Surgeon: {
    icon: Syringe,
    blurb: 'General and minimally-invasive surgical care.',
    accent: 'bg-glow-100 text-[#8a5a12]',
  },
  Physiotherapist: {
    icon: Activity,
    blurb: 'Rehab, mobility and pain-relief programs.',
    accent: 'bg-brand-50 text-brand-700',
  },
};

export function specialtyMeta(name: string): SpecialtyMeta {
  return MAP[name] ?? FALLBACK;
}

export { Activity };
