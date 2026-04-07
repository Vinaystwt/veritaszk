#!/usr/bin/env node
import { program } from 'commander'

const INDEXER_URL = process.env.VERITASZK_INDEXER_URL || 'http://localhost:3001'

const TIER_NAMES: Record<number, string> = {
  0: 'Not Set',
  1: 'Standard',
  2: 'Verified',
  3: 'Strong (Assets ≥ 2.0× Liabilities)',
  4: 'Institutional (Assets ≥ 3.0× Liabilities)',
}

const STATUS_ICONS: Record<number, string> = {
  0: '⬜ Not Set',
  1: '✅ SOLVENT',
  2: '⚠️  EXPIRED',
  3: '❌ REVOKED',
}

async function getIndexer(path: string) {
  const res = await fetch(`${INDEXER_URL}${path}`)
  if (!res.ok) {
    throw new Error(`Indexer error ${res.status} at ${INDEXER_URL}. Is it running? Set VERITASZK_INDEXER_URL env var if needed.`)
  }
  return res.json()
}

function formatBlocks(blocks: number): string {
  // ~1 block = ~30 seconds on Aleo testnet
  const seconds = blocks * 30
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `~${days}d ${hours}h`
  if (hours > 0) return `~${hours}h`
  return `~${Math.floor(seconds / 60)}m`
}

function shorten(s: string): string {
  return s.length > 12 ? `${s.slice(0, 4)}...${s.slice(-4)}` : s
}

program
  .name('veritaszk')
  .description('Query VeritasZK zero-knowledge solvency proofs')
  .version('0.2.0')

program
  .command('verify <commitment>')
  .description('Check solvency status of an organization')
  .action(async (commitment: string) => {
    try {
      const p = await getIndexer(`/api/proofs/${commitment}`)
      console.log('VeritasZK Solvency Check')
      console.log('─'.repeat(44))
      console.log(`Organization: ${shorten(p.commitment)}`)
      console.log(`Status:       ${STATUS_ICONS[p.proofStatus] ?? '❓ Unknown'}`)
      console.log(`Tier:         ${p.tier} — ${TIER_NAMES[p.tier] ?? 'Unknown'}`)
      console.log(`Attested:     Block ${p.timestamp.toLocaleString()}`)
      console.log(`Expires:      Block ${p.expiry.toLocaleString()} (${formatBlocks(p.expiry - p.timestamp)})`)
      console.log(`Verifications: ${p.verificationCount}`)
      console.log('─'.repeat(44))
      console.log('Network: Aleo Testnet | veritaszk_core.aleo')
    } catch (e: any) {
      console.error(e.message)
    }
  })

program
  .command('list')
  .description('Show all tracked organizations and their status')
  .action(async () => {
    try {
      const proofs = await getIndexer('/api/proofs')
      if (proofs.length === 0) {
        console.log('No organizations tracked yet.')
        console.log('Add one with: curl -X POST $INDEXER/api/proofs/register -d \'{"commitment":"..."}\'')
        return
      }
      console.log('VeritasZK — Tracked Organizations')
      console.log('─'.repeat(80))
      console.log(`${'Commitment'.padEnd(18)}  ${'Status'.padEnd(12)} ${'Tier'.padEnd(12)} ${'Expiry'.padEnd(18)} Verifications`)
      console.log('─'.repeat(80))
      for (const p of proofs) {
        console.log(
          `${shorten(p.commitment).padEnd(18)}  ` +
          `${(p.isSolvent ? '✅ Solvent' : p.isExpired ? '⚠️  Expired' : '⬜ None').padEnd(12)} ` +
          `${(`T${p.tier} — ${TIER_NAMES[p.tier]?.split(' ')[0] ?? '?'}`).padEnd(12)} ` +
          `${(p.expiry > 0 ? formatBlocks(p.expiry - p.timestamp) : 'no expiry').padEnd(18)} ` +
          `${p.verificationCount}`
        )
      }
      console.log('─'.repeat(80))
    } catch (e: any) {
      console.error(e.message)
    }
  })

program
  .command('proof <commitment>')
  .description('Get full proof metadata from Aleo explorer')
  .option('-f, --format <fmt>', 'Output format: json or table', 'table')
  .action(async (commitment: string, opts) => {
    console.log('Fetching from Aleo explorer...')
    console.log(`Commitment: ${commitment}`)
    console.log(`Indexer status:`, await getIndexer(`/api/proofs/${commitment}`).catch(() => 'unavailable'))
  })

program
  .command('watch <commitment>')
  .description('Poll solvency status every 30 seconds')
  .action(async (commitment: string) => {
    console.log(`Watching ${shorten(commitment)} (Ctrl+C to stop)`)
    console.log('─'.repeat(44))
    let lastStatus: string | null = null
    const poll = async () => {
      try {
        const p = await getIndexer(`/api/proofs/${commitment}`)
        const ts = new Date()
        const timeStr = ts.toTimeString().slice(0, 8)
        const statusLine = `${STATUS_ICONS[p.proofStatus] ?? '?'} | Tier ${p.tier} — ${TIER_NAMES[p.tier] ?? '?'} | Expires in ${p.expiry > 0 ? formatBlocks(p.expiry - p.timestamp) : 'no expiry'}`
        if (lastStatus === null || statusLine !== lastStatus) {
          console.log(`[${timeStr}] ${statusLine}`)
        }
        lastStatus = statusLine
      } catch {
        // silently ignore
      }
    }
    await poll()
    setInterval(poll, 30000)
  })

program
  .command('stats')
  .description('Show VeritasZK protocol statistics')
  .action(async () => {
    try {
      const s = await getIndexer('/api/stats')
      console.log('VeritasZK Protocol Stats')
      console.log('━'.repeat(32))
      console.log(`Total Organizations:  ${s.totalOrgs}`)
      console.log(`Active Proofs:        ${s.activeProofs}`)
      console.log(`Expired Proofs:       ${s.expiredProofs}`)
      console.log(`Revoked Proofs:       ${s.revokedProofs}`)
      console.log(`Total Verifications:  ${s.totalVerifications}`)
      console.log(`Last Indexed Block:   ${s.lastIndexedBlock.toLocaleString()}`)
    } catch (e: any) {
      console.error(e.message)
    }
  })

program.parse()
