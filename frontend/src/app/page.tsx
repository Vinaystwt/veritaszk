'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useDemoSeed } from '@/hooks/useDemoSeed'
import { useLiveBlock } from '@/hooks/useLiveBlock'
import { getStats, getTiers, getProofs, normalizeProof, timeAgo, type ProofRecord } from '@/lib/api'
import { TIERS, PROGRAMS, DEMO_ORGS, SZABO_SENTENCE, TRUST_BADGES } from '@/lib/constants'
import { TierBadge } from '@/components/ui/TierBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner, SkeletonLine } from '@/components/ui/LoadingSpinner'

// Locale-safe number formatter — consistent on server and client
function fmt(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// ─── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 1600) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || target === 0) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return { value, ref }
}

// ─── Section fade-in wrapper ─────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ZK Privacy visualization ────────────────────────────────────────────────
function ZKDiagram() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 2000)
    return () => clearInterval(t)
  }, [])

  const inputData = [
    { label: 'Assets', value: '$4,127,833', blurred: true },
    { label: 'Liabilities', value: '$1,389,204', blurred: true },
    { label: 'Wallets', value: '0xf4...8a2c', blurred: true },
    { label: 'Strategy', value: 'CONFIDENTIAL', blurred: true },
  ]

  return (
    <div className="relative flex items-center justify-between gap-4 md:gap-8 py-8">
      {/* Panel 1: Private data */}
      <motion.div
        className="flex-1 rounded-xl p-5"
        style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
        animate={{ borderColor: step >= 0 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)' }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-mono text-xs mb-3 tracking-widest" style={{ color: '#44444f' }}>PRIVATE INPUTS</p>
        <div className="space-y-2">
          {inputData.map((d, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="font-mono text-xs" style={{ color: '#888896' }}>{d.label}</span>
              <span
                className="font-mono text-xs rounded transition-all duration-700"
                style={{
                  color: step <= 1 ? 'transparent' : '#44444f',
                  background: step <= 1 ? 'rgba(255,255,255,0.08)' : 'transparent',
                  textShadow: step <= 1 ? 'none' : 'none',
                  padding: step <= 1 ? '0 8px' : '0',
                  filter: step <= 1 ? 'blur(4px)' : 'blur(0)',
                }}
              >
                {d.value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-mono text-xs" style={{ color: '#44444f' }}>🔒 Never leaves your machine</p>
        </div>
      </motion.div>

      {/* Arrow + circuit */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <svg width="80" height="40" viewBox="0 0 80 40">
          <defs>
            <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#44444f" />
              <stop offset="100%" stopColor="#4fffb0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="20" x2="65" y2="20" stroke="url(#arrowGrad)" strokeWidth="1.5" strokeDasharray="4 3">
            <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.5s" repeatCount="indefinite" />
          </line>
          <polygon points="60,14 74,20 60,26" fill="#4fffb0" opacity="0.8" />
        </svg>
        <div
          className="rounded px-2 py-1 font-mono text-xs"
          style={{ background: 'rgba(79,255,176,0.06)', border: '1px solid rgba(79,255,176,0.15)', color: '#4fffb0' }}
        >
          ZK Circuit
        </div>
      </div>

      {/* Panel 2: ZK Output */}
      <motion.div
        className="flex-1 rounded-xl p-5"
        style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(79,255,176,0.12)' }}
        animate={{ borderColor: step >= 2 ? 'rgba(79,255,176,0.30)' : 'rgba(79,255,176,0.12)' }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-mono text-xs mb-3 tracking-widest" style={{ color: '#44444f' }}>PUBLIC ATTESTATION</p>

        <AnimatePresence mode="wait">
          {step >= 2 ? (
            <motion.div
              key="output"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: '#888896' }}>Solvency</span>
                <span className="font-mono text-xs font-bold" style={{ color: '#4fffb0' }}>✓ TRUE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: '#888896' }}>Tier</span>
                <TierBadge tier={3} size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: '#888896' }}>Coverage</span>
                <span className="font-mono text-xs" style={{ color: '#e5ff4f' }}>≥ 2.0×</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="loading" className="space-y-3">
              <SkeletonLine width="80%" height={3} />
              <SkeletonLine width="60%" height={3} />
              <SkeletonLine width="70%" height={3} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(79,255,176,0.08)' }}>
          <p className="font-mono text-xs" style={{ color: '#4fffb0' }}>→ Publicly verifiable on Aleo</p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── ZK Collapse Animation — hex-chars converging to T4 badge ───────────────
// Cycle: 4.2s drift → 1.8s collapse → 2.2s hold → 1.6s disperse → repeat
function ZKFieldAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const HEX = '0123456789abcdef'
    const rh = () => HEX[Math.random() * 16 | 0] + HEX[Math.random() * 16 | 0]

    const NUM = 320
    const T_DRIFT = 4200
    const T_COLLAPSE = 1800
    const T_HOLD = 2200
    const T_DISPERSE = 1600

    interface Particle {
      x: number; y: number; vx: number; vy: number
      char: string; charTimer: number; charRate: number
      targetX: number; targetY: number; baseAlpha: number
    }

    let W = 0, H = 0, animId = 0, last = 0
    let phase: 'drift' | 'collapse' | 'hold' | 'disperse' = 'drift'
    let phaseT = 0
    let particles: Particle[] = []
    let targets: { x: number; y: number }[] = []

    const buildTargets = () => {
      // Badge zone: right half of canvas, vertically centred
      const bX = Math.round(W * 0.54)
      const bY = Math.round(H * 0.12)
      const bW = Math.round(W * 0.44)
      const bH = Math.round(H * 0.76)
      if (bW < 20 || bH < 20) return

      const tmp = document.createElement('canvas')
      tmp.width = bW; tmp.height = bH
      const tc = tmp.getContext('2d')
      if (!tc) return
      tc.fillStyle = '#000'
      tc.fillRect(0, 0, bW, bH)
      const fs = Math.min(Math.floor(bH * 0.72), Math.floor(bW * 0.64))
      tc.font = `700 ${fs}px "JetBrains Mono", monospace`
      tc.fillStyle = '#fff'
      tc.textAlign = 'center'
      tc.textBaseline = 'middle'
      tc.fillText('T4', bW / 2, bH / 2)

      const { data } = tc.getImageData(0, 0, bW, bH)
      const step = 7
      const pts: { x: number; y: number }[] = []
      for (let y = 0; y < bH; y += step) {
        for (let x = 0; x < bW; x += step) {
          if (data[(y * bW + x) * 4] > 128) pts.push({ x: bX + x, y: bY + y })
        }
      }
      targets = pts
    }

    const assignTargets = () => {
      if (!targets.length) return
      const shuffled = [...targets].sort(() => Math.random() - 0.5)
      particles.forEach((p, i) => {
        const t = shuffled[i % shuffled.length]
        p.targetX = t.x; p.targetY = t.y
      })
    }

    const initParticles = () => {
      particles = Array.from({ length: NUM }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        char: rh(), charTimer: Math.random() * 800,
        charRate: 380 + Math.random() * 1100,
        targetX: 0, targetY: 0,
        baseAlpha: 0.03 + Math.random() * 0.07,
      }))
    }

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = W * dpr; canvas.height = H * dpr
      ctx.scale(dpr, dpr)
      buildTargets()
      assignTargets()
    }

    const draw = (ts: number) => {
      const dt = Math.min(ts - last, 50); last = ts
      phaseT += dt

      if (phase === 'drift' && phaseT >= T_DRIFT) {
        phase = 'collapse'; phaseT = 0; assignTargets()
      } else if (phase === 'collapse' && phaseT >= T_COLLAPSE) {
        phase = 'hold'; phaseT = 0
      } else if (phase === 'hold' && phaseT >= T_HOLD) {
        phase = 'disperse'; phaseT = 0
        particles.forEach(p => {
          const a = Math.random() * Math.PI * 2
          const s = 0.6 + Math.random() * 1.2
          p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s
        })
      } else if (phase === 'disperse' && phaseT >= T_DISPERSE) {
        phase = 'drift'; phaseT = 0
        particles.forEach(p => {
          p.vx = (Math.random() - 0.5) * 0.22
          p.vy = (Math.random() - 0.5) * 0.22
          p.baseAlpha = 0.03 + Math.random() * 0.07
        })
      }

      ctx.clearRect(0, 0, W, H)
      ctx.font = '10.5px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const colT = phase === 'collapse' ? Math.min(phaseT / T_COLLAPSE, 1) : 0
      const disT = phase === 'disperse' ? Math.min(phaseT / T_DISPERSE, 1) : 0

      particles.forEach(p => {
        p.charTimer += dt
        if (p.charTimer > p.charRate) {
          p.char = rh(); p.charTimer = 0; p.charRate = 380 + Math.random() * 1100
        }

        let alpha = p.baseAlpha

        if (phase === 'drift') {
          p.x += p.vx; p.y += p.vy
          if (p.x < -12) p.x = W + 12
          if (p.x > W + 12) p.x = -12
          if (p.y < -12) p.y = H + 12
          if (p.y > H + 12) p.y = -12
        } else if (phase === 'collapse') {
          // Cubic ease-out: fast start, gentle landing
          const ease = 1 - Math.pow(1 - colT, 3)
          p.x += (p.targetX - p.x) * ease * 0.10
          p.y += (p.targetY - p.y) * ease * 0.10
          alpha = p.baseAlpha + colT * 0.82
        } else if (phase === 'hold') {
          // Tight pixel jitter — chars shimmer while locked in formation
          p.x = p.targetX + (Math.random() - 0.5) * 1.4
          p.y = p.targetY + (Math.random() - 0.5) * 1.4
          alpha = 0.88
        } else if (phase === 'disperse') {
          p.x += p.vx; p.y += p.vy
          p.vx *= 0.965; p.vy *= 0.965
          alpha = 0.88 * (1 - disT) + p.baseAlpha * disT
        }

        ctx.fillStyle = `rgba(79,255,176,${Math.min(alpha, 0.92).toFixed(3)})`
        ctx.fillText(p.char, p.x, p.y)
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    assignTargets()

    const onResize = () => { resize(); if (phase === 'drift') assignTargets() }
    window.addEventListener('resize', onResize)
    animId = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}

// ─── Architecture node ───────────────────────────────────────────────────────
function ArchNode({ label, sub, accent = false }: { label: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-center"
      style={{
        background: accent ? 'rgba(79,255,176,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${accent ? 'rgba(79,255,176,0.20)' : 'rgba(255,255,255,0.08)'}`,
        minWidth: 140,
      }}
    >
      <p className="font-mono text-xs font-medium" style={{ color: accent ? '#4fffb0' : '#f4f4f0' }}>{label}</p>
      {sub && <p className="font-mono text-xs mt-0.5" style={{ color: '#44444f' }}>{sub}</p>}
    </div>
  )
}

// ─── Proof activity feed item ─────────────────────────────────────────────────
function FeedItem({ proof }: { proof: ProofRecord }) {
  const tierColors: Record<number, string> = { 1: '#8888a0', 2: '#4fffb0', 3: '#e5ff4f', 4: '#ffffff' }
  return (
    <span className="flex items-center gap-3 px-6 flex-shrink-0 whitespace-nowrap font-mono text-xs" style={{ color: '#888896' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tierColors[proof.tier] ?? '#4fffb0' }} />
      <span style={{ color: '#f4f4f0' }}>{proof.orgName}</span>
      <span>→</span>
      <span style={{ color: tierColors[proof.tier] }}>Tier {proof.tier} {proof.tierName}</span>
      <span style={{ color: '#44444f' }}>·</span>
      <span>{timeAgo(proof.issuedAt)}</span>
      <span className="mx-4 opacity-20">|</span>
    </span>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  useDemoSeed()
  const liveBlock = useLiveBlock()

  const [stats, setStats] = useState<{ totalOrgs: number; activeProofs: number; averageTier: number } | null>(null)
  const [proofs, setProofs] = useState<ProofRecord[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        const [statsData, proofsData] = await Promise.allSettled([getStats(), getProofs()])

        if (cancelled) return

        if (statsData.status === 'fulfilled') {
          const s = statsData.value
          setStats({
            totalOrgs: s.totalOrgs ?? 0,
            activeProofs: s.activeProofs ?? 0,
            averageTier: 0,
          })
        }

        if (proofsData.status === 'fulfilled') {
          const normalized = (proofsData.value ?? []).map(normalizeProof)
          const feed = normalized.length > 0 ? normalized : DEMO_ORGS.map(d => ({
            ...d, status: d.status, issuedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
          }) as ProofRecord)
          setProofs(feed)

          // compute average tier
          if (feed.length > 0) {
            const avg = feed.reduce((s, p) => s + p.tier, 0) / feed.length
            setStats(prev => prev ? { ...prev, averageTier: avg } : null)
          }
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setStatsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // Counters
  const totalOrgsCounter = useCounter(stats?.totalOrgs ?? 0)
  const activeProofsCounter = useCounter(stats?.activeProofs ?? 0)

  // Inline proof demo
  const [proofDemo, setProofDemo] = useState<null | 'computing' | 'submitting' | 'done'>(null)
  const [demoProgress, setDemoProgress] = useState(0)

  const runProofDemo = () => {
    if (proofDemo !== null) return
    setProofDemo('computing')
    setDemoProgress(0)

    // Animate progress 0→100 over 1000ms
    const start = Date.now()
    const tick1 = () => {
      const p = Math.min((Date.now() - start) / 1000, 1)
      setDemoProgress(p * 100)
      if (p < 1) requestAnimationFrame(tick1)
      else {
        setProofDemo('submitting')
        setDemoProgress(0)
        const start2 = Date.now()
        const tick2 = () => {
          const p2 = Math.min((Date.now() - start2) / 1500, 1)
          setDemoProgress(p2 * 100)
          if (p2 < 1) requestAnimationFrame(tick2)
          else setProofDemo('done')
        }
        requestAnimationFrame(tick2)
      }
    }
    requestAnimationFrame(tick1)
  }

  // Doubled feed for seamless loop
  const feedItems = proofs.length > 0 ? [...proofs, ...proofs] : [...DEMO_ORGS, ...DEMO_ORGS].map(d => ({ ...d, issuedAt: new Date(Date.now() - 3600000).toISOString() }) as ProofRecord)

  return (
    <div className="min-h-screen bg-base">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: '#08080d' }}>
        {/* ZK hex field — live cryptographic canvas */}
        <ZKFieldAnimation />
        {/* Deep vignette so text stays primary */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse 55% 70% at 38% 50%, rgba(8,8,13,0.0) 0%, rgba(8,8,13,0.82) 60%, rgba(8,8,13,0.97) 100%)',
              'radial-gradient(ellipse 30% 40% at 80% 50%, rgba(8,8,13,0.70) 0%, transparent 100%)',
              'linear-gradient(to bottom, rgba(8,8,13,0.5) 0%, transparent 15%, transparent 85%, rgba(8,8,13,0.8) 100%)',
            ].join(', '),
          }}
        />
        {/* Accent glow beneath headline */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '0%', top: '35%', width: '45%', height: '30%',
            background: 'radial-gradient(ellipse at 30% 50%, rgba(79,255,176,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-4xl">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full font-mono text-xs"
              style={{ background: 'rgba(79,255,176,0.06)', border: '1px solid rgba(79,255,176,0.15)', color: '#4fffb0' }}
            >
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#4fffb0' }} />
              Live on Aleo Testnet · Block {fmt(liveBlock)}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl md:text-7xl leading-tight mb-6"
              style={{ color: '#f4f4f0' }}
            >
              Solvency,{' '}
              <span className="italic">Proven.</span>
              <br />
              <span style={{ color: '#4fffb0' }}>Privately.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-body"
              style={{ color: '#888896' }}
            >
              VeritasZK lets organizations prove financial health to regulators and counterparties
              using zero-knowledge range proofs — without revealing a single number.
              Built natively on Aleo. Aligned with{' '}
              <span style={{ color: '#f4f4f0' }}>Basel III, Solvency II, and MiCA Article 76.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/organization"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-body font-medium text-base transition-all"
                style={{
                  background: '#4fffb0',
                  color: '#08080d',
                }}
              >
                Connect Wallet & Register Org
              </Link>
              <Link
                href="/organization?demo=true"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-body font-medium text-base transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f4f4f0',
                }}
              >
                View Live Demo →
              </Link>
              <button
                onClick={runProofDemo}
                disabled={proofDemo !== null && proofDemo !== 'done'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-body font-medium text-base transition-all"
                style={{
                  background: 'rgba(229,255,79,0.05)',
                  border: '1px solid rgba(229,255,79,0.18)',
                  color: '#e5ff4f',
                  cursor: proofDemo !== null && proofDemo !== 'done' ? 'default' : 'pointer',
                  opacity: proofDemo !== null && proofDemo !== 'done' ? 0.7 : 1,
                }}
              >
                {proofDemo === null ? 'Run Demo Proof →' : proofDemo === 'done' ? 'Run Again →' : 'Running…'}
              </button>
            </motion.div>

            {/* Inline proof demo panel */}
            <AnimatePresence>
              {proofDemo !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-xl p-5 relative"
                    style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(79,255,176,0.15)' }}
                  >
                    <button
                      onClick={() => { setProofDemo(null); setDemoProgress(0) }}
                      className="absolute top-3 right-3 font-mono text-xs px-2 py-0.5 rounded"
                      style={{ color: '#44444f', background: 'rgba(255,255,255,0.04)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>

                    <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#e5ff4f' }}>
                      DEMO PROOF — NO WALLET REQUIRED
                    </p>

                    <AnimatePresence mode="wait">
                      {proofDemo === 'computing' && (
                        <motion.div key="computing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {[
                              { k: 'DEMO ORG', v: 'DemoExchange' },
                              { k: 'ASSETS', v: '[HIDDEN]' },
                              { k: 'LIABILITIES', v: '[HIDDEN]' },
                              { k: 'WALLETS', v: '[HIDDEN]' },
                            ].map(d => (
                              <div key={d.k}>
                                <p className="font-mono text-xs mb-0.5" style={{ color: '#44444f' }}>{d.k}</p>
                                <p className="font-mono text-xs" style={{ color: d.v === '[HIDDEN]' ? '#44444f' : '#f4f4f0' }}>{d.v}</p>
                              </div>
                            ))}
                          </div>
                          <p className="font-mono text-xs mb-2" style={{ color: '#888896' }}>Computing ZK range proof…</p>
                          <div className="rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', height: 3 }}>
                            <div
                              className="h-full rounded-full transition-none"
                              style={{ width: `${demoProgress}%`, background: '#4fffb0', transition: 'width 16ms linear' }}
                            />
                          </div>
                        </motion.div>
                      )}

                      {proofDemo === 'submitting' && (
                        <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <p className="font-mono text-xs mb-1" style={{ color: '#4fffb0' }}>✓ Proof computation complete</p>
                          <p className="font-mono text-xs mb-2" style={{ color: '#888896' }}>Submitting to Aleo testnet…</p>
                          <div className="rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', height: 3 }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${demoProgress}%`, background: '#e5ff4f', transition: 'width 16ms linear' }}
                            />
                          </div>
                        </motion.div>
                      )}

                      {proofDemo === 'done' && (
                        <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                          <div className="flex items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-sm font-bold" style={{ color: '#4fffb0' }}>✓ PROOF VERIFIED</span>
                                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(229,255,79,0.08)', color: '#e5ff4f', border: '1px solid rgba(229,255,79,0.20)' }}>DEMO</span>
                              </div>
                              <TierBadge tier={3} size="lg" showName showRatio />
                              <div className="mt-3 space-y-1">
                                <p className="font-mono text-xs" style={{ color: '#888896' }}>Assets ≥ 2.0× Liabilities</p>
                                <p className="font-mono text-xs" style={{ color: '#44444f' }}>
                                  Commitment: <span style={{ color: '#888896' }}>at1demo...0000</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 flex gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <Link
                              href="/verifier"
                              className="font-mono text-xs"
                              style={{ color: '#4fffb0' }}
                            >
                              View full verifier →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating proof card — hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="float"
          >
            <div
              className="rounded-xl p-5 w-64"
              style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(79,255,176,0.20)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs" style={{ color: '#44444f' }}>SOLVENCY CERTIFICATE</span>
                <span className="font-mono text-xs" style={{ color: '#4fffb0' }}>✓ VERIFIED</span>
              </div>
              <div className="mb-3">
                <TierBadge tier={3} size="lg" showRatio />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-mono text-xs" style={{ color: '#888896' }}>Coverage</span>
                  <span className="font-mono text-xs" style={{ color: '#e5ff4f' }}>≥ 2.0×</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs" style={{ color: '#888896' }}>Standard</span>
                  <span className="font-mono text-xs" style={{ color: '#888896' }}>Solvency II SCR</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs" style={{ color: '#888896' }}>Amounts</span>
                  <span className="font-mono text-xs" style={{ color: '#4fffb0' }}>PRIVATE</span>
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-mono text-xs" style={{ color: '#44444f' }}>Block #15,613,711</p>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS BAR ───────────────────────────────────── */}
      <div style={{ background: '#0f0f18', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          {statsLoading ? (
            <div className="flex gap-8">
              {[1,2,3,4].map(i => <SkeletonLine key={i} width={120} height={4} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Organizations', value: <span ref={totalOrgsCounter.ref}>{totalOrgsCounter.value}</span>, suffix: '' },
                { label: 'Active Proofs', value: <span ref={activeProofsCounter.ref}>{activeProofsCounter.value}</span>, suffix: '' },
                { label: 'Current Block', value: fmt(liveBlock), suffix: '', mono: true },
                { label: 'Average Tier', value: stats?.averageTier ? `T${stats.averageTier.toFixed(1)}` : 'T2.0', suffix: '', mono: true },
              ].map((s, i) => (
                <div key={i}>
                  <p className="font-mono text-xs mb-1" style={{ color: '#44444f' }}>{s.label}</p>
                  <p className={`text-xl font-semibold ${s.mono ? 'font-mono' : 'font-body'}`} style={{ color: '#f4f4f0' }}>
                    {s.value}{s.suffix}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MECHANISM SECTION ────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="mb-16">
              <p className="font-mono text-xs tracking-widest mb-6" style={{ color: '#44444f' }}>THE PROTOCOL</p>
              <blockquote
                className="font-display text-xl md:text-2xl leading-relaxed max-w-4xl mb-12"
                style={{ color: '#f4f4f0', borderLeft: '2px solid #4fffb0', paddingLeft: '1.5rem' }}
              >
                "{SZABO_SENTENCE}"
                <footer className="font-body text-sm mt-3" style={{ color: '#888896' }}>
                  — Nick Szabo, 1993. First implemented onchain: VeritasZK, 2026.
                </footer>
              </blockquote>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'What you prove',
                desc: 'Assets exceed liabilities by a verified ratio — Standard, Verified, Strong, or Institutional tier.',
                accent: '#4fffb0',
              },
              {
                label: 'What you hide',
                desc: 'Exact amounts, wallet addresses, asset composition, treasury strategy — permanently private.',
                accent: '#e5ff4f',
              },
              {
                label: 'Who can verify',
                desc: 'Anyone, anywhere, with zero setup. No auditor. No trusted third party. The chain is the verifier.',
                accent: '#ffffff',
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className="rounded-xl p-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-8 h-px mb-4" style={{ background: item.accent }} />
                  <h3 className="font-display text-lg mb-3" style={{ color: '#f4f4f0' }}>{item.label}</h3>
                  <p className="text-sm leading-relaxed font-body" style={{ color: '#888896' }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVACY VISUALIZATION ────────────────────────────── */}
      <section className="py-16 md:py-24 overflow-hidden" style={{ background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>HOW PRIVACY WORKS</p>
              <h2 className="font-display text-3xl md:text-4xl" style={{ color: '#f4f4f0' }}>
                Data goes in. <span className="italic" style={{ color: '#4fffb0' }}>Only a tier comes out.</span>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="overflow-x-auto">
              <ZKDiagram />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── COMPARISON TABLE ─────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>COMPARISON</p>
            <h2 className="font-display text-3xl md:text-4xl mb-12" style={{ color: '#f4f4f0' }}>
              A different kind of proof.
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="text-left py-3 pr-6 font-mono text-xs" style={{ color: '#44444f', fontWeight: 400 }}>Feature</th>
                    {[
                      { name: 'VeritasZK', color: '#4fffb0' },
                      { name: 'Merkle PoR', color: '#888896' },
                      { name: 'Traditional Audit', color: '#888896' },
                    ].map(col => (
                      <th key={col.name} className="text-center py-3 px-4 font-body text-sm font-semibold" style={{ color: col.color }}>
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Reveals wallet addresses', '✗', '✓', '—'],
                    ['Reveals exact balances', '✗', '✓', '✓'],
                    ['Reveals asset composition', '✗', 'Partial', '✓'],
                    ['Cryptographic verification', '✓', '✓', '✗'],
                    ['Anyone can verify instantly', '✓', 'Partial', '✗'],
                    ['Requires external auditor', '✗', '✗', '✓'],
                    ['Real-time attestation', '✓', 'Delayed', '✗'],
                    ['Cost per attestation', 'Near zero', 'Infrastructure cost', '$50,000+'],
                  ].map(([feature, vzk, merkle, audit], i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="py-3 pr-6 text-sm font-body" style={{ color: '#888896' }}>{feature}</td>
                      <td className="py-3 px-4 text-center font-mono text-sm font-semibold" style={{ color: vzk === '✓' ? '#4fffb0' : vzk === '✗' ? '#ff4455' : '#888896' }}>{vzk}</td>
                      <td className="py-3 px-4 text-center font-mono text-sm" style={{ color: merkle === '✓' ? '#888896' : merkle === '✗' ? '#44444f' : '#888896' }}>{merkle}</td>
                      <td className="py-3 px-4 text-center font-mono text-sm" style={{ color: audit === '✓' ? '#888896' : audit === '✗' ? '#44444f' : '#888896' }}>{audit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 md:py-32" style={{ background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>PROCESS</p>
            <h2 className="font-display text-3xl md:text-4xl mb-16" style={{ color: '#f4f4f0' }}>
              Three steps to verifiable solvency.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Register Your Organization',
                body: 'Your organization registers an onchain identity via veritaszk_registry.aleo. Delegate authority to your compliance team. No financial data touches the chain.',
                program: 'veritaszk_registry.aleo',
              },
              {
                step: '02',
                title: 'Submit a Solvency Proof',
                body: 'Compute a ZK range proof over your private balance sheet. The proof reveals only that your assets exceed liabilities by a defined ratio — and nothing else. A cryptographic commitment is anchored to the Aleo blockchain.',
                program: 'veritaszk_threshold.aleo',
              },
              {
                step: '03',
                title: 'Receive a Tier Attestation',
                body: 'Counterparties, regulators, and auditors verify your tier — Standard, Verified, Strong, or Institutional — against the proof commitment. They confirm solvency without ever seeing your numbers.',
                program: 'veritaszk_audit.aleo',
              },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="relative">
                  <div
                    className="font-mono text-6xl font-bold mb-6 select-none"
                    style={{ color: 'rgba(79,255,176,0.06)' }}
                  >
                    {s.step}
                  </div>
                  <h3 className="font-display text-xl mb-3" style={{ color: '#f4f4f0' }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mb-4 font-body" style={{ color: '#888896' }}>{s.body}</p>
                  <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(79,255,176,0.06)', color: '#4fffb0', border: '1px solid rgba(79,255,176,0.12)' }}>
                    {s.program}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIER SYSTEM ──────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>TIER CLASSIFICATION</p>
            <h2 className="font-display text-3xl md:text-4xl mb-4" style={{ color: '#f4f4f0' }}>
              Four tiers. Four standards.
            </h2>
            <p className="text-base mb-16 font-body max-w-2xl" style={{ color: '#888896' }}>
              Each tier maps to an internationally recognized capital adequacy framework.
              Zero amounts disclosed at any tier.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIERS.map((tier, i) => (
              <FadeIn key={tier.tier} delay={i * 0.08}>
                <motion.div
                  className="rounded-xl p-6 h-full cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${tier.color}18`,
                  }}
                  whileHover={{
                    background: `rgba(255,255,255,0.04)`,
                    borderColor: `${tier.color}40`,
                    y: -4,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <TierBadge tier={tier.tier as 1|2|3|4} size="sm" showRatio />
                    <span className="font-mono text-xs" style={{ color: '#44444f' }}>T{tier.tier}</span>
                  </div>
                  <h3 className="font-display text-lg mb-2" style={{ color: tier.color }}>{tier.name}</h3>
                  <p className="font-mono text-xl font-bold mb-3" style={{ color: tier.color }}>{tier.label}</p>
                  <p className="text-sm leading-relaxed mb-4 font-body" style={{ color: '#888896' }}>{tier.description}</p>
                  <div className="pt-4" style={{ borderTop: `1px solid ${tier.color}12` }}>
                    <p className="font-mono text-xs" style={{ color: '#44444f' }}>{tier.regulatory}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PROOF ACTIVITY FEED ─────────────────────────── */}
      <section className="py-12 overflow-hidden" style={{ background: '#0a0a14', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <p className="font-mono text-xs tracking-widest" style={{ color: '#44444f' }}>
            LIVE PROOF ACTIVITY
            <span className="ml-3 inline-flex items-center gap-1.5" style={{ color: '#4fffb0' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#4fffb0' }} />
              live
            </span>
          </p>
        </div>
        <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
          <div className="ticker-track flex">
            {feedItems.map((p, i) => (
              <FeedItem key={i} proof={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SDK ECOSYSTEM ────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>DEVELOPER TOOLS</p>
            <h2 className="font-display text-3xl md:text-4xl mb-16" style={{ color: '#f4f4f0' }}>
              Integrate in minutes.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'veritaszk-sdk',
                version: '0.3.0',
                install: 'npm install veritaszk-sdk',
                desc: 'Verify solvency proofs, watch proof expiry, and batch-verify organizational attestations from any JavaScript environment.',
                fns: ['batchVerifyFromIndexer', 'watchProof', 'isProofExpiredFromIndexer'],
                href: 'https://www.npmjs.com/package/veritaszk-sdk',
              },
              {
                name: 'veritaszk-mcp',
                version: '0.2.0',
                install: 'npm install veritaszk-mcp',
                desc: 'MCP server for AI compliance monitoring. Drop into Claude Desktop to query solvency status from natural language.',
                fns: ['check_org_solvency', 'list_expiring_proofs'],
                href: 'https://www.npmjs.com/package/veritaszk-mcp',
              },
              {
                name: 'veritaszk-cli',
                version: '0.2.0',
                install: 'npm install -g veritaszk-cli',
                desc: 'Terminal-based proof verification. Ideal for CI pipelines, compliance scripts, and operator dashboards.',
                fns: ['verify', 'list', 'watch', 'stats'],
                href: 'https://www.npmjs.com/package/veritaszk-cli',
              },
            ].map((pkg, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className="rounded-xl p-6 h-full flex flex-col"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-sm font-medium" style={{ color: '#f4f4f0' }}>{pkg.name}</span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(79,255,176,0.08)', color: '#4fffb0', border: '1px solid rgba(79,255,176,0.15)' }}>
                      v{pkg.version}
                    </span>
                  </div>
                  <div className="mb-4 rounded p-2.5 font-mono text-xs overflow-x-auto" style={{ background: '#0a0a14', color: '#4fffb0', border: '1px solid rgba(255,255,255,0.06)' }}>
                    $ {pkg.install}
                  </div>
                  <p className="text-sm leading-relaxed mb-4 flex-1 font-body" style={{ color: '#888896' }}>{pkg.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pkg.fns.map(fn => (
                      <span key={fn} className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#888896', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {fn}
                      </span>
                    ))}
                  </div>
                  <a
                    href={pkg.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs transition-colors"
                    style={{ color: '#4fffb0' }}
                  >
                    npm ↗
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ALEO ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32" style={{ background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-4" style={{ color: '#44444f' }}>INFRASTRUCTURE</p>
            <h2 className="font-display text-3xl md:text-4xl mb-12" style={{ color: '#f4f4f0' }}>
              Why Aleo?
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'No off-chain proving required',
                body: 'ZK proofs execute in Leo transitions onchain. There is no external prover service, no trusted setup ceremony, no infrastructure to operate.',
              },
              {
                title: 'Programmable privacy by design',
                body: 'The threshold logic runs in a shielded execution environment. Asset inputs are private Records — they never appear in public chain state, not even in encrypted form.',
              },
              {
                title: 'Regulatory-ready auditability',
                body: 'veritaszk_audit.aleo creates a public-but-private audit trail: commitment hashes and tier outcomes are permanently onchain, while all financial figures remain off it.',
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 w-6 h-6 rounded flex items-center justify-center font-mono text-xs" style={{ background: 'rgba(79,255,176,0.08)', color: '#4fffb0', border: '1px solid rgba(79,255,176,0.15)' }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-base mb-2" style={{ color: '#f4f4f0' }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed font-body" style={{ color: '#888896' }}>{item.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest mb-12" style={{ color: '#44444f' }}>TRUST SIGNALS</p>
          </FadeIn>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mb-16">
            {TRUST_BADGES.map((badge, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div
                  className="px-4 py-2 rounded-full font-mono text-xs"
                  style={{ background: 'rgba(79,255,176,0.04)', border: '1px solid rgba(79,255,176,0.14)', color: '#4fffb0' }}
                >
                  ✓ {badge}
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Deployed programs */}
          <FadeIn delay={0.3}>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-6 py-4" style={{ background: '#0f0f18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="font-mono text-xs tracking-widest" style={{ color: '#44444f' }}>DEPLOYED PROGRAMS — ALEO TESTNET</p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {PROGRAMS.map(p => (
                  <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-2">
                    <div>
                      <span className="font-mono text-sm" style={{ color: '#4fffb0' }}>{p.id}</span>
                      <p className="font-mono text-xs mt-0.5" style={{ color: '#44444f' }}>{p.transitions.length} transitions</p>
                    </div>
                    <a
                      href={p.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs transition-colors hover:opacity-100 flex items-center gap-2"
                      style={{ color: '#888896' }}
                    >
                      <span className="hidden md:inline" style={{ color: '#44444f' }}>{p.txHash.slice(0, 16)}...</span>
                      View on Explorer ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#0a0a14' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="font-display text-4xl md:text-5xl mb-6" style={{ color: '#f4f4f0' }}>
              Start verifying solvency <br />
              <span className="italic" style={{ color: '#4fffb0' }}>in 3 minutes →</span>
            </h2>
            <p className="text-base mb-10 max-w-lg mx-auto font-body" style={{ color: '#888896' }}>
              Register your organization, submit a ZK range proof, and receive a tier attestation that anyone can verify — without revealing anything.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/organization"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-body font-semibold text-base transition-all"
                style={{ background: '#4fffb0', color: '#08080d' }}
              >
                Register Your Organization
              </Link>
              <Link
                href="/verifier"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-body font-medium text-base transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#f4f4f0' }}
              >
                Verify a Proof
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
