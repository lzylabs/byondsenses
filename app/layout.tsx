import type { Metadata, Viewport } from 'next'
import { Orbitron, Space_Grotesk, Space_Mono } from 'next/font/google'
import { Providers } from '@/providers/Providers'
import './globals.css'

// ─── Fonts ────────────────────────────────────────────────────────────────────

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  weight: ['400', '700'],
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Byond Senses — Experiential Agency',
    template: '%s — Byond Senses',
  },
  description:
    'An artist collective and experiential agency creating phenomenal, out-of-this-world experiences at the intersection of technology, art, science, and culture.',
  keywords: [
    'experiential agency',
    'artist collective',
    'augmented reality',
    'virtual reality',
    'generative ai',
    'immersive art',
    'interactive installations',
    'projection mapping',
    'new media art',
  ],
  authors: [{ name: 'Byond Senses' }],
  creator: 'Byond Senses',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Byond Senses',
    title: 'Byond Senses — Experiential Agency',
    description:
      'Creating phenomenal experiences at the intersection of technology, art, science, and culture.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Byond Senses — Experiential Agency',
    description:
      'Creating phenomenal experiences at the intersection of technology, art, science, and culture.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // Needed for full-bleed immersive experience on iOS
  viewportFit: 'cover',
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body>
        {/* Skip-to-content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to content
        </a>

        <Providers>
          <main id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
