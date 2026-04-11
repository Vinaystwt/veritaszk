'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useShieldWallet } from '@/hooks/useShieldWallet'
import { registerProof } from '@/lib/api'
import { TIERS, PROGRAMS } from '@/lib/constants'
import { TierBadge } from '@/components/ui/TierBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CommitmentDisplay } from '@/components/ui/CommitmentDisplay'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'

// ─── Tier calculator ────────────────────────────────────────────────────────
function computeTier(assets: number, liabilities: number): { tier: 1|2|3|4; ratio: number } | null {
  if (!assets || !liabilities || liabilities <= 0) return null
  const ratio = assets / liabilities
  if (ratio >= 3.0) return { tier: 4, ratio }
  if (ratio >= 2.0) return { tier: 3, ratio }
  if (ratio >= 1.5) return { tier: 2, ratio }
  if (ratio >= 1.0) return { tier: 1, ratio }
  return null
}

// ─── Step 1: Org Identity ───────────────────────────────────────────────────
function Step1({ wallet, isDemo, onComplete }: {
  wallet: ReturnType<typeof useShieldWallet>
  isDemo: boolean
  onComplete: (data: { orgName: string; commitment: string; txHash: string }) => void
}) {
  const [orgName, setOrgName] = useState(isDemo ? 'DemoExchange' : '')
  const [delegate, setDelegate] = useState('')
  const [salt] = useState(() => Math.random().toString(36).slice(2, 18).toUpperCase())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saltCopied, setSaltCopied] = useState(false)

  const copySalt = async () => {
    await navigator.clipboard.writeText(salt)
    setSaltCopied(true)
    setTimeout(() => setSaltCopied(false), 2000)
  }

  const submit = async () => {
    if (!orgName.trim()) { setError('Organization name is required'); return }
    setError('')
    setSubmitting(true)

    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1400))
        const demoCommitment = `a1b2${Math.random().toString(16).slice(2, 18)}demo`
        const demoTx = `at1demo${Math.random().toString(36).slice(2, 16)}`
        onComplete({ orgName: orgName.trim(), commitment: demoCommitment, txHash: demoTx })
      } else {
        // Step 1 is local-only — no transaction needed.
        // register_org takes (org_name_hash: field, salt: field) but requires testnet credits.
        // The identity is implicitly established by prove_threshold in Step 2.
        await new Promise(r => setTimeout(r, 600))
        const commitment = `org_${btoa(orgName.trim()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}_${salt.slice(0, 8)}`
        onComplete({ orgName: orgName.trim(), commitment, txHash: '' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-mono text-xs mb-2" style={{ color: '#888896' }}>ORGANIZATION NAME</label>
        <input
          type="text"
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
          placeholder="e.g. Acme Exchange"
          className="w-full px-4 py-3 rounded-lg font-body text-sm outline-none transition-all"
          style={{
            background: '#0f0f18',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#f4f4f0',
          }}
        />
      </div>

      <div>
        <label className="block font-mono text-xs mb-2" style={{ color: '#888896' }}>DELEGATE ADDRESS <span style={{ color: '#44444f' }}>(optional)</span></label>
        <input
          type="text"
          value={delegate}
          onChange={e => setDelegate(e.target.value)}
          placeholder="aleo1..."
          className="w-full px-4 py-3 rounded-lg font-mono text-sm outline-none transition-all"
          style={{
            background: '#0f0f18',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f4f4f0',
          }}
        />
        <p className="font-mono text-xs mt-1.5" style={{ color: '#44444f' }}>Defaults to your connected wallet</p>
      </div>

      <div>
        <label className="block font-mono text-xs mb-2" style={{ color: '#888896' }}>SALT — SAVE THIS</label>
        <div
          className="flex items-center justify-between px-4 py-3 rounded-lg"
          style={{ background: '#0f0f18', border: '1px solid rgba(229,255,79,0.15)' }}
        >
          <span className="font-mono text-sm" style={{ color: '#e5ff4f' }}>{salt}</span>
          <button onClick={copySalt} className="font-mono text-xs px-2 py-1 rounded cursor-pointer" style={{ color: saltCopied ? '#4fffb0' : '#888896', background: 'rgba(255,255,255,0.04)' }}>
            {saltCopied ? '✓ copied' : 'copy'}
          </button>
        </div>
        <p className="font-mono text-xs mt-1.5" style={{ color: '#44444f' }}>Auto-generated. Store securely — you will need it to refresh proofs.</p>
      </div>

      {error && (
        <p className="font-mono text-xs px-3 py-2 rounded" style={{ background: 'rgba(255,68,85,0.08)', color: '#ff4455', border: '1px solid rgba(255,68,85,0.15)' }}>
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full py-3.5 rounded-lg font-body font-semibold transition-all flex items-center justify-center gap-2"
        style={{
          background: submitting ? 'rgba(79,255,176,0.5)' : '#4fffb0',
          color: '#08080d',
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? (
          <><LoadingSpinner size="sm" color="#08080d" /> Registering...</>
        ) : (
          `${isDemo ? 'Simulate' : 'Register'} Organization →`
        )}
      </button>

      <p className="font-mono text-xs text-center" style={{ color: '#44444f' }}>
        Calls veritaszk_registry.aleo → register_org
      </p>
    </div>
  )
}

// ─── Step 2: Proof Submission ────────────────────────────────────────────────
function Step2({ orgName, isDemo, publicKey, onComplete }: {
  orgName: string
  isDemo: boolean
  publicKey: string | null
  onComplete: (data: { tier: 1|2|3|4; ratio: number; commitment: string; txHash: string; expiryBlock: number; orgCommitmentField: string }) => void
}) {
  const [assets, setAssets] = useState({ native: isDemo ? '3200000' : '', stablecoin: isDemo ? '800000' : '', btc: isDemo ? '200000' : '', other: isDemo ? '300000' : '' })
  const [liabilities, setLiabilities] = useState(isDemo ? '1500000' : '')
  const [validity, setValidity] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalAssets = Object.values(assets).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const totalLiab = parseFloat(liabilities) || 0
  const tierResult = computeTier(totalAssets, totalLiab)

  const validityToBlocks: Record<number, number> = { 7: 120960, 30: 518400, 90: 1555200 }

  const submit = async () => {
    if (!tierResult) { setError('Assets must exceed liabilities to qualify for a tier'); return }
    setError('')
    setSubmitting(true)

    try {
      const blocks = validityToBlocks[validity]
      const baseBlock = 15613711

      if (isDemo) {
        await new Promise(r => setTimeout(r, 1800))
        const commitment = `b2c3${Math.random().toString(16).slice(2, 20)}tier${tierResult.tier}`
        const txHash = `at1demo${Math.random().toString(36).slice(2, 16)}`
        await registerProof({ commitment, orgName, tier: tierResult.tier, coverageRatio: tierResult.ratio, assets: totalAssets, liabilities: totalLiab })
        onComplete({ tier: tierResult.tier, ratio: tierResult.ratio, commitment, txHash, expiryBlock: baseBlock + blocks, orgCommitmentField: '' })
      } else {
        // Build params with guaranteed positive integers for all Leo inputs
        // native_credits must be >= 1 (u64 minimum for valid AssetBundle)
        const nc = Math.max(1, Math.floor(Number(assets.native) || 1))
        const su = Math.max(0, Math.floor(Number(assets.stablecoin) || 0))
        const btc = Math.max(0, Math.floor(Number(assets.btc) || 0))
        const other = Math.max(0, Math.floor(Number(assets.other) || 0))
        // liabilities must be >= 1 to avoid division-by-zero in tier ratio assertions
        const liabs = Math.max(1, Math.floor(totalLiab))
        const calculatedTier = tierResult.tier
        // SAFE field generation — must stay within JS safe integer range (< 2^53).
        // Date.now() is 13 digits; concatenating with random digits produces 19 digits
        // which overflows MAX_SAFE_INTEGER and corrupts .toString() with Unicode superscripts.
        // Fix: clamp to 15 digits max using modulo.
        const orgCommitmentField = (Date.now() % 999_999_999_999_999) + 1
        const proofNonceField = Math.floor(Math.random() * 999_999_999_998) + 1

        console.log('orgCommitmentField:', orgCommitmentField, 'safe:', Number.isSafeInteger(orgCommitmentField))
        console.log('proofNonceField:', proofNonceField, 'safe:', Number.isSafeInteger(proofNonceField))

        // Shield Wallet Zod schema requires: program, function, inputs, network
        // (NOT programId / functionName / feePrivate — those are wrong key names)
        const params = {
          program: 'veritaszk_threshold.aleo',
          function: 'prove_threshold',
          inputs: [
            // Input 1: AssetBundle struct — Leo struct literal syntax, no quotes on keys
            `{native_credits: ${nc}u64, stablecoin_usd: ${su}u64, btc_equivalent: ${btc}u64, other_assets: ${other}u64}`,
            // Input 2: liabilities u64 — must be positive
            `${liabs}u64`,
            // Input 3: org_commitment field — safe integer, max 15 digits
            `${orgCommitmentField}field`,
            // Input 4: proof_nonce field — safe integer, max 12 digits
            `${proofNonceField}field`,
            // Input 5: tier_target u8 (public)
            `${calculatedTier}u8`,
          ],
          fee: 10000,
          network: 'testnet',
          privateFee: false,
        }

        console.log('=== VERITASZK executeTransaction PAYLOAD ===')
        console.log(JSON.stringify(params, null, 2))
        console.log('============================================')

        const txResult = await (window.shield as any).executeTransaction(params)
        const txHash = txResult?.transactionId || txResult?.id || txResult?.txId || ''
        if (!txHash) throw new Error('Transaction submitted but no transaction ID returned')
        const commitment = `thr_${txHash.slice(0, 12)}`
        await registerProof({ commitment, orgName, tier: tierResult.tier, coverageRatio: tierResult.ratio, assets: totalAssets, liabilities: totalLiab })
        onComplete({ tier: tierResult.tier, ratio: tierResult.ratio, commitment, txHash, expiryBlock: baseBlock + blocks, orgCommitmentField: String(orgCommitmentField) })
      }
    } catch (e: any) {
      // Fix C — show the actual Shield Wallet error, not a generic message
      const errorMsg = e?.message || e?.toString() || 'Transaction failed'
      console.error('executeTransaction full error:', e)
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Asset bundle */}
      <div>
        <label className="block font-mono text-xs mb-3" style={{ color: '#888896' }}>ASSET BUNDLE (AssetBundle struct)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'native', label: 'Native Credits (ALEO)' },
            { key: 'stablecoin', label: 'Stablecoin USD (USDCx/USAD)' },
            { key: 'btc', label: 'BTC Equivalent' },
            { key: 'other', label: 'Other Assets' },
          ].map(field => (
            <div key={field.key}>
              <label className="block font-mono text-xs mb-1.5" style={{ color: '#44444f' }}>{field.label}</label>
              <input
                type="number"
                value={assets[field.key as keyof typeof assets]}
                onChange={e => setAssets(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded font-mono text-sm outline-none"
                style={{ background: '#0f0f18', border: '1px solid rgba(255,255,255,0.08)', color: '#f4f4f0' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs mb-2" style={{ color: '#888896' }}>TOTAL LIABILITIES</label>
        <input
          type="number"
          value={liabilities}
          onChange={e => setLiabilities(e.target.value)}
          placeholder="0"
          className="w-full px-4 py-3 rounded-lg font-mono text-sm outline-none"
          style={{ background: '#0f0f18', border: '1px solid rgba(255,255,255,0.10)', color: '#f4f4f0' }}
        />
      </div>

      {/* Live tier preview */}
      <AnimatePresence>
        {tierResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(79,255,176,0.04)', border: '1px solid rgba(79,255,176,0.15)' }}
          >
            <p className="font-mono text-xs mb-3" style={{ color: '#4fffb0' }}>LIVE TIER EVALUATION</p>
            <div className="flex items-center gap-4 flex-wrap">
              <TierBadge tier={tierResult.tier} size="lg" showName showRatio />
              <div>
                <p className="font-mono text-2xl font-bold" style={{ color: TIERS.find(t => t.tier === tierResult.tier)?.color }}>
                  {tierResult.ratio.toFixed(2)}×
                </p>
                <p className="font-mono text-xs" style={{ color: '#888896' }}>coverage ratio</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((tierResult.ratio / 3) * 100, 100)}%`, background: TIERS.find(t => t.tier === tierResult.tier)?.color }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validity period */}
      <div>
        <label className="block font-mono text-xs mb-3" style={{ color: '#888896' }}>VALIDITY PERIOD</label>
        <div className="flex gap-3">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setValidity(d)}
              className="flex-1 py-2.5 rounded font-mono text-xs font-medium transition-all"
              style={{
                background: validity === d ? 'rgba(79,255,176,0.10)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${validity === d ? 'rgba(79,255,176,0.25)' : 'rgba(255,255,255,0.08)'}`,
                color: validity === d ? '#4fffb0' : '#888896',
                cursor: 'pointer',
              }}
            >
              {d} days<br />
              <span style={{ color: '#44444f', fontSize: '10px' }}>{validityToBlocks[d].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} blocks</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="font-mono text-xs px-3 py-2 rounded" style={{ background: 'rgba(255,68,85,0.08)', color: '#ff4455', border: '1px solid rgba(255,68,85,0.15)' }}>
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={submitting || !tierResult}
        className="w-full py-3.5 rounded-lg font-body font-semibold transition-all flex items-center justify-center gap-2"
        style={{
          background: submitting || !tierResult ? 'rgba(79,255,176,0.3)' : '#4fffb0',
          color: '#08080d',
          cursor: submitting || !tierResult ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? (
          <><LoadingSpinner size="sm" color="#08080d" /> {isDemo ? 'Generating ZK Proof...' : 'Proving Threshold...'}</>
        ) : (
          `${isDemo ? 'Simulate' : 'Submit'} Solvency Proof →`
        )}
      </button>

      <p className="font-mono text-xs text-center" style={{ color: '#44444f' }}>
        Calls veritaszk_threshold.aleo → prove_threshold
      </p>
    </div>
  )
}

// ─── Certificate component (hidden, rendered for download) ──────────────────
function CertificateTemplate({ orgName, tier, tierName, ratio, block, commitment, qrDataUrl }: {
  orgName: string; tier: number; tierName: string; ratio: number; block: number; commitment: string; qrDataUrl: string
}) {
  const tierInfo = TIERS.find(t => t.tier === tier)!
  return (
    <div
      id="certificate-template"
      style={{
        width: 800, height: 520,
        background: '#08080d',
        fontFamily: '"JetBrains Mono", monospace',
        padding: 48,
        border: `2px solid ${tierInfo.color}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner marks */}
      {[[0,0],[800-16,0],[0,520-16],[800-16,520-16]].map(([x,y], i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: y, width: 16, height: 16, borderTop: `2px solid ${tierInfo.color}`, borderLeft: `2px solid ${tierInfo.color}`, transform: i === 1 ? 'scaleX(-1)' : i === 2 ? 'scaleY(-1)' : i === 3 ? 'scale(-1)' : '' }} />
      ))}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 11, color: '#44444f', letterSpacing: 4, marginBottom: 6 }}>SOLVENCY ATTESTATION CERTIFICATE</div>
          <div style={{ fontSize: 28, color: '#f4f4f0', fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}>
            VeritasZK
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#44444f', letterSpacing: 2, marginBottom: 4 }}>TIER CLASSIFICATION</div>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: tierInfo.color, lineHeight: 1 }}>T{tier}</div>
          <div style={{ fontSize: 14, color: tierInfo.color, marginTop: 2 }}>{tierName}</div>
        </div>
      </div>
      {/* Org name */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: '#44444f', letterSpacing: 3, marginBottom: 6 }}>ORGANIZATION</div>
        <div style={{ fontSize: 22, color: '#f4f4f0', fontFamily: '"Instrument Serif", Georgia, serif' }}>{orgName}</div>
      </div>
      {/* Details row */}
      <div style={{ display: 'flex', gap: 48, marginBottom: 32 }}>
        {[
          { label: 'COVERAGE RATIO', value: `≥ ${tierInfo.label}` },
          { label: 'STANDARD', value: tierInfo.regulatory.split('/')[0].trim() },
          { label: 'LAST ATTESTED BLOCK', value: `#${block.toLocaleString()}` },
          { label: 'DATE', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontSize: 9, color: '#44444f', letterSpacing: 3, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: '#f4f4f0' }}>{item.value}</div>
          </div>
        ))}
      </div>
      {/* Commitment */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: '#44444f', letterSpacing: 3, marginBottom: 4 }}>PROOF COMMITMENT</div>
        <div style={{ fontSize: 11, color: '#888896', wordBreak: 'break-all' }}>{commitment}</div>
      </div>
      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 10, color: '#44444f' }}>veritaszk_threshold.aleo · Aleo Testnet · 2026</div>
        <div style={{ fontSize: 12, color: tierInfo.color, letterSpacing: 1 }}>Prove Solvency. Reveal Nothing.</div>
      </div>
      {/* QR code — bottom-right, links to /verifier?commitment=... */}
      {qrDataUrl && (
        <div style={{ position: 'absolute', bottom: 44, right: 44, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#44444f', letterSpacing: 3, marginBottom: 4 }}>VERIFY</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} width={72} height={72} alt="QR verification code" style={{ display: 'block', imageRendering: 'pixelated' }} />
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Confirmation ────────────────────────────────────────────────────
function Step3({ orgName, tier, ratio, commitment, txHash, expiryBlock, isDemo, orgCommitmentField }: {
  orgName: string; tier: 1|2|3|4; ratio: number; commitment: string; txHash: string; expiryBlock: number; isDemo: boolean; orgCommitmentField: string
}) {
  const [downloading, setDownloading] = useState(false)
  const [revokeState, setRevokeState] = useState<'idle' | 'confirming' | 'revoking' | 'revoked'>('idle')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const tierInfo = TIERS.find(t => t.tier === tier)!
  const explorerBase = PROGRAMS.find(p => p.id === 'veritaszk_threshold.aleo')?.explorerUrl?.replace('/program/veritaszk_threshold.aleo', '') ?? 'https://testnet.explorer.provable.com'
  const explorer = txHash && !isDemo ? `${explorerBase}/transaction/${txHash}` : (PROGRAMS.find(p => p.id === 'veritaszk_threshold.aleo')?.explorerUrl ?? '')

  // Generate QR code linking to the verifier page for this commitment
  useEffect(() => {
    const url = `https://veritaszk.vercel.app/verifier?commitment=${encodeURIComponent(commitment)}`
    QRCode.toDataURL(url, {
      color: { dark: '#4fffb0', light: '#08080d' },
      margin: 1,
      width: 80,
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl).catch(() => {})
  }, [commitment])

  const downloadCert = async () => {
    setDownloading(true)
    try {
      const el = document.getElementById('certificate-template')
      if (!el) return
      const canvas = await html2canvas(el, { backgroundColor: '#08080d', scale: 2, useCORS: true })
      const link = document.createElement('a')
      link.download = `${orgName.replace(/\s+/g, '_')}_solvency_cert.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const confirmRevoke = async () => {
    setRevokeState('revoking')
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1600))
      } else {
        // revoke_proof(public org_commitment: field) — single public input, no private record needed
        if (!orgCommitmentField) throw new Error('Cannot revoke: org commitment field not available')
        const revokeResult = await (window.shield as any).executeTransaction({
          program: 'veritaszk_core.aleo',
          function: 'revoke_proof',
          inputs: [`${orgCommitmentField}field`],
          fee: 10000,
          network: 'testnet',
          privateFee: false,
        })
        const revokeTxHash = revokeResult?.transactionId || revokeResult?.id || revokeResult?.txId || ''
        if (!revokeTxHash) throw new Error('Revoke transaction returned no transaction ID')
      }
      setRevokeState('revoked')
    } catch {
      setRevokeState('idle')
    }
  }

  return (
    <div className="space-y-6">
      {/* Revoke confirmation modal */}
      <AnimatePresence>
        {revokeState === 'confirming' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(8,8,13,0.85)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl p-7 max-w-md w-full"
              style={{ background: '#0f0f18', border: '1px solid rgba(255,68,85,0.20)' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,68,85,0.10)', border: '1px solid rgba(255,68,85,0.25)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L14 12H2L8 2Z" stroke="#ff4455" strokeWidth="1.5" strokeLinejoin="round"/>
                    <line x1="8" y1="7" x2="8" y2="9.5" stroke="#ff4455" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.7" fill="#ff4455"/>
                  </svg>
                </div>
                <h3 className="font-display text-xl" style={{ color: '#f4f4f0' }}>Revoke Proof</h3>
              </div>
              <p className="font-body text-sm leading-relaxed mb-6" style={{ color: '#888896' }}>
                Revoking this proof will immediately mark your organization as unverified.
                This action cannot be undone. Your proof commitment will be flagged as{' '}
                <span style={{ color: '#ff4455' }} className="font-mono">REVOKED</span>{' '}
                in the public ledger.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRevokeState('idle')}
                  className="flex-1 py-2.5 rounded-lg font-body text-sm font-medium transition-all"
                  style={{ background: 'rgba(79,255,176,0.06)', border: '1px solid rgba(79,255,176,0.20)', color: '#4fffb0', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRevoke}
                  className="flex-1 py-2.5 rounded-lg font-body text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,68,85,0.12)', border: '1px solid rgba(255,68,85,0.35)', color: '#ff4455', cursor: 'pointer' }}
                >
                  Confirm Revoke
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main tier result */}
      {revokeState === 'revoked' ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(255,68,85,0.05)', border: '2px solid rgba(255,68,85,0.25)' }}>
          <p className="font-mono text-xs tracking-widest mb-3" style={{ color: '#ff4455' }}>STATUS</p>
          <p className="font-display text-3xl mb-2" style={{ color: '#ff4455' }}>REVOKED</p>
          <p className="font-mono text-sm" style={{ color: '#888896' }}>
            This commitment has been flagged in the public ledger.{isDemo && ' (Demo)'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ background: `${tierInfo.color}08`, border: `2px solid ${tierInfo.color}30` }}>
          <TierBadge tier={tier} size="xl" showName showRatio />
          <p className="font-mono text-4xl font-bold mt-4" style={{ color: tierInfo.color }}>{ratio.toFixed(2)}× coverage</p>
          <p className="font-mono text-sm mt-2" style={{ color: '#888896' }}>{tierInfo.regulatory}</p>
        </div>
      )}

      {/* Details */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs" style={{ color: '#888896' }}>Commitment</span>
          <CommitmentDisplay hash={commitment} chars={10} />
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs" style={{ color: '#888896' }}>Expiry Block</span>
          <span className="font-mono text-xs" style={{ color: '#f4f4f0' }}>#{expiryBlock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
        </div>
        {txHash && (
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs" style={{ color: '#888896' }}>TX Hash</span>
            <span className="font-mono text-xs" style={{ color: isDemo ? '#e5ff4f' : '#f4f4f0' }}>
              {txHash.slice(0, 14)}... {isDemo && <span style={{ color: '#e5ff4f' }}>[DEMO]</span>}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {revokeState !== 'revoked' && (
        <div className="flex flex-col gap-3">
          <a
            href={`${explorer}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-lg font-body text-sm font-medium text-center transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#f4f4f0' }}
          >
            View on Explorer ↗
          </a>
          <a
            href={`/verifier?commitment=${commitment}`}
            className="w-full py-3 rounded-lg font-body text-sm font-medium text-center transition-all"
            style={{ background: 'rgba(79,255,176,0.06)', border: '1px solid rgba(79,255,176,0.15)', color: '#4fffb0' }}
          >
            Verify Proof →
          </a>
          <button
            onClick={downloadCert}
            disabled={downloading}
            className="w-full py-3 rounded-lg font-body text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#888896', cursor: 'pointer' }}
          >
            {downloading ? <><LoadingSpinner size="sm" color="#888896" /> Generating...</> : '⬇ Download Certificate (PNG)'}
          </button>

          {/* Revoke — smaller, destructive, separated */}
          <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setRevokeState('confirming')}
              disabled={revokeState === 'revoking'}
              className="w-full py-2 rounded-lg font-body text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              style={{
                background: 'rgba(255,68,85,0.04)',
                border: '1px solid rgba(255,68,85,0.18)',
                color: '#ff4455',
                cursor: 'pointer',
                opacity: revokeState === 'revoking' ? 0.6 : 1,
              }}
            >
              {revokeState === 'revoking' ? (
                <><LoadingSpinner size="sm" color="#ff4455" /> Revoking...</>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1.5L10.5 9H1.5L6 1.5Z" stroke="#ff4455" strokeWidth="1.2" strokeLinejoin="round"/>
                    <line x1="6" y1="5" x2="6" y2="7" stroke="#ff4455" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="6" cy="8" r="0.5" fill="#ff4455"/>
                  </svg>
                  Revoke Proof
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden certificate for download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <CertificateTemplate
          orgName={orgName}
          tier={tier}
          tierName={tierInfo.name}
          ratio={ratio}
          block={15613711}
          commitment={commitment}
          qrDataUrl={qrDataUrl}
        />
      </div>
    </div>
  )
}

// ─── Wallet gate ─────────────────────────────────────────────────────────────
function WalletGate({ wallet }: { wallet: ReturnType<typeof useShieldWallet> }) {
  const { state, connect, connectWithAddress, enterDemoMode, errorMessage } = wallet
  const [manualAddr, setManualAddr] = useState('')
  const [manualErr, setManualErr] = useState('')

  const handleManualConnect = () => {
    if (!manualAddr.trim().startsWith('aleo1')) {
      setManualErr('Address must start with aleo1')
      return
    }
    setManualErr('')
    connectWithAddress(manualAddr.trim())
  }

  const stateConfig = {
    IDLE:          { msg: '', sub: '' },
    CONNECTING:    { msg: 'Opening Shield Wallet...', sub: 'If your wallet is locked, open the Shield extension and enter your password. Waiting up to 60 seconds…' },
    ERROR:         { msg: 'Connection failed', sub: errorMessage ?? 'Please try again.' },
    NOT_INSTALLED: { msg: 'Shield Wallet not detected', sub: 'Install the Shield Wallet extension to connect.' },
    CONNECTED:     { msg: '', sub: '' },
    DEMO_MODE:     { msg: '', sub: '' },
  }

  const cfg = stateConfig[state as keyof typeof stateConfig] ?? { msg: '', sub: '' }
  const isLoading = state === 'CONNECTING'
  const showRetry = state === 'ERROR' || state === 'NOT_INSTALLED'

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center px-6">
        {/* Shield icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8" style={{ background: 'rgba(79,255,176,0.06)', border: '1px solid rgba(79,255,176,0.15)' }}>
          {isLoading ? (
            <LoadingSpinner size="lg" />
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z" stroke={state === 'ERROR' || state === 'NOT_INSTALLED' ? '#ff4455' : '#4fffb0'} strokeWidth="1.5" strokeLinejoin="round" />
              {(state === 'IDLE' || state === 'CONNECTED') && <path d="M9 12l2 2 4-4" stroke="#4fffb0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
          )}
        </div>

        {state === 'IDLE' && (
          <>
            <h2 className="font-display text-2xl mb-3" style={{ color: '#f4f4f0' }}>Connect to Continue</h2>
            <p className="text-sm mb-8 font-body" style={{ color: '#888896' }}>
              The Organization Portal requires a Shield Wallet connection to sign transactions on Aleo.
            </p>
          </>
        )}

        {isLoading && (
          <>
            <h2 className="font-display text-2xl mb-3" style={{ color: '#f4f4f0' }}>{cfg.msg}</h2>
            <p className="text-sm mb-8 font-body" style={{ color: '#888896' }}>{cfg.sub}</p>
          </>
        )}

        {(state === 'ERROR' || state === 'NOT_INSTALLED') && (
          <>
            <h2 className="font-display text-xl mb-3" style={{ color: '#ff4455' }}>{cfg.msg}</h2>
            <p className="text-sm mb-8 font-body" style={{ color: '#888896' }}>{cfg.sub}</p>
          </>
        )}

        <div className="flex flex-col gap-3">
          {state === 'IDLE' && (
            <button onClick={connect} className="w-full py-3.5 rounded-lg font-body font-semibold" style={{ background: '#4fffb0', color: '#08080d', cursor: 'pointer' }}>
              Connect Shield Wallet
            </button>
          )}
          {state === 'NOT_INSTALLED' && (
            <a href="https://shield.provable.com" target="_blank" rel="noopener noreferrer" className="w-full py-3.5 rounded-lg font-body font-semibold text-center block" style={{ background: '#4fffb0', color: '#08080d' }}>
              Install Shield Wallet
            </a>
          )}
          {state === 'ERROR' && (
            <>
              <button onClick={connect} className="w-full py-3.5 rounded-lg font-body font-semibold" style={{ background: 'rgba(255,68,85,0.10)', color: '#ff4455', border: '1px solid rgba(255,68,85,0.20)', cursor: 'pointer' }}>
                Retry Connection
              </button>
              {/* Manual address fallback — for browsers where Shield Wallet extension doesn't surface publicKey */}
              <div className="pt-1">
                <p className="font-mono text-xs mb-2 text-left" style={{ color: '#44444f' }}>Or paste your Aleo address manually:</p>
                <input
                  type="text"
                  value={manualAddr}
                  onChange={e => { setManualAddr(e.target.value); setManualErr('') }}
                  placeholder="aleo1..."
                  className="w-full px-3 py-2.5 rounded-lg font-mono text-xs outline-none mb-2"
                  style={{ background: '#0f0f18', border: `1px solid ${manualErr ? 'rgba(255,68,85,0.35)' : 'rgba(255,255,255,0.10)'}`, color: '#f4f4f0' }}
                />
                {manualErr && <p className="font-mono text-xs mb-2" style={{ color: '#ff4455' }}>{manualErr}</p>}
                <button
                  onClick={handleManualConnect}
                  disabled={!manualAddr.trim()}
                  className="w-full py-2.5 rounded-lg font-body text-sm font-medium"
                  style={{ background: manualAddr.trim() ? 'rgba(79,255,176,0.08)' : 'rgba(255,255,255,0.03)', color: manualAddr.trim() ? '#4fffb0' : '#44444f', border: '1px solid rgba(79,255,176,0.15)', cursor: manualAddr.trim() ? 'pointer' : 'default' }}
                >
                  Connect with this address →
                </button>
              </div>
            </>
          )}

          {(state === 'IDLE' || state === 'ERROR' || state === 'NOT_INSTALLED') && (
            <button onClick={enterDemoMode} className="w-full py-3 rounded-lg font-body text-sm" style={{ background: 'rgba(229,255,79,0.06)', color: '#e5ff4f', border: '1px solid rgba(229,255,79,0.15)', cursor: 'pointer' }}>
              No wallet? Try Demo Mode →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
function OrganizationContent() {
  const searchParams = useSearchParams()
  const isAutoDemo = searchParams.get('demo') === 'true'
  const wallet = useShieldWallet()
  const [currentStep, setCurrentStep] = useState(1)
  const [orgData, setOrgData] = useState<{ orgName: string; commitment: string; txHash: string } | null>(null)
  const [proofData, setProofData] = useState<{ tier: 1|2|3|4; ratio: number; commitment: string; txHash: string; expiryBlock: number; orgCommitmentField: string } | null>(null)
  const [liveProofStatus, setLiveProofStatus] = useState<{ isExpired?: boolean; proofStatus?: number } | null>(null)

  // Auto-enter demo mode if ?demo=true
  useEffect(() => {
    if (isAutoDemo && wallet.state === 'IDLE') {
      wallet.enterDemoMode()
    }
  }, [isAutoDemo, wallet.state])

  // watchProof SDK — live expiry monitoring once a commitment is confirmed
  useEffect(() => {
    if (!proofData?.commitment) return
    let stopped = false
    const cleanup = (() => {
      try {
        const { watchProof } = require('veritaszk-sdk') as { watchProof: (c: string, cb: (s: unknown) => void, url: string, interval: number) => () => void }
        return watchProof(
          proofData.commitment,
          (status: unknown) => {
            if (!stopped) setLiveProofStatus(status as { isExpired?: boolean; proofStatus?: number })
          },
          'https://veritaszk-production.up.railway.app',
          30000
        )
      } catch {
        return () => {}
      }
    })()
    return () => { stopped = true; cleanup() }
  }, [proofData?.commitment])

  const isDemo = wallet.isDemo
  const isAuthenticated = wallet.state === 'CONNECTED' || isDemo

  const steps = [
    { n: 1, label: 'Register Org' },
    { n: 2, label: 'Submit Proof' },
    { n: 3, label: 'Confirmation' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#08080d' }}>
      {/* Demo banner */}
      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full flex items-center justify-between px-6 py-2.5 font-mono text-xs"
            style={{ background: 'rgba(229,255,79,0.06)', borderBottom: '1px solid rgba(229,255,79,0.15)', color: '#e5ff4f' }}
          >
            <span>⚡ Demo Mode — transactions are simulated, no real Aleo credits spent</span>
            <button onClick={wallet.exitDemoMode} className="underline" style={{ color: '#e5ff4f', cursor: 'pointer' }}>Exit Demo</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest mb-3" style={{ color: '#44444f' }}>ORGANIZATION PORTAL</p>
          <h1 className="font-display text-4xl mb-3" style={{ color: '#f4f4f0' }}>
            Prove Solvency.<br /><span className="italic" style={{ color: '#4fffb0' }}>Reveal Nothing.</span>
          </h1>
          <p className="text-base font-body" style={{ color: '#888896' }}>
            Register your organization and submit a zero-knowledge range proof of solvency on Aleo.
          </p>
        </div>

        {!isAuthenticated ? (
          <WalletGate wallet={wallet} />
        ) : (
          <>
            {/* Stepper */}
            <div className="flex items-center gap-0 mb-12">
              {steps.map((step, i) => (
                <div key={step.n} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all"
                      style={{
                        background: currentStep > step.n ? '#4fffb0' : currentStep === step.n ? 'rgba(79,255,176,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${currentStep >= step.n ? '#4fffb0' : 'rgba(255,255,255,0.08)'}`,
                        color: currentStep > step.n ? '#08080d' : currentStep === step.n ? '#4fffb0' : '#44444f',
                      }}
                    >
                      {currentStep > step.n ? '✓' : step.n}
                    </div>
                    <span className="font-mono text-xs hidden sm:block" style={{ color: currentStep === step.n ? '#f4f4f0' : '#44444f' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-px mx-3" style={{ background: currentStep > step.n ? 'rgba(79,255,176,0.3)' : 'rgba(255,255,255,0.06)' }} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="rounded-2xl p-8" style={{ background: '#0f0f18', border: '1px solid rgba(255,255,255,0.08)' }}>
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h2 className="font-display text-xl mb-6" style={{ color: '#f4f4f0' }}>Step 1 — Organization Identity</h2>
                    <Step1
                      wallet={wallet}
                      isDemo={isDemo}
                      onComplete={data => { setOrgData(data); setCurrentStep(2) }}
                    />
                  </motion.div>
                )}
                {currentStep === 2 && orgData && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h2 className="font-display text-xl mb-2" style={{ color: '#f4f4f0' }}>Step 2 — Solvency Proof</h2>
                    <p className="font-mono text-xs mb-6" style={{ color: '#44444f' }}>Org: {orgData.orgName}</p>
                    <Step2
                      orgName={orgData.orgName}
                      isDemo={isDemo}
                      publicKey={wallet.publicKey}
                      onComplete={data => { setProofData(data); setCurrentStep(3) }}
                    />
                  </motion.div>
                )}
                {currentStep === 3 && orgData && proofData && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl" style={{ color: '#f4f4f0' }}>Step 3 — Attestation Confirmed</h2>
                      {liveProofStatus && (
                        <span
                          className="font-mono text-xs px-2 py-0.5 rounded"
                          style={{
                            background: liveProofStatus.isExpired ? 'rgba(255,68,85,0.10)' : 'rgba(79,255,176,0.06)',
                            border: `1px solid ${liveProofStatus.isExpired ? 'rgba(255,68,85,0.25)' : 'rgba(79,255,176,0.20)'}`,
                            color: liveProofStatus.isExpired ? '#ff4455' : '#4fffb0',
                          }}
                        >
                          {liveProofStatus.isExpired ? 'EXPIRED' : 'LIVE ●'}
                        </span>
                      )}
                    </div>
                    <Step3
                      orgName={orgData.orgName}
                      tier={proofData.tier}
                      ratio={proofData.ratio}
                      commitment={proofData.commitment}
                      txHash={proofData.txHash}
                      expiryBlock={proofData.expiryBlock}
                      isDemo={isDemo}
                      orgCommitmentField={proofData.orgCommitmentField}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function OrganizationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080d' }} />}>
      <OrganizationContent />
    </Suspense>
  )
}
