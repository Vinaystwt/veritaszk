'use client'

import { motion } from 'framer-motion'
import { Shield, Eye, Lock, Zap, ChevronDown, ArrowRight } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      className="my-10 pl-6 pr-4 py-4 text-2xl font-light leading-relaxed italic"
      style={{
        borderLeft: '4px solid var(--accent-primary)',
        color: 'var(--text-primary)',
        background: 'var(--accent-primary-dim)',
        borderRadius: '0 8px 8px 0',
      }}
    >
      {children}
    </blockquote>
  )
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 opacity-30">
      <div className="h-px w-12" style={{ background: 'var(--border-subtle)' }} />
      <div
        className="h-1 w-1 rounded-full"
        style={{ background: 'var(--accent-primary)' }}
      />
      <div className="h-px w-12" style={{ background: 'var(--border-subtle)' }} />
    </div>
  )
}

export default function VisionPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 pt-32 pb-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase"
          style={{
            background: 'var(--accent-primary-dim)',
            color: 'var(--accent-primary)',
            border: '1px solid var(--accent-primary-glow)',
          }}
        >
          <Shield className="h-3.5 w-3.5" />
          VeritasZK Vision
        </motion.div>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Solvency Without Surveillance
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 max-w-xl text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          A future where financial transparency does not mean financial exposure. How zero-knowledge
          proofs rewrite the rules of trust.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 animate-bounce"
        >
          <ChevronDown className="h-6 w-6" style={{ color: 'var(--text-tertiary)' }} />
        </motion.div>
      </section>

      <div className="mx-auto max-w-[720px] px-4 sm:px-6">
        {/* Section 1: The Problem With Proof of Reserves */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16"
        >
          <div className="mb-8 flex items-center gap-3">
            <Eye className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              The Problem With Proof of Reserves
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              In November 2022, FTX collapsed. $8 billion in customer funds vanished overnight. What
              made it worse was not just the fraud -- it was that nobody saw it coming. Not auditors.
              Not regulators. Not the customers themselves.
            </p>
            <p>
              FTX was not alone. Celsius, BlockFi, Voyager -- each one claimed to be fully backed.
              Each one published attestations or proof-of-reserves snapshots. And each one hid
              liabilities behind closed doors while customers had no way to verify the truth.
            </p>
            <p>
              The current standard for Proof of Reserves relies on Merkle tree inclusion proofs. An
              exchange publishes a snapshot: a Merkle root of all user balances, and each user gets a
              path to verify their balance is included. On paper, this proves user assets exist. In
              practice, it leaks everything.
            </p>
            <PullQuote>
              Proving solvency should not require disclosing your entire financial position.
            </PullQuote>
            <p>
              Merkle PoR exposes every account balance on-chain. It reveals the exchange total
              liabilities. Competitors can map out your entire user base. It proves nothing about
              off-chain debts, loans, or encumbered assets. And critically, it is a point-in-time
              snapshot -- meaningless the moment markets move.
            </p>
          </div>
        </motion.section>

        <SectionDivider />

        {/* Section 2: Why Existing Solutions Fall Short */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16"
        >
          <h2 className="mb-8 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Why Existing Solutions Fall Short
          </h2>
          <div className="space-y-8">
            {[
              {
                title: 'Exchange PoR Leaks Positions',
                body: 'Merkle-based proofs require every balance to be publicly traceable. For institutional players, this is unacceptable. A hedge fund cannot publish its positions. A market maker cannot reveal its depth. The very act of proving solvency becomes a competitive vulnerability.',
              },
              {
                title: 'Audits Are Slow, Expensive, and Point-in-Time',
                body: 'Traditional audits cost tens of thousands of dollars and take weeks. By the time the report is published, the financial position may have changed entirely. Audits also rely on trusting the auditor -- they are not cryptographic, they are reputational.',
              },
              {
                title: 'Self-Attestation Has No Cryptographic Guarantee',
                body: 'Anyone can publish a claim of solvency. Without a zero-knowledge proof tying that claim to actual on-chain state, self-attestation is just a statement. It carries the same weight as a press release -- zero cryptographic weight.',
              },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <h3
                  className="text-xl font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.title}
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <SectionDivider />

        {/* Section 3: How Zero-Knowledge Proofs Change This */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16"
        >
          <div className="mb-8 flex items-center gap-3">
            <Lock className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              How Zero-Knowledge Proofs Change This
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              A zero-knowledge proof lets you prove that something is true without revealing anything
              beyond the fact that it is true. Think of it like proving you are over 21 without
              showing your ID -- the bouncer learns only that you are old enough, nothing about your
              name, address, or exact age.
            </p>
            <p>
              Applied to solvency, the idea is straightforward. An exchange or institution holds
              assets and owes liabilities. The question is simple: are assets greater than or equal
              to liabilities? A zero-knowledge proof can answer that question with mathematical
              certainty -- without revealing the actual numbers.
            </p>

            <div
              className="my-8 rounded-xl p-6"
              style={{
                background: 'var(--accent-primary-dim)',
                border: '1px solid var(--accent-primary-glow)',
              }}
            >
              <h4
                className="mb-3 text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent-primary)' }}
              >
                What is proven
              </h4>
              <ul className="space-y-2 text-base" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Total assets meet or exceed total liabilities
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Each user balance is included in the computation
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  The proof is tied to a specific point in time via on-chain data
                </li>
              </ul>
              <h4
                className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent-primary)' }}
              >
                What stays hidden
              </h4>
              <ul className="space-y-2 text-base" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Individual user balances
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Total asset or liability amounts
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Counterparty identities and positions
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Trading strategies or portfolio composition
                </li>
              </ul>
            </div>

            <p>
              The result is a binary: solvent or not. No numbers leaked. No positions exposed. Just a
              cryptographic guarantee that the institution holds what it owes.
            </p>
          </div>
        </motion.section>

        <SectionDivider />

        {/* Section 4: Why Aleo Makes This Possible */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16"
        >
          <div className="mb-8 flex items-center gap-3">
            <Zap className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Why Aleo Makes This Possible
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              Not all blockchains are built with privacy in mind. Ethereum, Solana, Bitcoin -- every
              transaction, every balance, every position is visible to anyone who looks. That is by
              design for public chains, but it makes private solvency proofs impossible.
            </p>
            <p>
              Aleo is different. It was built from the ground up as a privacy-first smart contract
              platform. Every computation runs off-chain, with only the proof submitted on-chain.
              State is stored in private Records -- encrypted data objects that only authorized parties
              can read. Programs can expose public mappings for verified outputs while keeping all
              inputs private.
            </p>

            <div className="my-8 space-y-4">
              {[
                {
                  chain: 'Ethereum',
                  privateState: 'No private state. Everything is public.',
                  publicVerify: 'Full transparency, zero privacy.',
                  verdict: 'Not suitable for private solvency.',
                },
                {
                  chain: 'Aztec',
                  privateState: 'Private transactions via Noir.',
                  publicVerify: 'Limited public verification layer.',
                  verdict: 'Growing ecosystem but restricted composability.',
                },
                {
                  chain: 'Aleo',
                  privateState: 'Private Records with encrypted state.',
                  publicVerify: 'Public mappings for verified outputs.',
                  verdict: 'Both private state and public verification. Purpose-built for this.',
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-5"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-default)',
                  }}
                >
                  <h4
                    className="text-base font-semibold"
                    style={{
                      color:
                        row.chain === 'Aleo'
                          ? 'var(--accent-primary)'
                          : 'var(--text-primary)',
                    }}
                  >
                    {row.chain}
                  </h4>
                  <div className="mt-3 space-y-1 text-sm">
                    <p style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Private state:{' '}
                      </span>
                      {row.privateState}
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Public verify:{' '}
                      </span>
                      {row.publicVerify}
                    </p>
                    <p className="mt-2" style={{ color: 'var(--text-tertiary)' }}>
                      {row.verdict}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <PullQuote>
              Aleo gives you the rare combination of private computation and publicly verifiable
              proofs. That is the exact combination solvency requires.
            </PullQuote>
          </div>
        </motion.section>

        <SectionDivider />

        {/* Section 5: Where We Go From Here */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="py-16"
        >
          <h2 className="mb-10 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Where We Go From Here
          </h2>
          <div className="relative space-y-10 pl-8">
            {/* Vertical timeline line */}
            <div
              className="absolute left-[11px] top-2 h-full w-px"
              style={{ background: 'var(--border-subtle)' }}
            />
            {[
              {
                status: 'Now',
                label: 'Testnet Live',
                desc: 'The core VeritasZK protocol is deployed on Aleo testnet. The SDK is published, the CLI is functional, and the MCP server integrates with AI assistants. Anyone can run a solvency proof today on testnet.',
              },
              {
                status: 'Next',
                label: 'Mainnet Deployment',
                desc: 'Moving to Aleo mainnet with production-grade programs, optimized proving times, and formal verification of the core solvency logic. Institution-ready infrastructure and audit trails.',
              },
              {
                status: 'Future',
                label: 'Institutional Adoption',
                desc: 'Opening VeritasZK as a standard for exchanges, custodians, and DeFi protocols across chains. A world where solvency is continuously provable, privately and cryptographically, without compromise.',
              },
            ].map((milestone, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute -left-8 top-1.5 h-3 w-3 rounded-full"
                  style={{
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 8px var(--accent-primary-glow)',
                  }}
                />
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {milestone.status}
                  </span>
                  <h3
                    className="text-xl font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {milestone.label}
                  </h3>
                </div>
                <p
                  className="mt-2 text-lg leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {milestone.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
          className="py-20 text-center"
        >
          <p className="mb-6 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Ready to see it in action?
          </p>
          <a
            href="/docs"
            className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium transition-all hover:opacity-90"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--bg-base)',
            }}
          >
            Read the Docs
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.section>
      </div>
    </div>
  )
}
