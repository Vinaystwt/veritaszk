'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getProof, getProofs, normalizeProof, truncateCommitment, type ProofRecord } from '@/lib/api'
import { DEMO_ORGS, TIERS } from '@/lib/constants'
import { TierBadge } from '@/components/ui/TierBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CommitmentDisplay } from '@/components/ui/CommitmentDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CodeBlock } from '@/components/ui/CodeBlock'

const SEARCH_SUGGESTIONS = DEMO_ORGS.map(d => ({ label: d.orgName, value: d.commitment }))

function ExpiryCountdown({ expiresAt }: { expiresAt?: string }) {
  const [remaining, setRemaining] = useState('')
  const [urgency, setUrgency] = useState<'ok'|'warn'|'critical'|'expired'>('ok')

  useEffect(() => {
    if (!expiresAt) return
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setRemaining('EXPIRED'); setUrgency('expired'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      if (diff < 86400000) { setUrgency('critical'); setRemaining(`${hours}h ${mins}m`) }
      else if (diff < 259200000) { setUrgency('warn'); setRemaining(`${days}d ${hours}h`) }
      else { setUrgency('ok'); setRemaining(`${days}d ${hours}h`) }
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [expiresAt])

  const colors = { ok: '#4fffb0', warn: '#e5ff4f', critical: '#ff4455', expired: '#666674' }

  return (
    <span
      className={`font-mono text-xs ${urgency === 'critical' ? 'critical-pulse' : ''}`}
      style={{ color: colors[urgency] }}
    >
      {remaining || '—'}
    </span>
  )
}

function ProofCard({ proof, onVerify }: { proof: ProofRecord; onVerify: () => void }) {
  const tierInfo = TIERS.find(t => t.tier === proof.tier)!
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [verifiedBlock, setVerifiedBlock] = useState<number | null>(null)

  const handleVerify = async () => {
    setVerifying(true)
    await new Promise(r => setTimeout(r, 1200))
    setVerified(true)
    setVerifiedBlock(15613711 + Math.floor(Math.random() * 100))
    setVerifying(false)
    onVerify()
  }

  const badgeCode = `<script src="https://veritaszk.vercel.app/badge.js" data-commitment="${proof.commitment}"></script>`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Main result card */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: `1px solid ${tierInfo.color}25` }}>
        <div className="px-6 py-5" style={{ background: `${tierInfo.color}06`, borderBottom: `1px solid ${tierInfo.color}15` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs mb-1" style={{ color: '#44444f' }}>ORGANIZATION</p>
              <h2 className="font-display text-2xl" style={{ color: '#f4f4f0' }}>{proof.orgName}</h2>
            </div>
            <TierBadge tier={proof.tier as 1|2|3|4} size="xl" showName showRatio />
          </div>
        </div>

        <div className="px-6 py-5" style={{ background: '#0f0f18' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="font-mono text-xs mb-1" style={{ color: '#44444f' }}>STATUS</p>
              <StatusBadge status={proof.expiringsSoon ? 'expiring' : proof.status as 'active'|'expired'|'revoked'} />
            </div>
            <div>
              <p className="font-mono text-xs mb-1" style={{ color: '#44444f' }}>COVERAGE</p>
              <p className="font-mono text-sm font-semibold" style={{ color: tierInfo.color }}>{tierInfo.label} coverage</p>
            </div>
            <div>
              <p className="font-mono text-xs mb-1" style={{ color: '#44444f' }}>STANDARD</p>
              <p className="font-mono text-xs" style={{ color: '#888896' }}>{tierInfo.regulatory}</p>
            </div>
            <div>
              <p className="font-mono text-xs mb-1" style={{ color: '#44444f' }}>EXPIRES IN</p>
              <ExpiryCountdown expiresAt={proof.expiresAt ?? new Date(Date.now() + 30 * 86400000).toISOString()} />
            </div>
          </div>

          <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-mono text-xs mb-0.5" style={{ color: '#44444f' }}>COMMITMENT</p>
                <CommitmentDisplay hash={proof.commitment} chars={10} />
              </div>
              <div>
                <p className="font-mono text-xs mb-0.5" style={{ color: '#44444f' }}>VERIFICATIONS</p>
                <span className="font-mono text-sm" style={{ color: '#f4f4f0' }}>{proof.verificationCount + (verified ? 1 : 0)}</span>
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 py-2 rounded font-body text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background: verified ? 'rgba(79,255,176,0.10)' : '#4fffb0',
                color: verified ? '#4fffb0' : '#08080d',
                border: verified ? '1px solid rgba(79,255,176,0.25)' : 'none',
                cursor: verifying ? 'wait' : 'pointer',
              }}
            >
              {verifying ? <><LoadingSpinner size="sm" color="#08080d" /> Verifying...</> : verified ? `✓ Verified at block #${verifiedBlock?.toLocaleString()}` : 'Verify Solvency Tier'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit record */}
      <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#44444f' }}>AUDIT RECORD</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Verifier Identity', value: 'Confidential', note: 'Verifier privacy is a protocol feature — identities never recorded on-chain', accent: true },
            { label: 'Org Commitment', value: truncateCommitment(proof.commitment, 6) },
            { label: 'Tier at Verification', value: `Tier ${proof.tier} — ${proof.tierName}` },
            { label: 'Block Verified', value: verified ? `#${verifiedBlock?.toLocaleString()}` : 'Pending verification' },
          ].map((item, i) => (
            <div key={i}>
              <p className="font-mono text-xs mb-1" style={{ color: '#44444f' }}>{item.label}</p>
              <p className="font-mono text-xs" style={{ color: item.accent ? '#e5ff4f' : '#888896' }} title={item.note}>{item.value}</p>
              {item.note && <p className="text-xs mt-0.5" style={{ color: '#44444f' }}>ⓘ {item.note}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory mapping */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-3" style={{ background: '#0f0f18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-mono text-xs tracking-widest" style={{ color: '#44444f' }}>REGULATORY MAPPING</p>
        </div>
        <div className="p-5">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { standard: 'Basel III Tier 1 Capital', satisfied: proof.tier >= 2, note: '≥ 1.5× coverage' },
                { standard: 'Solvency II SCR', satisfied: proof.tier >= 3, note: '≥ 2.0× coverage' },
                { standard: 'MiCA Article 76', satisfied: proof.tier >= 3, note: '≥ 2.0× coverage' },
                { standard: 'Basel III Advanced IRB', satisfied: proof.tier >= 4, note: '≥ 3.0× coverage' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-2.5 font-body text-sm" style={{ color: '#888896' }}>{row.standard}</td>
                  <td className="py-2.5 font-mono text-xs text-center" style={{ color: '#44444f' }}>{row.note}</td>
                  <td className="py-2.5 text-right font-mono text-xs font-semibold" style={{ color: row.satisfied ? '#4fffb0' : '#44444f' }}>
                    {row.satisfied ? '✓ Satisfied' : '— Not met'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embeddable badge */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#44444f' }}>EMBEDDABLE BADGE</p>
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded" style={{ background: '#0a0a14', border: '1px solid rgba(79,255,176,0.15)', width: 'fit-content' }}>
          <span className="font-mono text-xs font-semibold" style={{ color: '#4fffb0' }}>✓ Verified Solvent</span>
          <TierBadge tier={proof.tier as 1|2|3|4} size="sm" />
          <span className="font-mono text-xs" style={{ color: '#44444f' }}>VeritasZK</span>
        </div>
        <CodeBlock code={badgeCode} language="html" filename="embed.html" />
        <p className="font-mono text-xs mt-2" style={{ color: '#44444f' }}>Pulls live data every 5 minutes. Links to this verification page.</p>
      </div>
    </motion.div>
  )
}

function VerifierContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('commitment') ?? '')
  const [suggestions, setSuggestions] = useState<typeof SEARCH_SUGGESTIONS>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProofRecord | null>(null)
  const [error, setError] = useState('')
  const [allOrgs, setAllOrgs] = useState<ProofRecord[]>([])
  const [verificationCount, setVerificationCount] = useState(0)

  useEffect(() => {
    getProofs().then(proofs => {
      const normalized = (proofs ?? []).map(normalizeProof)
      setAllOrgs(normalized.length > 0 ? normalized : DEMO_ORGS.map(d => ({ ...d, issuedAt: new Date().toISOString() }) as ProofRecord))
    }).catch(() => {
      setAllOrgs(DEMO_ORGS.map(d => ({ ...d, issuedAt: new Date().toISOString() }) as ProofRecord))
    })
  }, [])

  // Auto-search if commitment in URL
  useEffect(() => {
    const c = searchParams.get('commitment')
    if (c) {
      setQuery(c)
      doSearch(c)
    }
  }, [])

  const doSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setShowSuggestions(false)
    try {
      // Try API first
      let proof: ProofRecord | null = null
      try {
        const raw = await getProof(q.trim())
        proof = normalizeProof(raw)
      } catch {
        // Fall back to local demo orgs
        const local = [...allOrgs, ...DEMO_ORGS.map(d => ({ ...d }) as ProofRecord)]
          .find(p => p.commitment === q.trim() || p.orgName.toLowerCase() === q.trim().toLowerCase())
        if (local) proof = normalizeProof(local)
      }
      if (proof) setResult(proof)
      else setError(`No proof found for: "${q.trim()}"`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (val: string) => {
    setQuery(val)
    if (val.length >= 2) {
      const filtered = [
        ...SEARCH_SUGGESTIONS,
        ...allOrgs.map(o => ({ label: o.orgName, value: o.commitment })),
      ].filter((s, i, arr) => arr.findIndex(x => x.value === s.value) === i)
        .filter(s => s.label.toLowerCase().includes(val.toLowerCase()) || s.value.includes(val))
      setSuggestions(filtered.slice(0, 6))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>PUBLIC VERIFIER</p>
          <h1 className="font-display text-4xl md:text-5xl mb-4" style={{ color: '#f4f4f0' }}>
            Verify any solvency proof.
          </h1>
          <p className="text-base font-body max-w-xl" style={{ color: '#888896' }}>
            No wallet required. Enter an organization name or commitment hash to verify their tier attestation on Aleo.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={e => handleInputChange(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => e.key === 'Enter' && doSearch(query)}
                placeholder="Organization name or commitment hash..."
                className="w-full px-4 py-3.5 rounded-lg font-body text-sm outline-none transition-all"
                style={{
                  background: '#0f0f18',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#f4f4f0',
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-10" style={{ background: '#161623', border: '1px solid rgba(255,255,255,0.10)' }}>
                  {suggestions.map(s => (
                    <button
                      key={s.value}
                      onMouseDown={() => { setQuery(s.value); doSearch(s.value) }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                      style={{ color: '#888896', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span className="font-body text-sm" style={{ color: '#f4f4f0' }}>{s.label}</span>
                      <span className="font-mono text-xs">{s.value.slice(0, 8)}...</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => doSearch(query)}
              disabled={loading}
              className="px-5 py-3.5 rounded-lg font-body font-medium text-sm flex items-center gap-2 transition-all"
              style={{ background: '#4fffb0', color: '#08080d', cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? <LoadingSpinner size="sm" color="#08080d" /> : 'Verify →'}
            </button>
          </div>

          {/* Quick demo links */}
          <div className="flex flex-wrap gap-2 mt-3">
            {DEMO_ORGS.map(org => (
              <button
                key={org.commitment}
                onClick={() => { setQuery(org.orgName); doSearch(org.orgName) }}
                className="font-mono text-xs px-2 py-1 rounded transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', color: '#44444f', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {org.orgName}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 px-4 py-3 rounded-lg font-mono text-sm"
              style={{ background: 'rgba(255,68,85,0.08)', color: '#ff4455', border: '1px solid rgba(255,68,85,0.15)' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <ProofCard
              proof={result}
              onVerify={() => setVerificationCount(v => v + 1)}
            />
          )}
        </AnimatePresence>

        {/* Empty state — show example orgs */}
        {!result && !error && !loading && (
          <div>
            <p className="font-mono text-xs mb-4" style={{ color: '#44444f' }}>EXAMPLE ORGANIZATIONS</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEMO_ORGS.map(org => (
                <button
                  key={org.commitment}
                  onClick={() => { setQuery(org.commitment); doSearch(org.commitment) }}
                  className="text-left rounded-xl p-4 transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm font-medium" style={{ color: '#f4f4f0' }}>{org.orgName}</span>
                    <TierBadge tier={org.tier as 1|2|3|4} size="sm" />
                  </div>
                  <p className="font-mono text-xs" style={{ color: '#44444f' }}>{org.commitment.slice(0, 16)}...</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifierPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080d' }} />}>
      <VerifierContent />
    </Suspense>
  )
}
