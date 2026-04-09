'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getHealth } from '@/lib/api'
import { PROGRAMS, RAILWAY_BASE } from '@/lib/constants'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const SECTIONS = [
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'api', label: 'REST API' },
  { id: 'sdk', label: 'SDK' },
  { id: 'mcp', label: 'MCP Server' },
  { id: 'cli', label: 'CLI' },
  { id: 'architecture', label: 'Architecture' },
]

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/health', desc: 'Indexer health, last indexed block, uptime, deployed programs' },
  { method: 'GET', path: '/api/stats', desc: 'Total orgs, active/expired/revoked proof counts' },
  { method: 'GET', path: '/api/proofs', desc: 'All tracked commitments with proof status and tier' },
  { method: 'GET', path: '/api/proofs/:commitment', desc: 'Single org proof details, tier, expiry, verification count' },
  { method: 'GET', path: '/api/tiers', desc: 'Tier distribution (T1–T4 counts) across all organizations' },
  { method: 'POST', path: '/api/proofs/register', desc: 'Register a new commitment for the indexer to track' },
]

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-20 scroll-mt-24">
      {children}
    </section>
  )
}

export default function DocsPage() {
  const [apiStatus, setApiStatus] = useState<'loading'|'live'|'error'>('loading')
  const [lastBlock, setLastBlock] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState('quickstart')

  useEffect(() => {
    getHealth()
      .then(h => { setApiStatus('live'); setLastBlock(h.lastIndexedBlock) })
      .catch(() => setApiStatus('error'))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          <p className="font-mono text-xs tracking-widest mb-3" style={{ color: '#44444f' }}>DEVELOPER DOCUMENTATION</p>
          <h1 className="font-display text-4xl md:text-5xl mb-4" style={{ color: '#f4f4f0' }}>
            Build with VeritasZK.
          </h1>
          <p className="text-base font-body max-w-xl" style={{ color: '#888896' }}>
            REST API, TypeScript SDK, MCP server, and CLI. Integrate solvency verification into any application in minutes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Sticky sidebar */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <p className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#44444f' }}>ON THIS PAGE</p>
              <nav className="space-y-1">
                {SECTIONS.map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block px-3 py-1.5 rounded font-mono text-xs transition-all"
                    style={{
                      color: activeSection === s.id ? '#4fffb0' : '#888896',
                      background: activeSection === s.id ? 'rgba(79,255,176,0.06)' : 'transparent',
                      borderLeft: `2px solid ${activeSection === s.id ? '#4fffb0' : 'transparent'}`,
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </nav>

              {/* API status */}
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-mono text-xs mb-2" style={{ color: '#44444f' }}>INDEXER STATUS</p>
                <div className="flex items-center gap-2">
                  {apiStatus === 'loading' ? (
                    <LoadingSpinner size="sm" color="#888896" />
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${apiStatus === 'live' ? 'pulse-dot' : ''}`} style={{ background: apiStatus === 'live' ? '#4fffb0' : '#ff4455' }} />
                  )}
                  <span className="font-mono text-xs" style={{ color: apiStatus === 'live' ? '#4fffb0' : apiStatus === 'error' ? '#ff4455' : '#888896' }}>
                    {apiStatus === 'loading' ? 'Checking...' : apiStatus === 'live' ? 'Live' : 'Unreachable'}
                  </span>
                </div>
                {lastBlock && (
                  <p className="font-mono text-xs mt-1" style={{ color: '#44444f' }}>Block #{lastBlock.toLocaleString()}</p>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* ─── QUICKSTART ─── */}
            <Section id="quickstart">
              <h2 className="font-display text-3xl mb-2" style={{ color: '#f4f4f0' }}>30-Second Quickstart</h2>
              <p className="font-body text-sm mb-6" style={{ color: '#888896' }}>Verify any organization's solvency tier from your terminal in one command.</p>
              <CodeBlock
                code={`npx veritaszk-cli verify --org DemoExchange`}
                language="bash"
              />
              <div className="mt-4 rounded-lg p-4" style={{ background: '#0a0a14', border: '1px solid rgba(79,255,176,0.12)' }}>
                <p className="font-mono text-xs mb-2" style={{ color: '#44444f' }}>Expected output:</p>
                <pre className="font-mono text-xs leading-relaxed" style={{ color: '#c8c8d4' }}>{`VeritasZK CLI v0.2.0

Organization : DemoExchange
Tier         : T4 Institutional
Coverage     : ≥ 3.0× (actual: 3.75×)
Status       : ACTIVE
Standard     : Basel III Advanced IRB
Verified at  : Block #15,613,711
Commitment   : a1b2c3d4e5f6...

✓ Solvency verified. No financial data disclosed.`}</pre>
              </div>
            </Section>

            {/* ─── CONTRACTS ─── */}
            <Section id="contracts">
              <h2 className="font-display text-3xl mb-2" style={{ color: '#f4f4f0' }}>Deployed Contracts</h2>
              <p className="font-body text-sm mb-6" style={{ color: '#888896' }}>All 4 programs are live on Aleo Testnet. Verified on-chain.</p>
              <div className="space-y-5">
                {PROGRAMS.map(p => (
                  <div key={p.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ background: '#0f0f18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <span className="font-mono text-sm font-semibold" style={{ color: '#4fffb0' }}>{p.id}</span>
                        <p className="font-body text-xs mt-0.5" style={{ color: '#888896' }}>{p.description}</p>
                      </div>
                      <a
                        href={p.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs px-3 py-1.5 rounded transition-all"
                        style={{ background: 'rgba(79,255,176,0.06)', color: '#4fffb0', border: '1px solid rgba(79,255,176,0.15)' }}
                      >
                        Explorer ↗
                      </a>
                    </div>
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-mono text-xs" style={{ color: '#44444f' }}>TX:</span>
                        <span className="font-mono text-xs" style={{ color: '#888896' }}>{p.txHash}</span>
                      </div>
                      <div>
                        <span className="font-mono text-xs mb-2 block" style={{ color: '#44444f' }}>TRANSITIONS ({p.transitions.length})</span>
                        <div className="flex flex-wrap gap-2">
                          {p.transitions.map(t => (
                            <span key={t} className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#888896', border: '1px solid rgba(255,255,255,0.06)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ─── REST API ─── */}
            <Section id="api">
              <h2 className="font-display text-3xl mb-2" style={{ color: '#f4f4f0' }}>REST API</h2>
              <div className="flex items-center gap-3 mb-6">
                <p className="font-body text-sm" style={{ color: '#888896' }}>Base URL:</p>
                <code className="font-mono text-sm px-3 py-1 rounded" style={{ background: '#0a0a14', color: '#4fffb0', border: '1px solid rgba(79,255,176,0.12)' }}>
                  {RAILWAY_BASE}
                </code>
                <div className="flex items-center gap-1.5">
                  {apiStatus === 'loading' ? <LoadingSpinner size="sm" color="#888896" /> : (
                    <span className={`w-2 h-2 rounded-full ${apiStatus === 'live' ? 'pulse-dot' : ''}`} style={{ background: apiStatus === 'live' ? '#4fffb0' : '#ff4455' }} />
                  )}
                  <span className="font-mono text-xs" style={{ color: apiStatus === 'live' ? '#4fffb0' : '#ff4455' }}>
                    {apiStatus === 'loading' ? '...' : apiStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {API_ENDPOINTS.map((ep, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded font-semibold"
                        style={{
                          background: ep.method === 'GET' ? 'rgba(79,255,176,0.08)' : 'rgba(229,255,79,0.08)',
                          color: ep.method === 'GET' ? '#4fffb0' : '#e5ff4f',
                          border: `1px solid ${ep.method === 'GET' ? 'rgba(79,255,176,0.2)' : 'rgba(229,255,79,0.2)'}`,
                        }}
                      >
                        {ep.method}
                      </span>
                      <code className="font-mono text-sm" style={{ color: '#f4f4f0' }}>{ep.path}</code>
                    </div>
                    <p className="font-body text-sm mb-3" style={{ color: '#888896' }}>{ep.desc}</p>
                    <CodeBlock
                      code={`curl ${RAILWAY_BASE}${ep.path.replace(':commitment', 'a1b2c3d4e5f6...')}`}
                      language="bash"
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* ─── SDK ─── */}
            <Section id="sdk">
              <h2 className="font-display text-3xl mb-2" style={{ color: '#f4f4f0' }}>TypeScript SDK</h2>
              <p className="font-body text-sm mb-6" style={{ color: '#888896' }}>
                Full-featured SDK for verifying proofs, watching expiry, and batch-verifying organizations.
              </p>
              <CodeBlock code="npm install veritaszk-sdk" language="bash" />
              <div className="mt-6 space-y-6">
                <div>
                  <p className="font-mono text-xs mb-3" style={{ color: '#44444f' }}>BATCH VERIFY FROM INDEXER</p>
                  <CodeBlock
                    code={`import { batchVerifyFromIndexer } from 'veritaszk-sdk'

const results = await batchVerifyFromIndexer([
  'DemoExchange',
  'TestFund',
  'SampleDAO',
])

results.forEach(r => {
  console.log(\`\${r.orgName}: Tier \${r.tier} — \${r.tierName}\`)
  // DemoExchange: Tier 4 — Institutional
  // TestFund: Tier 3 — Strong
  // SampleDAO: Tier 2 — Verified
})`}
                    language="typescript"
                    filename="verify.ts"
                  />
                </div>
                <div>
                  <p className="font-mono text-xs mb-3" style={{ color: '#44444f' }}>WATCH PROOF EXPIRY</p>
                  <CodeBlock
                    code={`import { watchProof } from 'veritaszk-sdk'

const unsubscribe = watchProof(commitment, (event) => {
  if (event.type === 'expiring') {
    console.log(\`Proof expires in \${event.blocksRemaining} blocks\`)
  }
  if (event.type === 'expired') {
    console.log('Proof has expired — renewal required')
  }
})

// Stop watching
unsubscribe()`}
                    language="typescript"
                    filename="watch.ts"
                  />
                </div>
                <div>
                  <p className="font-mono text-xs mb-3" style={{ color: '#44444f' }}>CHECK EXPIRY STATUS</p>
                  <CodeBlock
                    code={`import { isProofExpiredFromIndexer } from 'veritaszk-sdk'

const expired = await isProofExpiredFromIndexer(commitment)
if (expired) {
  console.log('Proof has expired — request renewal from organization')
}`}
                    language="typescript"
                    filename="expiry.ts"
                  />
                </div>
              </div>
            </Section>

            {/* ─── MCP ─── */}
            <Section id="mcp">
              <h2 className="font-display text-3xl mb-2" style={{ color: '#f4f4f0' }}>MCP Server</h2>
              <p className="font-body text-sm mb-6" style={{ color: '#888896' }}>
                Drop veritaszk-mcp into Claude Desktop to query solvency status from natural language.
              </p>
              <CodeBlock code="npm install veritaszk-mcp" language="bash" />
              <div className="mt-6 space-y-6">
                <div>
                  <p className="font-mono text-xs mb-3" style={{ color: '#44444f' }}>CLAUDE DESKTOP CONFIGURATION</p>
                  <CodeBlock
                    code={`// claude_desktop_config.json
{
  "mcpServers": {
    "veritaszk": {
      "command": "npx",
      "args": ["veritaszk-mcp"],
      "env": {
        "VERITASZK_INDEXER": "https://veritaszk-production.up.railway.app"
      }
    }
  }
}`}
                    language="json"
                    filename="claude_desktop_config.json"
                  />
                </div>
                <div>
                  <p className="font-mono text-xs mb-3" style={{ color: '#44444f' }}>AVAILABLE TOOLS</p>
                  <div className="space-y-3">
                    {[
                      { name: 'check_org_solvency', desc: 'Check the current solvency tier for a named organization or commitment hash.' },
                      { name: 'list_expiring_proofs', desc: 'List all proofs expiring within a specified time window (default 72h).' },
                    ].map(tool => (
                      <div key={tool.name} className="flex gap-4 p-4 rounded-lg" style={{ background: '#0a0a14', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <code className="font-mono text-sm flex-shrink-0" style={{ color: '#4fffb0' }}>{tool.name}</code>
                        <p className="font-body text-sm" style={{ color: '#888896' }}>{tool.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* ─── CLI ─── */}
            <Section id="cli">
              <h2 className="font-display text-3xl mb-2" style={{ color: '#f4f4f0' }}>CLI</h2>
              <p className="font-body text-sm mb-6" style={{ color: '#888896' }}>Terminal-based verification for CI pipelines and operator workflows.</p>
              <CodeBlock code="npm install -g veritaszk-cli" language="bash" />
              <div className="mt-6 space-y-4">
                {[
                  { cmd: 'veritaszk verify --org DemoExchange', desc: 'Verify solvency tier for a named organization' },
                  { cmd: 'veritaszk verify --commitment a1b2c3...', desc: 'Verify by commitment hash' },
                  { cmd: 'veritaszk list --active', desc: 'List all active proofs from the indexer' },
                  { cmd: 'veritaszk watch --org DemoExchange', desc: 'Watch a proof for expiry events (streams updates)' },
                  { cmd: 'veritaszk stats', desc: 'Show network-wide solvency statistics' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="font-body text-xs mb-2" style={{ color: '#888896' }}>{item.desc}</p>
                    <CodeBlock code={item.cmd} language="bash" />
                  </div>
                ))}
              </div>
            </Section>

            {/* ─── ARCHITECTURE ─── */}
            <Section id="architecture">
              <h2 className="font-display text-3xl mb-2" style={{ color: '#f4f4f0' }}>Architecture</h2>
              <p className="font-body text-sm mb-8" style={{ color: '#888896' }}>CPI flow between the four deployed Leo programs.</p>

              {/* CPI diagram */}
              <div
                className="rounded-xl p-8 mb-8"
                style={{ background: '#0a0a14', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="font-mono text-xs mb-8 tracking-widest" style={{ color: '#44444f' }}>PROGRAM DEPENDENCY GRAPH</p>
                <div className="flex flex-col items-center gap-0">
                  {/* Registry at top */}
                  <div className="flex items-center justify-center mb-0">
                    <div className="rounded-lg px-5 py-3 text-center" style={{ background: 'rgba(79,255,176,0.06)', border: '1px solid rgba(79,255,176,0.20)', minWidth: 200 }}>
                      <p className="font-mono text-xs font-semibold" style={{ color: '#4fffb0' }}>veritaszk_registry.aleo</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: '#44444f' }}>identity & credentials</p>
                    </div>
                  </div>
                  {/* Down arrow */}
                  <div className="flex flex-col items-center py-3">
                    <svg width="2" height="32" viewBox="0 0 2 32">
                      <line x1="1" y1="0" x2="1" y2="32" stroke="#4fffb0" strokeWidth="1" strokeDasharray="4 3" opacity="0.4">
                        <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.5s" repeatCount="indefinite"/>
                      </line>
                    </svg>
                    <span className="font-mono text-xs" style={{ color: '#4fffb0' }}>↓ validates</span>
                  </div>
                  {/* Core center */}
                  <div className="flex items-center justify-center mb-0">
                    <div className="rounded-lg px-5 py-3 text-center" style={{ background: 'rgba(79,255,176,0.10)', border: '2px solid rgba(79,255,176,0.30)', minWidth: 220 }}>
                      <p className="font-mono text-xs font-bold" style={{ color: '#4fffb0' }}>veritaszk_core.aleo</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: '#888896' }}>proof engine · central hub</p>
                    </div>
                  </div>
                  {/* Three outputs */}
                  <div className="flex items-start justify-center gap-16 mt-3">
                    {[
                      { label: '↙ audit events', prog: 'veritaszk_audit.aleo', sub: 'compliance trail' },
                      { label: '↘ tier proofs', prog: 'veritaszk_threshold.aleo', sub: 'asset bundles' },
                    ].map((node, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="py-3">
                          <svg width="2" height="28" viewBox="0 0 2 28">
                            <line x1="1" y1="0" x2="1" y2="28" stroke="#4fffb0" strokeWidth="1" strokeDasharray="4 3" opacity="0.4">
                              <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.5s" repeatCount="indefinite"/>
                            </line>
                          </svg>
                          <span className="font-mono text-xs block text-center" style={{ color: '#4fffb0', fontSize: 10 }}>{node.label}</span>
                        </div>
                        <div className="rounded-lg px-4 py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', minWidth: 170 }}>
                          <p className="font-mono text-xs font-medium" style={{ color: '#f4f4f0', fontSize: 11 }}>{node.prog}</p>
                          <p className="font-mono text-xs mt-0.5" style={{ color: '#44444f', fontSize: 10 }}>{node.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-5" style={{ background: 'rgba(255,68,85,0.04)', border: '1px solid rgba(255,68,85,0.12)' }}>
                <p className="font-mono text-xs mb-2 font-semibold" style={{ color: '#ff4455' }}>CPI Note</p>
                <p className="font-body text-sm" style={{ color: '#888896' }}>
                  Registry validation is enforced at the application layer due to a Leo v4.0.0 CPI finalize mapping read compiler limitation.
                  Import statements remain in core for architectural clarity. CPI cross-program invocation is fully planned for the next Leo release.
                </p>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </div>
  )
}
