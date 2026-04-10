'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const INCIDENTS = [
  {
    date: 'November 2, 2022',
    org: 'FTX',
    event: 'CoinDesk leaks balance sheet. Bank run begins November 8. Bankruptcy filed November 11.',
    amount: '$8 billion missing',
    color: '#ff4455',
  },
  {
    date: 'July 2022',
    org: 'Celsius Network',
    event: 'Insolvency exposed after withdrawals frozen. $4.7 billion in customer funds unrecoverable.',
    amount: '$4.7 billion',
    color: '#ff4455',
  },
  {
    date: 'November 2022',
    org: 'BlockFi',
    event: 'Filed for Chapter 11 bankruptcy within weeks of FTX collapse. Contagion from self-reported financials.',
    amount: '$1.8 billion',
    color: '#ff4455',
  },
  {
    date: 'December 2022',
    org: 'Binance (Merkle PoR)',
    event: 'Published 150,000+ wallet addresses in Merkle proof of reserves. Trading bots exploited the exposure within 48 hours.',
    amount: 'Privacy traded for transparency',
    color: '#e5ff4f',
  },
]

const TIMELINE = [
  { year: '1993', actor: 'Nick Szabo', event: '"Confidential Auditing" — unforgeable audit logs via secure timestamps. No implementation existed.' },
  { year: '2010s', actor: 'ZK-SNARK Theory', event: 'Zero-knowledge succinct non-interactive arguments of knowledge become computationally feasible.' },
  { year: '2024', actor: 'Aleo Mainnet', event: 'First privacy-native L1 with programmable ZK. Leo language enables onchain private execution.' },
  { year: '2026', actor: 'VeritasZK', event: 'First onchain implementation of Szabo\'s 1993 protocol. Solvency proven without disclosure.' },
]

const ROADMAP = [
  { title: 'zkTLS Bridge', desc: 'Prove custodied balances from Fireblocks, Coinbase, and institutional custodians via TLS attestation — without API key exposure.' },
  { title: 'Cross-chain Verification', desc: 'Accept multi-chain asset bundles from Ethereum, Solana, and BTC networks via bridge attestations.' },
  { title: 'Institutional Integrations', desc: 'Native integrations with Maple Finance, Clearpool, and TrueFi — enabling onchain credit underwriting without balance sheet disclosure.' },
  { title: 'Multi-sig Proof Submission', desc: 'Require M-of-N signatories to authorize proof submissions — matching institutional governance requirements.' },
]

