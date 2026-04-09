'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDemoSeed } from '@/hooks/useDemoSeed'
import { useLiveBlock } from '@/hooks/useLiveBlock'
import { getProofs, getStats, normalizeProof, timeAgo, type ProofRecord } from '@/lib/api'
import { DEMO_ORGS, TIERS } from '@/lib/constants'
import { TierBadge } from '@/components/ui/TierBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CommitmentDisplay } from '@/components/ui/CommitmentDisplay'
import { SkeletonLine } from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

type FilterStatus = 'all' | 'active' | 'expired' | 'revoked'
type FilterTier = 0 | 1 | 2 | 3 | 4

function ExpiryCell({ proof }: { proof: ProofRecord }) {
  const expiresAt = proof.expiresAt ?? new Date(Date.now() + 30 * 86400000).toISOString()
  const diff = new Date(expiresAt).getTime() - Date.now()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)

  if (diff <= 0) return <span className="font-mono text-xs" style={{ color: '#666674' }}>Expired</span>
  if (diff < 86400000) return <span className="font-mono text-xs critical-pulse" style={{ color: '#ff4455' }}>{hours}h left</span>
  if (diff < 259200000) return <span className="font-mono text-xs pulse-dot" style={{ color: '#e5ff4f' }}>{days}d {hours}h</span>
  return <span className="font-mono text-xs" style={{ color: '#4fffb0' }}>{days}d {hours}h</span>
}

