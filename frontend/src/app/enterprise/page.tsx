'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { TIERS } from '@/lib/constants'
import { TierBadge } from '@/components/ui/TierBadge'
import { CodeBlock } from '@/components/ui/CodeBlock'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const USE_CASES = [
  {
    type: 'Crypto Exchanges',
    challenge: 'Proof-of-reserves requirements without exposing wallet addresses to exploit-bots.',
    solution: 'Submit asset bundles via veritaszk_threshold.aleo. Publish only a tier badge. No hot wallet addresses on-chain.',
    tier: 4 as const,
  },
  {
    type: 'DAO Treasuries',
    challenge: 'Token holders demand financial transparency while the DAO must protect treasury strategy.',
    solution: 'Monthly tier attestations replace balance sheet disclosures. Governance votes reference the tier, not the numbers.',
    tier: 3 as const,
  },
  {
    type: 'DeFi Lending Protocols',
    challenge: 'Undercollateralization risk is invisible until a protocol fails. Lenders have no real-time signal.',
    solution: 'Integrate veritaszk-sdk into credit scoring pipelines. Alert when a borrower\'s tier drops below Verified.',
    tier: 2 as const,
  },
  {
    type: 'Regulated Funds',
    challenge: 'MiCA Article 76 and Solvency II require demonstrated capital adequacy — traditionally via expensive annual audits.',
    solution: 'ZK tier attestations provide continuous, regulator-readable proof of capital coverage. Audit costs near zero.',
    tier: 3 as const,
  },
]

const INTEGRATION_OPTIONS = [
  {
    name: 'TypeScript SDK',
    install: 'npm install veritaszk-sdk',
    desc: 'Native SDK for Node.js and browser applications. Verify proofs, watch expiry, batch-check portfolios.',
    best: 'Web apps, backend services, CI/CD pipelines',
    href: '/docs#sdk',
  },
  {
    name: 'MCP Server',
    install: 'npm install veritaszk-mcp',
    desc: 'AI agent compliance monitoring via Model Context Protocol. Claude, GPT-4, and any MCP-compatible agent.',
    best: 'AI compliance assistants, automated monitoring',
    href: '/docs#mcp',
  },
  {
    name: 'REST API',
    install: 'curl https://veritaszk-production.up.railway.app/api/proofs',
    desc: 'Language-agnostic HTTP endpoints. Works with any tech stack — Python, Go, Ruby, Java, or direct curl.',
    best: 'Backend integrations, cross-language systems',
    href: '/docs#api',
  },
  {
    name: 'CLI',
    install: 'npm install -g veritaszk-cli',
    desc: 'Terminal verification for operators and compliance teams. Scriptable, pipeable, CI-friendly.',
    best: 'DevOps workflows, operator dashboards, scripts',
    href: '/docs#cli',
  },
]

