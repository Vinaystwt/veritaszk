const EXPLORER = 'https://api.explorer.provable.com/v1/testnet'

export const PROGRAMS = {
  REGISTRY: 'veritaszk_registry.aleo',
  CORE: 'veritaszk_core.aleo',
  AUDIT: 'veritaszk_audit.aleo',
} as const

export interface SolvencyStatus {
  orgCommitment: string
  isSolvent: boolean
  timestamp: number | null
  expiryBlock: number | null
  verificationCount: number
  thresholdLevel: number
  hasMultiWallet: boolean
  isExpired: boolean
  lastProofBlock: number | null
}

export interface AuditEvent {
  orgCommitment: string
  eventCount: number
  lastProofBlock: number | null
  isExpired: boolean
}

export interface BatchVerifyResult {
  orgCommitment: string
  isSolvent: boolean
  error?: string
}

async function queryMapping(
  program: string,
  mapping: string,
  key: string
): Promise<any> {
  const url = `${EXPLORER}/program/${program}/mapping/${mapping}/${key}`
  const res = await fetch(url)
  if (!res.ok) return null
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

function parseU32(val: any): number | null {
  if (val === null || val === undefined) return null
  return Number(String(val).replace('u32', '').trim())
}

function parseU8(val: any): number {
  if (val === null || val === undefined) return 0
  return Number(String(val).replace('u8', '').trim())
}

export async function verifySolvency(
  orgCommitment: string
): Promise<SolvencyStatus> {
  const [solvent, timestamp, expiry, count, threshold, multiWallet] =
    await Promise.all([
      queryMapping(PROGRAMS.CORE, 'solvency_proofs', orgCommitment),
      queryMapping(PROGRAMS.CORE, 'proof_timestamps', orgCommitment),
      queryMapping(PROGRAMS.CORE, 'proof_expiry', orgCommitment),
      queryMapping(PROGRAMS.CORE, 'verification_counts', orgCommitment),
      queryMapping(PROGRAMS.CORE, 'threshold_proofs', orgCommitment),
      queryMapping(PROGRAMS.CORE, 'multi_wallet_commitments', orgCommitment),
    ])
  const expiryBlock = parseU32(expiry)
  const ts = parseU32(timestamp)
  return {
    orgCommitment,
    isSolvent: solvent === true || solvent === 'true',
    timestamp: ts,
    expiryBlock,
    verificationCount: parseU32(count) ?? 0,
    thresholdLevel: parseU8(threshold),
    hasMultiWallet: multiWallet !== null,
    isExpired: expiryBlock !== null && expiryBlock > 0 &&
      (parseU32(timestamp) ?? 0) > expiryBlock,
    lastProofBlock: ts,
  }
}

export async function batchVerify(
  orgCommitments: string[]
): Promise<BatchVerifyResult[]> {
  const results = await Promise.allSettled(
    orgCommitments.map(c => verifySolvency(c))
  )
  return results.map((r, i) => {
    if (r.status === 'fulfilled') {
      return { orgCommitment: orgCommitments[i],
               isSolvent: r.value.isSolvent }
    }
    return { orgCommitment: orgCommitments[i], isSolvent: false,
             error: (r.reason as Error)?.message ?? 'Query failed' }
  })
}

export async function getAuditTrail(
  orgCommitment: string
): Promise<AuditEvent> {
  const [count, lastBlock, expired] = await Promise.all([
    queryMapping(PROGRAMS.AUDIT, 'event_count', orgCommitment),
    queryMapping(PROGRAMS.AUDIT, 'last_proof_block', orgCommitment),
    queryMapping(PROGRAMS.AUDIT, 'expired_proofs', orgCommitment),
  ])
  return {
    orgCommitment,
    eventCount: parseU32(count) ?? 0,
    lastProofBlock: parseU32(lastBlock),
    isExpired: expired === true || expired === 'true',
  }
}

export async function isRegistered(
  orgCommitment: string
): Promise<boolean> {
  const result = await queryMapping(
    PROGRAMS.REGISTRY, 'org_registry', orgCommitment
  )
  return result === true || result === 'true'
}

export async function getVerificationCount(
  orgCommitment: string
): Promise<number> {
  const result = await queryMapping(
    PROGRAMS.CORE, 'verification_counts', orgCommitment
  )
  return parseU32(result) ?? 0
}

export async function isProofExpired(
  orgCommitment: string
): Promise<boolean> {
  const [expiry, timestamp] = await Promise.all([
    queryMapping(PROGRAMS.CORE, 'proof_expiry', orgCommitment),
    queryMapping(PROGRAMS.CORE, 'proof_timestamps', orgCommitment),
  ])
  const expiryBlock = parseU32(expiry)
  const ts = parseU32(timestamp)
  if (!expiryBlock || !ts) return false
  return expiryBlock > 0 && ts > expiryBlock
}
