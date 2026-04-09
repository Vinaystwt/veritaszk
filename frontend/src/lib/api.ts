import { RAILWAY_BASE, DEMO_ORGS, SEED_KEY } from './constants'

export interface ProofRecord {
  commitment: string
  orgName: string
  tier: 1 | 2 | 3 | 4
  tierName: string
  status: 'active' | 'expired' | 'revoked'
  coverageRatio: number
  issuedBlock?: number
  expiryBlock?: number
  issuedAt?: string
  expiresAt?: string
  verificationCount: number
  expiringsSoon?: boolean
  auditId?: string
}

export interface StatsResponse {
  totalOrgs: number
  activeProofs: number
  expiredProofs: number
  revokedProofs: number
  currentBlock?: number
}

export interface TierDistribution {
  tier1: number
  tier2: number
  tier3: number
  tier4: number
  averageTier: number
}

export interface HealthResponse {
  status: string
  lastIndexedBlock: number
  uptime: number
  programs: string[]
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${RAILWAY_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

export async function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/health')
}

export async function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/api/stats')
}

export async function getProofs(): Promise<ProofRecord[]> {
  return apiFetch<ProofRecord[]>('/api/proofs')
}

export async function getProof(commitment: string): Promise<ProofRecord> {
  return apiFetch<ProofRecord>(`/api/proofs/${commitment}`)
}

export async function getTiers(): Promise<TierDistribution> {
  return apiFetch<TierDistribution>('/api/tiers')
}

export async function registerProof(payload: {
  commitment: string
  orgName: string
  tier: number
  assets?: number
  liabilities?: number
  coverageRatio?: number
}): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/api/proofs/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Seeds demo orgs if /api/proofs returns empty.
 * Uses localStorage to avoid repeating on every page load.
 * Safe to call from multiple pages — idempotent.
 */
export async function seedDemoOrgsIfEmpty(): Promise<void> {
  if (typeof window === 'undefined') return

  // Check if already seeded this session
  if (localStorage.getItem(SEED_KEY)) return

  try {
    const proofs = await getProofs()
    if (proofs && proofs.length > 0) {
      localStorage.setItem(SEED_KEY, '1')
      return
    }

    // Empty — seed all 4 demo orgs in parallel
    await Promise.allSettled(
      DEMO_ORGS.map(org =>
        registerProof({
          commitment: org.commitment,
          orgName: org.orgName,
          tier: org.tier,
          assets: org.assets,
          liabilities: org.liabilities,
          coverageRatio: org.coverageRatio,
        })
      )
    )

    localStorage.setItem(SEED_KEY, '1')
  } catch {
    // Silently fail — demo orgs may already be in the API
  }
}

/** Normalize raw API records — fills missing fields with defaults */
export function normalizeProof(raw: Partial<ProofRecord>): ProofRecord {
  const tier = (raw.tier ?? 1) as 1 | 2 | 3 | 4
  const tierNames: Record<number, string> = { 1: 'Standard', 2: 'Verified', 3: 'Strong', 4: 'Institutional' }
  return {
    commitment: raw.commitment ?? '',
    orgName: raw.orgName ?? 'Unknown Org',
    tier,
    tierName: raw.tierName ?? tierNames[tier],
    status: raw.status ?? 'active',
    coverageRatio: raw.coverageRatio ?? 1.0,
    issuedBlock: raw.issuedBlock,
    expiryBlock: raw.expiryBlock,
    issuedAt: raw.issuedAt,
    expiresAt: raw.expiresAt,
    verificationCount: raw.verificationCount ?? 0,
    expiringsSoon: raw.expiringsSoon ?? false,
    auditId: raw.auditId,
  }
}

export function truncateCommitment(hash: string, chars = 8): string {
  if (!hash || hash.length <= chars * 2 + 3) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return 'recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  return `${days} day${days === 1 ? '' : 's'} ago`
}
