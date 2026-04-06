'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Book,
  Code,
  Shield,
  Webhook,
  Terminal,
  Server,
  LayoutGrid,
  Menu,
  X,
  ChevronRight,
  Check,
  Copy,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import CodeBlock from '@/components/ui/CodeBlock'

const navItems = [
  { id: 'quickstart', label: 'Quickstart', icon: Book },
  { id: 'sdk', label: 'SDK Reference', icon: Code },
  { id: 'react-hooks', label: 'React Hooks', icon: Shield },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'mcp-server', label: 'MCP Server', icon: Server },
  { id: 'cli', label: 'CLI', icon: Terminal },
  { id: 'rest-api', label: 'REST API', icon: LayoutGrid },
  { id: 'architecture', label: 'Architecture', icon: Shield },
]

function NavItem({
  item,
  active,
  onClick,
}: {
  item: (typeof navItems)[number]
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all"
      style={{
        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-primary-dim)' : 'transparent',
        fontWeight: active ? 500 : 400,
      }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </button>
  )
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warn' }) {
  const colors = {
    default: { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', border: 'var(--border-default)' },
    success: { bg: 'var(--status-active-bg)', text: 'var(--status-active)', border: 'rgba(16,185,129,0.2)' },
    warn: { bg: 'var(--status-expiring-bg)', text: 'var(--status-expiring)', border: 'rgba(245,158,11,0.2)' },
  }
  const c = colors[variant]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {children}
    </span>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    navItems.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Mobile header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 md:hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Docs</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="border-b px-4 py-3 md:hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} active={activeSection === item.id} onClick={() => scrollTo(item.id)} />
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-screen-2xl">
        {/* Desktop sidebar */}
        <aside
          className="hidden w-[240px] shrink-0 border-r md:block"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <nav className="sticky top-0 space-y-0.5 overflow-y-auto p-4" style={{ maxHeight: '100vh' }}>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Documentation
            </p>
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} active={activeSection === item.id} onClick={() => scrollTo(item.id)} />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-6 py-10 md:px-12 lg:px-16">
          <div className="mx-auto max-w-4xl">

            {/* Quickstart */}
            <section id="quickstart" className="scroll-mt-20 pb-16">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="success">Getting Started</Badge>
              </div>
              <h1 className="mb-4 text-3xl font-semibold md:text-4xl" style={{ color: 'var(--text-primary)' }}>
                Quickstart
              </h1>
              <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Get VeritasZK running in your project in under a minute.
              </p>

              <CodeBlock code="npm install veritaszk-sdk" language="bash" />

              <p className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Verify a solvency proof in 3 lines:
              </p>

              <CodeBlock
                code={`import { VeritasZK } from 'veritaszk-sdk'

const client = new VeritasZK({ network: 'testnet' })
const proof = await client.generateSolvencyProof(assets, liabilities)
const verified = await client.verifyProof(proof)`}
                language="typescript"
              />

              <GlassCard className="mt-6 p-5">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      What you need
                    </p>
                    <ul className="mt-2 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <li>An Aleo wallet (Leo Wallet or Puplet)</li>
                      <li>Assets and liabilities as numeric arrays</li>
                      <li>Testnet access (mainnet coming soon)</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </section>

            {/* SDK Reference */}
            <section id="sdk" className="scroll-mt-20 pb-16">
              <h2 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                SDK Reference
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                Complete API documentation for the veritaszk-sdk package.
              </p>

              <div className="space-y-8">
                {[
                  {
                    name: 'generateSolvencyProof(assets, liabilities)',
                    params: [
                      { name: 'assets', type: 'number[]', desc: 'Array of asset values' },
                      { name: 'liabilities', type: 'number[]', desc: 'Array of liability values' },
                    ],
                    returns: 'Promise<Proof>',
                    desc: 'Generates a zero-knowledge proof that total assets >= total liabilities without revealing individual values.',
                    example: `const proof = await client.generateSolvencyProof(
  [1000, 500, 200],   // assets
  [800, 400]          // liabilities
)
// proof.commitment -> on-chain record`,
                  },
                  {
                    name: 'verifyProof(proof)',
                    params: [
                      { name: 'proof', type: 'Proof', desc: 'Proof object from generateSolvencyProof' },
                    ],
                    returns: 'Promise<boolean>',
                    desc: 'Verifies a solvency proof against on-chain state. Returns true if the proof is valid and the entity is solvent.',
                    example: `const isValid = await client.verifyProof(proof)
console.log(isValid) // true`,
                  },
                  {
                    name: 'getAuditTrail(commitment)',
                    params: [
                      { name: 'commitment', type: 'string', desc: 'On-chain commitment hash' },
                    ],
                    returns: 'Promise<AuditEntry[]>',
                    desc: 'Retrieves the full audit trail for a given proof commitment, including timestamp, verifier, and status.',
                    example: `const trail = await client.getAuditTrail('aleo1abc...')
// [{ timestamp, verifier, status, txId }]`,
                  },
                  {
                    name: 'registerVerifier(verifierAddress)',
                    params: [
                      { name: 'verifierAddress', type: 'string', desc: 'Aleo address of the verifier' },
                    ],
                    returns: 'Promise<VerifierRecord>',
                    desc: 'Registers a new verifier on the network. Only registered verifiers can validate proofs on-chain.',
                    example: `const verifier = await client.registerVerifier('aleo1verifier...')
// { address, status, registeredAt }`,
                  },
                  {
                    name: 'getSolvencyStatus(entityId)',
                    params: [
                      { name: 'entityId', type: 'string', desc: 'Unique entity identifier' },
                    ],
                    returns: 'Promise<SolvencyStatus>',
                    desc: 'Returns the current solvency status of an entity, including last proof timestamp and validity.',
                    example: `const status = await client.getSolvencyStatus('exchange-001')
// { isSolvent, lastProof, nextExpiry }`,
                  },
                  {
                    name: 'subscribeToEvents(callback)',
                    params: [
                      { name: 'callback', type: '(event: ProofEvent) => void', desc: 'Event handler function' },
                    ],
                    returns: '() => void',
                    desc: 'Subscribes to real-time proof events (generated, verified, expired). Returns an unsubscribe function.',
                    example: `const unsubscribe = client.subscribeToEvents((event) => {
  console.log(event.type, event.data)
})
// Later: unsubscribe()`,
                  },
                ].map((fn, i) => (
                  <GlassCard key={i} className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <code
                        className="text-sm font-semibold"
                        style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
                      >
                        {fn.name}
                      </code>
                    </div>
                    <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {fn.desc}
                    </p>
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                          Parameters
                        </p>
                        <div className="space-y-2">
                          {fn.params.map((p, j) => (
                            <div key={j} className="text-sm">
                              <code style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                {p.name}
                              </code>
                              <span className="mx-1.5" style={{ color: 'var(--text-tertiary)' }}>:</span>
                              <code
                                className="text-xs"
                                style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
                              >
                                {p.type}
                              </code>
                              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {p.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                          Returns
                        </p>
                        <code
                          className="text-sm"
                          style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
                        >
                          {fn.returns}
                        </code>
                      </div>
                    </div>
                    <CodeBlock code={fn.example} language="typescript" />
                  </GlassCard>
                ))}
              </div>
            </section>

            {/* React Hooks */}
            <section id="react-hooks" className="scroll-mt-20 pb-16">
              <h2 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                React Hooks
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                Ready-made hooks for integrating VeritasZK into React applications.
              </p>

              <div className="mb-10">
                <h3 className="mb-3 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                    useSolvencyStatus
                  </code>
                </h3>
                <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Polls for the latest solvency status of an entity. Returns status, loading state, and any errors.
                </p>
                <CodeBlock
                  code={`import { useSolvencyStatus } from 'veritaszk-sdk/react'

function StatusBadge({ entityId }: { entityId: string }) {
  const { status, loading, error } = useSolvencyStatus(entityId)

  if (loading) return <span>Checking...</span>
  if (error) return <span className="text-red-400">Error</span>

  return (
    <span className={status.isSolvent ? 'text-emerald-400' : 'text-red-400'}>
      {status.isSolvent ? 'Solvent' : 'Not Solvent'}
      <span className="ml-2 text-xs text-gray-500">
        Last proof: {new Date(status.lastProof).toLocaleString()}
      </span>
    </span>
  )
}`}
                  language="typescript"
                />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                    useAuditTrail
                  </code>
                </h3>
                <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Fetches and caches the audit trail for a given commitment. Supports pagination.
                </p>
                <CodeBlock
                  code={`import { useAuditTrail } from 'veritaszk-sdk/react'

function AuditHistory({ commitment }: { commitment: string }) {
  const { entries, loading, loadMore } = useAuditTrail(commitment, {
    pageSize: 20,
    pollingInterval: 30_000, // 30s
  })

  return (
    <div>
      {entries.map((entry) => (
        <AuditEntry key={entry.id} entry={entry} />
      ))}
      <button onClick={loadMore}>Load more</button>
    </div>
  )
}`}
                  language="typescript"
                />
              </div>
            </section>

            {/* Webhooks */}
            <section id="webhooks" className="scroll-mt-20 pb-16">
              <h2 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Webhooks
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                Receive real-time notifications when proofs are generated, verified, or expire.
              </p>

              <CodeBlock
                code={`import { VeritasZKWebhook } from 'veritaszk-sdk'

const webhook = new VeritasZKWebhook({
  endpoint: 'https://your-api.com/webhooks/veritaszk',
  secret: process.env.WEBHOOK_SECRET,
  events: ['proof.generated', 'proof.verified', 'proof.expired'],
})

// Start listening
await webhook.start()

// Handle events
webhook.on('proof.verified', (payload) => {
  console.log('Proof verified:', payload.commitment)
  // Update your database, notify users, etc.
})

webhook.on('proof.expired', (payload) => {
  console.log('Proof expired for:', payload.entityId)
  // Trigger a new proof generation
})

// Stop listening
await webhook.stop()`}
                language="typescript"
              />

              <GlassCard className="mt-6 p-5">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Security:{' '}
                  </span>
                  All webhook payloads are signed with HMAC-SHA256. Verify the signature using the
                  secret provided during webhook setup to prevent spoofed events.
                </p>
              </GlassCard>
            </section>

            {/* MCP Server */}
            <section id="mcp-server" className="scroll-mt-20 pb-16">
              <h2 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                MCP Server
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                Run VeritasZK as an MCP server so AI assistants can verify solvency proofs directly.
              </p>

              <p className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Start with npx:
              </p>
              <CodeBlock code="npx veritaszk-mcp" language="bash" />

              <p className="mb-3 mt-6 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Or add to Claude Desktop config:
              </p>
              <CodeBlock
                code={`{
  "mcpServers": {
    "veritaszk": {
      "command": "npx",
      "args": ["veritaszk-mcp"],
      "env": {
        "VERITASZK_NETWORK": "testnet",
        "ALEO_PRIVATE_KEY": "your-private-key"
      }
    }
  }
}`}
                language="json"
              />

              <p className="mb-3 mt-6 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Available MCP tools:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <th className="py-2 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>Tool</th>
                      <th className="py-2 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['verify_solvency', 'Generate and verify a solvency proof for given assets/liabilities'],
                      ['check_status', 'Check the current solvency status of an entity'],
                      ['get_audit_trail', 'Retrieve the audit trail for a proof commitment'],
                      ['list_verifiers', 'List all registered verifiers and their status'],
                    ].map(([tool, desc], i) => (
                      <tr key={i} className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <td className="py-2 pr-4 font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>
                          {tool}
                        </td>
                        <td className="py-2">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* CLI */}
            <section id="cli" className="scroll-mt-20 pb-16">
              <h2 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                CLI
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                Command-line interface for managing proofs, verifiers, and audits.
              </p>

              <div className="space-y-8">
                {[
                  {
                    cmd: 'veritaszk prove --assets [1000,500] --liabilities [800,400]',
                    desc: 'Generate a solvency proof',
                    output: `Generating solvency proof...
  Assets total:      1500 (hidden)
  Liabilities total: 1200 (hidden)
  Status: SOLVENT

  Commitment: aleo1qgp...x7k
  Proof hash: 0x3f7a...b2c1
  Timestamp: 2026-04-06T12:00:00Z`,
                  },
                  {
                    cmd: 'veritaszk verify --commitment aleo1qgp...x7k',
                    desc: 'Verify an existing proof',
                    output: `Verifying proof aleo1qgp...x7k...
  Status: VALID
  Entity: solvent
  Verified at: 2026-04-06T12:01:00Z
  Verifier: aleo1verifier...abc`,
                  },
                  {
                    cmd: 'veritaszk status --entity exchange-001',
                    desc: 'Check entity solvency status',
                    output: `Entity: exchange-001
  Solvency: SOLVENT
  Last proof: 2026-04-06T12:00:00Z
  Next expiry: 2026-04-07T12:00:00Z
  Proof count: 47`,
                  },
                  {
                    cmd: 'veritaszk audit --commitment aleo1qgp...x7k',
                    desc: 'Retrieve audit trail',
                    output: `Audit trail for aleo1qgp...x7k:

  #  Timestamp              Verifier            Status
  1  2026-04-06 12:00:00   aleo1ver...abc      VERIFIED
  2  2026-04-05 12:00:00   aleo1ver...abc      VERIFIED
  3  2026-04-04 12:00:00   aleo1ver...def      VERIFIED

  Total entries: 3`,
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.desc}
                    </p>
                    <CodeBlock code={item.cmd} language="bash" />
                    <CodeBlock code={item.output} language="text" />
                  </div>
                ))}
              </div>
            </section>

            {/* REST API */}
            <section id="rest-api" className="scroll-mt-20 pb-16">
              <h2 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                REST API
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                HTTP endpoints for programmatic access to VeritasZK services.
              </p>

              <div className="space-y-8">
                <GlassCard className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="success">GET</Badge>
                    <code
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      /api/verify/[commitment]
                    </code>
                  </div>
                  <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Verify a solvency proof by its on-chain commitment hash.
                  </p>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    Response (200)
                  </p>
                  <CodeBlock
                    code={`{
  "commitment": "aleo1qgp...x7k",
  "valid": true,
  "entityId": "exchange-001",
  "isSolvent": true,
  "verifiedAt": "2026-04-06T12:01:00Z",
  "expiresAt": "2026-04-07T12:00:00Z",
  "verifier": "aleo1verifier...abc",
  "txId": "at1..."
}`}
                    language="json"
                  />
                  <p className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Returns 404 if the commitment does not exist.
                  </p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="success">GET</Badge>
                    <code
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      /api/health
                    </code>
                  </div>
                  <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Health check endpoint. Returns service status and version.
                  </p>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    Response (200)
                  </p>
                  <CodeBlock
                    code={`{
  "status": "healthy",
  "version": "0.2.1",
  "network": "testnet",
  "uptime": 86400,
  "totalProofs": 1247,
  "lastProofAt": "2026-04-06T12:00:00Z"
}`}
                    language="json"
                  />
                </GlassCard>
              </div>
            </section>

            {/* Architecture */}
            <section id="architecture" className="scroll-mt-20 pb-16">
              <h2 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Architecture
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                How VeritasZK works under the hood.
              </p>

              <h3 className="mb-3 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Three-Program CPI Flow
              </h3>
              <CodeBlock
                code={`┌─────────────────────────────────────────────────────────┐
│                     Client (SDK / CLI)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  1. Prepare assets[] and liabilities[]             │  │
│  │  2. Call VeritasZK.generateSolvencyProof()         │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                         │                                │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Program: solvency_prover.aleo                     │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  INPUT:  assets[], liabilities[] (private)   │  │  │
│  │  │  LOGIC:  sum(assets) >= sum(liabilities)     │  │  │
│  │  │  OUTPUT: solvency_record (private Record)    │  │  │
│  │  │          proof_commitment  (public mapping)  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                         │ CPI                            │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Program: solvency_verifier.aleo                   │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  INPUT:  solvency_record, proof_commitment   │  │  │
│  │  │  LOGIC:  verify_proof(proof) && check_state  │  │  │
│  │  │  OUTPUT: verification_record (public mapping)│  │  │
│  │  │          status: { solvent, timestamp }      │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                         │ CPI                            │
│                         ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Program: audit_registry.aleo                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  INPUT:  verification_record                 │  │  │
│  │  │  LOGIC:  register_proof(commitment, entry)   │  │  │
│  │  │  OUTPUT: audit_entry (public mapping)        │  │  │
│  │  │          immutable on-chain audit trail      │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  On-chain:  public mappings (commitment -> status)      │
│  Off-chain: private Records (assets, liabilities, proof) │
└─────────────────────────────────────────────────────────┘`}
                language="text"
              />

              <h3 className="mb-4 mt-10 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Privacy Model
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <th className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>Data</th>
                      <th className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>Visibility</th>
                      <th className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>Storage</th>
                      <th className="py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>Accessible By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Asset values', 'Private', 'Record (encrypted)', 'Prover only'],
                      ['Liability values', 'Private', 'Record (encrypted)', 'Prover only'],
                      ['Solvency result', 'Public', 'Mapping', 'Anyone'],
                      ['Proof commitment', 'Public', 'Mapping', 'Anyone'],
                      ['Proof ZK proof', 'On-chain', 'Transaction', 'Verifier program'],
                      ['Audit trail entry', 'Public', 'Mapping', 'Anyone'],
                      ['Verifier identity', 'Public', 'Mapping', 'Anyone'],
                      ['Proof timestamp', 'Public', 'Mapping', 'Anyone'],
                    ].map(([data, vis, storage, access], i) => (
                      <tr key={i} className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>{data}</td>
                        <td className="py-2.5 pr-4">
                          <Badge variant={vis === 'Private' ? 'warn' : 'success'}>{vis}</Badge>
                        </td>
                        <td className="py-2.5 pr-4 text-xs font-mono">{storage}</td>
                        <td className="py-2.5 text-xs">{access}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
