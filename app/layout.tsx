import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const sans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://clinic-medibook.vercel.app'),
  title: 'Crescent Care — Book Trusted Doctors Online in Pakistan',
  description:
    'Find verified doctors across Lahore, Karachi and Islamabad. Book appointments in seconds, manage your visits and prescriptions — all in one place.',
  keywords: 'doctor appointment, clinic booking, healthcare Pakistan, online doctor, Crescent Care',
  openGraph: {
    title: 'Crescent Care — Book Trusted Doctors Online',
    description: 'Verified doctors. Instant booking. Your health, handled.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b1f1c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
