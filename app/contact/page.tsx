'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Navigation } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button, Card, Input, Label, Textarea, PageHero, Reveal } from '@/components/ui-kit';
import { createContactMessage } from '@/lib/db';

const INFO = [
  { icon: MapPin, label: 'Visit us', value: '14-B Main Boulevard, Gulberg III, Lahore' },
  { icon: Phone, label: 'Call us', value: '042-3577-8899' },
  { icon: Mail, label: 'Email', value: 'care@crescentcare.pk' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat · 9:00 AM – 9:00 PM' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General question');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email) && message.trim().length > 5;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSending(true);
    setError('');
    try {
      await createContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject,
        message: message.trim(),
      });
      setSent(true);
    } catch {
      setError('Could not save your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageHero
        eyebrow="Contact"
        title={<>We'd love to <span className="italic text-brand-300">hear from you.</span></>}
        copy="Questions about booking, billing or joining as a doctor — send us a message and we reply within one working day."
      />

      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
          {/* Info + map */}
          <div className="space-y-4">
            <Reveal>
              <Card className="p-6 sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900">Clinic information</h2>
                <div className="mt-6 space-y-4">
                  {INFO.map(item => (
                    <div key={item.label} className="flex gap-4">
                      <span className="size-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                        <item.icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-400">{item.label}</p>
                        <p className="font-bold text-ink-900 text-[15px] mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
            <Reveal delay={100}>
              {/* Stylised map placeholder — no external embeds or keys needed */}
              <div className="relative rounded-3xl overflow-hidden border border-ink-900/[0.07] shadow-soft bg-pine-900 min-h-64">
                <div className="absolute inset-0 dot-grid-light opacity-50" aria-hidden />
                <svg className="absolute inset-0 w-full h-full opacity-25" aria-hidden>
                  <g stroke="#7cc7b3" strokeWidth="1.5" fill="none">
                    <path d="M-20 80 C 120 60, 200 140, 400 110 S 700 60, 900 120" />
                    <path d="M-20 180 C 150 160, 300 220, 520 190 S 760 150, 920 200" />
                    <path d="M120 -20 C 140 120, 100 220, 160 340" />
                    <path d="M420 -20 C 400 100, 460 220, 420 340" />
                    <path d="M700 -20 C 720 120, 680 240, 740 340" />
                  </g>
                </svg>
                <div className="relative p-6 sm:p-8 flex flex-col justify-end min-h-64">
                  <div className="flex items-center gap-3">
                    <span className="size-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-glow animate-pulse-ring">
                      <Navigation className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold text-white">Crescent Care Medical Center</p>
                      <p className="text-white/60 text-sm font-medium">14-B Main Boulevard, Gulberg III, Lahore</p>
                    </div>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Main+Boulevard+Gulberg+III+Lahore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex"
                  >
                    <Button size="sm" variant="secondary" className="bg-white/10 border-white/15 text-white hover:bg-white hover:text-pine-900">
                      Open in Maps
                    </Button>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={80}>
            <Card className="p-6 sm:p-8">
              {sent ? (
                <div className="text-center py-10 animate-fade-up">
                  <span className="size-16 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto shadow-glow">
                    <CheckCircle2 className="size-8" />
                  </span>
                  <h2 className="font-display text-2xl font-semibold text-ink-900 mt-5">Message received</h2>
                  <p className="text-ink-500 text-[15px] mt-2 max-w-sm mx-auto leading-relaxed">
                    Thanks {name.split(' ')[0]} — our team will reply to <strong className="text-ink-900">{email}</strong> within one working day.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setName(''); setEmail(''); setPhone(''); setMessage(''); }}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">Send a message</h2>
                  <p className="text-sm text-ink-500 font-medium mt-1">Saved to our inbox — we reply within one working day.</p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ct-name">Full name</Label>
                      <Input id="ct-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
                    </div>
                    <div>
                      <Label htmlFor="ct-email">Email</Label>
                      <Input id="ct-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ct-phone">Phone <span className="text-ink-400 font-semibold">(optional)</span></Label>
                      <Input id="ct-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" inputMode="tel" />
                    </div>
                    <div>
                      <Label htmlFor="ct-subject">Subject</Label>
                      <select
                        id="ct-subject"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full rounded-2xl border border-ink-900/15 bg-white px-4 py-3 text-[15px] font-medium text-ink-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none cursor-pointer"
                      >
                        {['General question', 'Booking help', 'Billing', 'Joining as a doctor', 'Feedback'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="ct-msg">Message</Label>
                    <Textarea id="ct-msg" value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" required />
                  </div>
                  {error && <p className="mt-4 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3.5">{error}</p>}
                  <Button type="submit" size="lg" loading={sending} disabled={!valid} className="w-full mt-6">
                    <Send className="size-4" /> Send message
                  </Button>
                </form>
              )}
            </Card>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