export default function VisionPage() {
  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-xs tracking-widest mb-6" style={{ color: '#44444f' }}>THE THESIS</p>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-8" style={{ color: '#f4f4f0' }}>
              Trust without<br />
              <span className="italic" style={{ color: '#4fffb0' }}>disclosure.</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl font-body" style={{ color: '#888896' }}>
              Every financial crisis in crypto began with the same failure: institutions asked to be trusted,
              offered no proof, and collapsed when trust evaporated. VeritasZK closes this gap — permanently.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Section 1: The Problem */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>SECTION 01</p>
            <h2 className="font-display text-4xl md:text-5xl mb-16" style={{ color: '#f4f4f0' }}>
              The problem is not risk.<br />
              <span className="italic" style={{ color: '#ff4455' }}>It is unverifiable trust.</span>
            </h2>
          </FadeIn>

          <div className="space-y-6 mb-16">
            {INCIDENTS.map((inc, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: `${inc.color}05`,
                    border: `1px solid ${inc.color}18`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: `${inc.color}12`, color: inc.color, border: `1px solid ${inc.color}20` }}>
                        {inc.org}
                      </span>
                      <span className="font-mono text-xs" style={{ color: '#44444f' }}>{inc.date}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold" style={{ color: inc.color }}>{inc.amount}</span>
                  </div>
                  <p className="text-sm leading-relaxed font-body" style={{ color: '#888896' }}>{inc.event}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div
              className="rounded-xl p-8"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="font-display text-xl md:text-2xl leading-relaxed mb-4" style={{ color: '#f4f4f0' }}>
                "The common thread across every failure: self-reported financials,
                no independent cryptographic verification, and trust based on reputation
                instead of proof."
              </p>
              <p className="font-mono text-xs" style={{ color: '#44444f' }}>
                The Merkle PoR response traded one problem for another — transparency at the cost of privacy,
                exposing wallet addresses that bots immediately exploited.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 2: The Lineage */}
      <section className="py-24 md:py-32" style={{ background: '#0a0a14' }}>
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>SECTION 02</p>
            <h2 className="font-display text-4xl md:text-5xl mb-16" style={{ color: '#f4f4f0' }}>
              Thirty-three years<br />
              <span className="italic" style={{ color: '#4fffb0' }}>in the making.</span>
            </h2>
          </FadeIn>

          {/* Szabo quote */}
          <FadeIn delay={0.1}>
            <blockquote
              className="mb-16 pl-6 py-2"
              style={{ borderLeft: '2px solid #4fffb0' }}
            >
              <p className="font-display text-xl md:text-2xl leading-relaxed mb-3" style={{ color: '#f4f4f0' }}>
                "We can achieve auditing logs unforgeable after commitment via secure timestamps."
              </p>
              <footer className="font-mono text-xs" style={{ color: '#888896' }}>
                — Nick Szabo, <em>Confidential Auditing</em>, 1993
              </footer>
            </blockquote>
          </FadeIn>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-4 top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(79,255,176,0.3), transparent)' }}
            />

            <div className="space-y-10 pl-12">
              {TIMELINE.map((item, i) => (
                <FadeIn key={i} delay={i * 0.12}>
                  <div className="relative">
                    {/* Dot */}
                    <div
                      className="absolute -left-12 top-1.5 w-3 h-3 rounded-full"
                      style={{
                        background: i === TIMELINE.length - 1 ? '#4fffb0' : '#0a0a14',
                        border: `2px solid ${i === TIMELINE.length - 1 ? '#4fffb0' : 'rgba(79,255,176,0.4)'}`,
                        boxShadow: i === TIMELINE.length - 1 ? '0 0 12px rgba(79,255,176,0.5)' : 'none',
                      }}
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-bold" style={{ color: i === TIMELINE.length - 1 ? '#4fffb0' : '#888896' }}>{item.year}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#888896', border: '1px solid rgba(255,255,255,0.07)' }}>{item.actor}</span>
                    </div>
                    <p className="text-sm leading-relaxed font-body" style={{ color: '#888896' }}>{item.event}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Solution */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>SECTION 03</p>
            <h2 className="font-display text-4xl md:text-5xl mb-8" style={{ color: '#f4f4f0' }}>
              The solution:<br />
              <span className="italic" style={{ color: '#4fffb0' }}>proof without disclosure.</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-base leading-relaxed mb-12 max-w-2xl font-body" style={{ color: '#888896' }}>
              VeritasZK implements Szabo's 1993 protocol on Aleo — the first blockchain purpose-built for
              programmable privacy. Private inputs enter a Leo transition. A ZK range proof executes
              off-chain but is verified onchain. Only a tier classification and a boolean emerge publicly.
              No amounts. No addresses. No composition.
            </p>
          </FadeIn>

          {/* Animated flow diagram */}
          <FadeIn delay={0.2}>
            <div
              className="rounded-xl p-8 mb-12"
              style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="font-mono text-xs mb-6 tracking-widest" style={{ color: '#44444f' }}>ZK PROOF FLOW</p>
              <div className="flex flex-col md:flex-row items-center gap-4">
                {[
                  { label: 'Private Inputs', sub: 'Assets, liabilities, wallets', color: 'rgba(255,255,255,0.06)', text: '#888896' },
                  { label: '→', sub: '', color: 'transparent', text: '#44444f', arrow: true },
                  { label: 'Leo Transition', sub: 'prove_threshold()', color: 'rgba(79,255,176,0.06)', text: '#4fffb0' },
                  { label: '→', sub: '', color: 'transparent', text: '#44444f', arrow: true },
                  { label: 'Public Output', sub: 'Tier + boolean only', color: 'rgba(79,255,176,0.06)', text: '#4fffb0' },
                ].map((item, i) => (
                  item.arrow ? (
                    <div key={i} className="font-mono text-lg flex-shrink-0" style={{ color: '#4fffb0' }}>
                      <svg width="32" height="16" viewBox="0 0 32 16">
                        <defs><linearGradient id={`g${i}`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#44444f"/><stop offset="100%" stopColor="#4fffb0"/></linearGradient></defs>
                        <line x1="0" y1="8" x2="24" y2="8" stroke={`url(#g${i})`} strokeWidth="1.5" strokeDasharray="4 3">
                          <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.2s" repeatCount="indefinite"/>
                        </line>
                        <polygon points="20,3 30,8 20,13" fill="#4fffb0" opacity="0.8"/>
                      </svg>
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="flex-1 rounded-lg p-4 text-center"
                      style={{ background: item.color, border: `1px solid ${item.text}20`, minWidth: 130 }}
                    >
                      <p className="font-mono text-sm font-semibold mb-1" style={{ color: item.text }}>{item.label}</p>
                      <p className="font-mono text-xs" style={{ color: '#44444f' }}>{item.sub}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Regulatory alignment table */}
          <FadeIn delay={0.3}>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>REGULATORY ALIGNMENT</p>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f0f18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Tier', 'Coverage', 'Basel III', 'Solvency II', 'MiCA Art. 76'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-mono text-xs" style={{ color: '#44444f', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: 1, name: 'Standard', ratio: '≥ 1.0×', color: '#8888a0', basel: '—', solvency: '—', mica: '—' },
                    { tier: 2, name: 'Verified', ratio: '≥ 1.5×', color: '#4fffb0', basel: 'Tier 1 Capital', solvency: '—', mica: '—' },
                    { tier: 3, name: 'Strong', ratio: '≥ 2.0×', color: '#e5ff4f', basel: 'Tier 1 Capital', solvency: 'SCR satisfied', mica: '✓ Article 76' },
                    { tier: 4, name: 'Institutional', ratio: '≥ 3.0×', color: '#ffffff', basel: 'Advanced IRB', solvency: 'SCR + buffer', mica: '✓ Article 76' },
                  ].map(row => (
                    <tr key={row.tier} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold" style={{ color: row.color }}>T{row.tier} {row.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: row.color }}>{row.ratio}</td>
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: '#888896' }}>{row.basel}</td>
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: '#888896' }}>{row.solvency}</td>
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: row.mica.startsWith('✓') ? '#4fffb0' : '#888896' }}>{row.mica}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 4: Roadmap */}
      <section className="py-24 md:py-32" style={{ background: '#0a0a14' }}>
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>SECTION 04</p>
            <h2 className="font-display text-4xl md:text-5xl mb-16" style={{ color: '#f4f4f0' }}>
              What comes next.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ROADMAP.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className="rounded-xl p-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-xs" style={{ color: '#4fffb0' }}>0{i + 1}</span>
                    <h3 className="font-display text-lg" style={{ color: '#f4f4f0' }}>{item.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed font-body" style={{ color: '#888896' }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-display text-4xl md:text-5xl mb-6" style={{ color: '#f4f4f0' }}>
              The protocol is live.<br />
              <span className="italic" style={{ color: '#4fffb0' }}>Prove it for yourself.</span>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/organization?demo=true" className="px-7 py-3.5 rounded-lg font-body font-semibold text-base" style={{ background: '#4fffb0', color: '#08080d' }}>
                Try the Demo
              </Link>
              <Link href="/docs" className="px-7 py-3.5 rounded-lg font-body font-medium text-base" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#f4f4f0' }}>
                Read the Architecture →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