export default function EnterprisePage() {
  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a14' }}>
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>ENTERPRISE</p>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-6" style={{ color: '#f4f4f0' }}>
              Compliance that scales.<br />
              <span className="italic" style={{ color: '#4fffb0' }}>Privacy that holds.</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl font-body" style={{ color: '#888896' }}>
              VeritasZK replaces expensive, static audit engagements with continuous,
              cryptographically unforgeable solvency attestations — at near-zero cost per verification.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Before / After */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>COMPLIANCE WORKFLOW</p>
            <h2 className="font-display text-4xl mb-12" style={{ color: '#f4f4f0' }}>The old way vs. the proof way.</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <FadeIn delay={0.1}>
              <div
                className="rounded-xl p-7 h-full"
                style={{ background: 'rgba(255,68,85,0.04)', border: '1px solid rgba(255,68,85,0.12)' }}
              >
                <p className="font-mono text-xs mb-6 tracking-widest" style={{ color: '#ff4455' }}>BEFORE — TRADITIONAL AUDIT</p>
                <div className="space-y-4">
                  {[
                    { label: 'Frequency', value: 'Annual engagement' },
                    { label: 'Duration', value: '4–6 week process' },
                    { label: 'Cost', value: '$50,000 – $200,000+' },
                    { label: 'Output', value: 'Static PDF report' },
                    { label: 'Verification', value: 'No independent verification' },
                    { label: 'Privacy', value: 'Full financials disclosed to auditor' },
                    { label: 'Latency', value: 'Data is months old at publication' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="font-mono text-xs" style={{ color: '#44444f' }}>{item.label}</span>
                      <span className="font-body text-sm" style={{ color: '#888896' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* After */}
            <FadeIn delay={0.2}>
              <div
                className="rounded-xl p-7 h-full"
                style={{ background: 'rgba(79,255,176,0.04)', border: '1px solid rgba(79,255,176,0.15)' }}
              >
                <p className="font-mono text-xs mb-6 tracking-widest" style={{ color: '#4fffb0' }}>AFTER — VERITASZK</p>
                <div className="space-y-4">
                  {[
                    { label: 'Frequency', value: 'On-demand, any time', accent: true },
                    { label: 'Duration', value: '< 5 minutes', accent: true },
                    { label: 'Cost', value: 'Near zero (gas fees only)', accent: true },
                    { label: 'Output', value: 'Cryptographic on-chain attestation', accent: true },
                    { label: 'Verification', value: 'Anyone, instantly, no setup', accent: true },
                    { label: 'Privacy', value: 'Zero financial data disclosed', accent: true },
                    { label: 'Latency', value: 'Real-time, block-anchored', accent: true },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="font-mono text-xs" style={{ color: '#44444f' }}>{item.label}</span>
                      <span className="font-body text-sm font-medium" style={{ color: '#4fffb0' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-24 md:py-32" style={{ background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>USE CASES</p>
            <h2 className="font-display text-4xl mb-16" style={{ color: '#f4f4f0' }}>
              Who uses VeritasZK.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {USE_CASES.map((uc, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  className="rounded-xl p-7 h-full"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                  whileHover={{ borderColor: 'rgba(79,255,176,0.20)', background: 'rgba(79,255,176,0.02)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl" style={{ color: '#f4f4f0' }}>{uc.type}</h3>
                    <TierBadge tier={uc.tier} size="sm" />
                  </div>
                  <div className="mb-4">
                    <p className="font-mono text-xs mb-1.5" style={{ color: '#ff4455' }}>CHALLENGE</p>
                    <p className="text-sm leading-relaxed font-body" style={{ color: '#888896' }}>{uc.challenge}</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs mb-1.5" style={{ color: '#4fffb0' }}>SOLUTION</p>
                    <p className="text-sm leading-relaxed font-body" style={{ color: '#888896' }}>{uc.solution}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Tier → Regulator mapping */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>REGULATORY MAPPING</p>
            <h2 className="font-display text-4xl mb-12" style={{ color: '#f4f4f0' }}>
              Which tier satisfies which standard.
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f0f18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Tier', 'Coverage', 'Basel III', 'Solvency II SCR', 'MiCA Article 76', 'Description'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-mono text-xs" style={{ color: '#44444f', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: 1, ratio: '≥ 1.0×', color: '#8888a0', basel: '—', solvency: '—', mica: '—', desc: 'Operational minimum' },
                    { tier: 2, ratio: '≥ 1.5×', color: '#4fffb0', basel: '✓ Tier 1', solvency: '—', mica: '—', desc: 'Bank capital standard' },
                    { tier: 3, ratio: '≥ 2.0×', color: '#e5ff4f', basel: '✓ Tier 1', solvency: '✓ SCR', mica: '✓ Art. 76', desc: 'Insurance + crypto standard' },
                    { tier: 4, ratio: '≥ 3.0×', color: '#ffffff', basel: '✓ Advanced IRB', solvency: '✓ SCR+', mica: '✓ Art. 76', desc: 'Institutional fortress' },
                  ].map(row => (
                    <tr key={row.tier} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-3.5 px-4">
                        <TierBadge tier={row.tier as 1|2|3|4} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-sm font-semibold" style={{ color: row.color }}>{row.ratio}</td>
                      <td className="py-3.5 px-4 font-mono text-xs" style={{ color: row.basel.startsWith('✓') ? '#4fffb0' : '#44444f' }}>{row.basel}</td>
                      <td className="py-3.5 px-4 font-mono text-xs" style={{ color: row.solvency.startsWith('✓') ? '#4fffb0' : '#44444f' }}>{row.solvency}</td>
                      <td className="py-3.5 px-4 font-mono text-xs" style={{ color: row.mica.startsWith('✓') ? '#4fffb0' : '#44444f' }}>{row.mica}</td>
                      <td className="py-3.5 px-4 font-body text-sm" style={{ color: '#888896' }}>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Integration options */}
      <section className="py-24 md:py-32" style={{ background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>INTEGRATION</p>
            <h2 className="font-display text-4xl mb-16" style={{ color: '#f4f4f0' }}>
              Four ways to integrate.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {INTEGRATION_OPTIONS.map((opt, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div
                  className="rounded-xl p-6 h-full flex flex-col"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg" style={{ color: '#f4f4f0' }}>{opt.name}</h3>
                    <Link href={opt.href} className="font-mono text-xs" style={{ color: '#4fffb0' }}>Docs →</Link>
                  </div>
                  <div className="mb-4">
                    <CodeBlock code={opt.install} language="bash" />
                  </div>
                  <p className="text-sm leading-relaxed mb-3 flex-1 font-body" style={{ color: '#888896' }}>{opt.desc}</p>
                  <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="font-mono text-xs" style={{ color: '#44444f' }}>Best for: </span>
                    <span className="font-mono text-xs" style={{ color: '#888896' }}>{opt.best}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <FadeIn>
              <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#f4f4f0' }}>
                Ready to integrate?
              </h2>
              <p className="text-base mt-4 max-w-md font-body" style={{ color: '#888896' }}>
                Contact the team for enterprise integration support, custom tier configurations, or regulatory alignment guidance.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:enterprise@veritaszk.xyz"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-body font-semibold text-base transition-all"
                  style={{ background: '#4fffb0', color: '#08080d' }}
                >
                  Contact for Enterprise Integration
                </a>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-body font-medium text-base transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#f4f4f0' }}
                >
                  Read the Architecture →
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
