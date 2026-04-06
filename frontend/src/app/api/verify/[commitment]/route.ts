import { NextRequest, NextResponse } from 'next/server'

const EXPLORER = 'https://api.explorer.provable.com/v1/testnet'
const CORE = 'veritaszk_core.aleo'
const AUDIT = 'veritaszk_audit.aleo'

async function q(program: string, mapping: string, key: string) {
  const res = await fetch(
    `${EXPLORER}/program/${program}/mapping/${mapping}/${key}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return null
  try { return await res.json() } catch { return null }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ commitment: string }> }
) {
  const { commitment } = await params
  try {
    const [solvent, timestamp, expiry, count, threshold,
           auditCount, lastBlock] = await Promise.all([
      q(CORE, 'solvency_proofs', commitment),
      q(CORE, 'proof_timestamps', commitment),
      q(CORE, 'proof_expiry', commitment),
      q(CORE, 'verification_counts', commitment),
      q(CORE, 'threshold_proofs', commitment),
      q(AUDIT, 'event_count', commitment),
      q(AUDIT, 'last_proof_block', commitment),
    ])
    return NextResponse.json({
      org_commitment: commitment,
      is_solvent: solvent === true || solvent === 'true',
      timestamp: timestamp ?? null,
      expiry_block: expiry ?? null,
      verification_count: count ?? 0,
      threshold_level: threshold ?? 0,
      audit_event_count: auditCount ?? 0,
      last_proof_block: lastBlock ?? null,
      network: 'testnet',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to query solvency status' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
}
