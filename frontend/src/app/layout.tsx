import type { Metadata } from 'next'
import { Instrument_Serif, Figtree, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VeritasZK — Prove Solvency. Reveal Nothing.',
  description:
    'ZK proof-of-solvency on Aleo. Organizations prove financial health to regulators and counterparties using zero-knowledge range proofs — without revealing a single number. Aligned with Basel III, Solvency II, and MiCA Article 76.',
  keywords: ['zero knowledge', 'proof of solvency', 'Aleo', 'ZK', 'Basel III', 'Solvency II', 'MiCA', 'DeFi compliance'],
  openGraph: {
    title: 'VeritasZK — Prove Solvency. Reveal Nothing.',
    description: 'Zero-knowledge proof of solvency on Aleo. Built natively. Aligned with Basel III, Solvency II, and MiCA Article 76.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${figtree.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
