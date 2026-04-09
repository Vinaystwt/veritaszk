'use client'
import Link from 'next/link'
import { PROGRAMS, EXPLORER_BASE } from '@/lib/constants'

export function Footer() {
  return (
    <footer style={{ background: '#08080d', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold" style={{ background: 'rgba(79,255,176,0.12)', border: '1px solid rgba(79,255,176,0.25)', color: '#4fffb0' }}>
                ZK
              </div>
              <span className="font-display text-base" style={{ color: '#f4f4f0' }}>VeritasZK</span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#888896' }}>
              Prove Solvency.<br />Reveal Nothing.
            </p>
            <p className="font-mono text-xs" style={{ color: '#44444f' }}>
              Aleo Testnet · 2026
            </p>
          </div>

          {/* Protocol */}
          <div>
            <p className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#44444f' }}>PROTOCOL</p>
            <div className="flex flex-col gap-2">
              {PROGRAMS.map(p => (
                <a
                  key={p.id}
                  href={p.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs transition-colors hover:opacity-100"
                  style={{ color: '#888896' }}
                >
                  {p.id}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#44444f' }}>NAVIGATE</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/organization', label: 'Organization' },
                { href: '/verifier', label: 'Verify Proof' },
                { href: '/public', label: 'Live Ledger' },
                { href: '/vision', label: 'Vision' },
                { href: '/docs', label: 'Docs' },
                { href: '/enterprise', label: 'Enterprise' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-sm transition-colors" style={{ color: '#888896' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Developer */}
          <div>
            <p className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#44444f' }}>DEVELOPER</p>
            <div className="flex flex-col gap-2">
              {[
                { href: 'https://www.npmjs.com/package/veritaszk-sdk', label: 'veritaszk-sdk' },
                { href: 'https://www.npmjs.com/package/veritaszk-mcp', label: 'veritaszk-mcp' },
                { href: 'https://www.npmjs.com/package/veritaszk-cli', label: 'veritaszk-cli' },
                { href: `${EXPLORER_BASE}/program/veritaszk_threshold.aleo`, label: 'Aleo Explorer' },
              ].map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors"
                  style={{ color: '#888896' }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-mono text-xs" style={{ color: '#44444f' }}>
            © 2026 VeritasZK · Zero financial data stored or retained
          </p>
          <p className="font-mono text-xs text-center" style={{ color: '#44444f' }}>
            Built on{' '}
            <a href="https://aleo.org" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: '#888896' }}>
              Aleo
            </a>
            {' '}· Aligned with Basel III, Solvency II, MiCA Article 76
          </p>
        </div>
      </div>
    </footer>
  )
}