export default function PublicPage() {
  useDemoSeed() // fires on mount — same as homepage

  const liveBlock = useLiveBlock()
  const [proofs, setProofs] = useState<ProofRecord[]>([])
  const [stats, setStats] = useState<{ totalOrgs: number; activeProofs: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterTier, setFilterTier] = useState<FilterTier>(0)
  const [search, setSearch] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  const loadData = async () => {
    try {
      const [proofsData, statsData] = await Promise.allSettled([getProofs(), getStats()])

      if (proofsData.status === 'fulfilled') {
        const raw = proofsData.value ?? []
        const normalized = raw.length > 0
          ? raw.map(normalizeProof)
          : DEMO_ORGS.map(d => ({
              ...d,
              issuedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
              expiresAt: d.expiringsSoon
                ? new Date(Date.now() + 2 * 86400000).toISOString()
                : new Date(Date.now() + 30 * 86400000).toISOString(),
            }) as ProofRecord)
        setProofs(normalized)
      }

      if (statsData.status === 'fulfilled') {
        setStats({ totalOrgs: statsData.value.totalOrgs, activeProofs: statsData.value.activeProofs })
      }

      setLastUpdated(new Date().toTimeString().slice(0, 8))
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadData()
    const interval = setInterval(loadData, 20000)
    return () => clearInterval(interval)
  }, [])

  // Filtered proofs
  const expiringProofs = proofs.filter(p => {
    if (!p.expiresAt) return false
    const diff = new Date(p.expiresAt).getTime() - Date.now()
    return diff > 0 && diff < 259200000 // 72 hours
  })

  const filtered = proofs.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (filterTier !== 0 && p.tier !== filterTier) return false
    if (search && !p.orgName.toLowerCase().includes(search.toLowerCase()) && !p.commitment.includes(search)) return false
    return true
  })

  const avgTier = proofs.length > 0
    ? (proofs.reduce((s, p) => s + p.tier, 0) / proofs.length).toFixed(1)
    : '—'

  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-widest mb-3" style={{ color: '#44444f' }}>LIVE PROOF LEDGER</p>
              <h1 className="font-display text-4xl md:text-5xl" style={{ color: '#f4f4f0' }}>
                Every proof. <span className="italic" style={{ color: '#4fffb0' }}>Public.</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs" style={{ color: '#44444f' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#4fffb0' }} />
              {mounted ? `Updated ${lastUpdated}` : 'Loading...'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: '#0f0f18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-8">
            {loading ? (
              [1,2,3,4,5].map(i => <SkeletonLine key={i} width={100} height={3} />)
            ) : (
              [
                { label: 'Total Orgs', value: stats?.totalOrgs ?? proofs.length },
                { label: 'Active Proofs', value: stats?.activeProofs ?? proofs.filter(p => p.status === 'active').length },
                { label: 'Expiring Soon', value: expiringProofs.length, warn: expiringProofs.length > 0 },
                { label: 'Average Tier', value: `T${avgTier}`, mono: true },
                { label: 'Current Block', value: liveBlock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), mono: true },
              ].map((s, i) => (
                <div key={i}>
                  <p className="font-mono text-xs mb-0.5" style={{ color: '#44444f' }}>{s.label}</p>
                  <p className={`text-lg font-semibold ${s.mono ? 'font-mono' : 'font-body'}`} style={{ color: s.warn ? '#e5ff4f' : '#f4f4f0' }}>
                    {s.value}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Expiring Soon section */}
        {expiringProofs.length > 0 && (
          <div className="mb-10">
            <p className="font-mono text-xs mb-4 tracking-widest" style={{ color: '#e5ff4f' }}>
              ⚡ EXPIRING WITHIN 72 HOURS ({expiringProofs.length})
            </p>
            <div className="flex gap-4 flex-wrap">
              {expiringProofs.map(p => (
                <Link
                  key={p.commitment}
                  href={`/verifier?commitment=${p.commitment}`}
                  className="px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all"
                  style={{ background: 'rgba(229,255,79,0.04)', border: '1px solid rgba(229,255,79,0.15)' }}
                >
                  <TierBadge tier={p.tier as 1|2|3|4} size="sm" />
                  <span className="font-body text-sm" style={{ color: '#f4f4f0' }}>{p.orgName}</span>
                  <ExpiryCell proof={p} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by org name or commitment..."
            className="flex-1 px-4 py-2.5 rounded-lg font-body text-sm outline-none"
            style={{ background: '#0f0f18', border: '1px solid rgba(255,255,255,0.08)', color: '#f4f4f0' }}
          />

          <div className="flex gap-2">
            {(['all', 'active', 'expired', 'revoked'] as FilterStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-2 rounded font-mono text-xs capitalize transition-all"
                style={{
                  background: filterStatus === s ? 'rgba(79,255,176,0.10)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filterStatus === s ? 'rgba(79,255,176,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  color: filterStatus === s ? '#4fffb0' : '#888896',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {([0, 1, 2, 3, 4] as FilterTier[]).map(t => (
              <button
                key={t}
                onClick={() => setFilterTier(t)}
                className="px-3 py-2 rounded font-mono text-xs transition-all"
                style={{
                  background: filterTier === t ? 'rgba(79,255,176,0.10)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filterTier === t ? 'rgba(79,255,176,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  color: filterTier === t ? '#4fffb0' : '#888896',
                  cursor: 'pointer',
                }}
              >
                {t === 0 ? 'All' : `T${t}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-14 rounded-lg shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-mono text-sm" style={{ color: '#44444f' }}>No proofs match your filter</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3" style={{ background: '#0f0f18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Organization', 'Tier', 'Coverage', 'Status', 'Issued', 'Expires', 'Verifications', ''].map((h, i) => (
                <div key={i} className={`font-mono text-xs ${i === 0 ? 'col-span-2' : 'col-span-1'}`} style={{ color: '#44444f' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map((proof, i) => (
                <motion.div
                  key={proof.commitment}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <div className="col-span-2">
                    <p className="font-body text-sm font-medium" style={{ color: '#f4f4f0' }}>{proof.orgName}</p>
                    <CommitmentDisplay hash={proof.commitment} chars={5} showCopy={false} />
                  </div>
                  <div className="col-span-1">
                    <TierBadge tier={proof.tier as 1|2|3|4} size="sm" showName={false} />
                  </div>
                  <div className="col-span-1">
                    <span className="font-mono text-xs" style={{ color: TIERS.find(t => t.tier === proof.tier)?.color }}>
                      {TIERS.find(t => t.tier === proof.tier)?.label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={proof.expiringsSoon ? 'expiring' : proof.status as 'active'|'expired'|'revoked'} size="sm" />
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-xs" style={{ color: '#888896' }}>{timeAgo(proof.issuedAt)}</span>
                  </div>
                  <div className="col-span-2">
                    <ExpiryCell proof={proof} />
                  </div>
                  <div className="col-span-1">
                    <span className="font-mono text-xs" style={{ color: '#888896' }}>{proof.verificationCount}</span>
                  </div>
                  <div className="col-span-1 text-right">
                    <Link href={`/verifier?commitment=${proof.commitment}`} className="font-mono text-xs transition-colors" style={{ color: '#4fffb0' }}>
                      Verify →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <p className="font-mono text-xs mt-4 text-center" style={{ color: '#44444f' }}>
          {filtered.length} of {proofs.length} proofs · Auto-refreshes every 20 seconds
        </p>
      </div>
    </div>
  )
}
