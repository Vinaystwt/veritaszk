#!/usr/bin/env node
import { program } from 'commander'

const EXPLORER = 'https://api.explorer.provable.com/v1/testnet'
const CORE = 'veritaszk_core.aleo'
const AUDIT = 'veritaszk_audit.aleo'

async function q(prog: string, mapping: string, key: string) {
  const res = await fetch(
    `${EXPLORER}/program/${prog}/mapping/${mapping}/${key}`
  )
  if (!res.ok) return null
  try { return await res.json() } catch { return null }
}

function parseU32(val: any): number | null {
  if (!val) return null
  return Number(String(val).replace('u32', '').trim())
}

program
  .name('veritaszk')
  .description('Query VeritasZK zero-knowledge solvency proofs')
  .version('0.1.0')

program
  .command('verify <commitment>')
  .description('Check solvency status of an organization')
  .action(async (commitment: string) => {
    console.log('Querying Aleo testnet...\n')
    const [solvent, timestamp, expiry, count, threshold] =
      await Promise.all([
        q(CORE, 'solvency_proofs', commitment),
        q(CORE, 'proof_timestamps', commitment),
        q(CORE, 'proof_expiry', commitment),
        q(CORE, 'verification_counts', commitment),
        q(CORE, 'threshold_proofs', commitment),
      ])
    const isSolvent = solvent === true || solvent === 'true'
    const thresholdLabels: Record<number, string> = {
      0: 'not set', 1: 'basic', 2: '100% buffer', 3: '200% buffer'
    }
    const tLevel = threshold
      ? Number(String(threshold).replace('u8', '')) : 0
    console.log('VeritasZK Solvency Check')
    console.log('─'.repeat(44))
    console.log(`Organization: ${commitment}`)
    console.log(`Status:       ${isSolvent ? '✓ SOLVENT' : '✗ NOT SOLVENT'}`)
    console.log(`Proven at:    block ${parseU32(timestamp) ?? 'unknown'}`)
    console.log(`Expires at:   block ${parseU32(expiry) ?? 'no expiry'}`)
    console.log(`Verified by:  ${parseU32(count) ?? 0} parties`)
    console.log(`Threshold:    ${thresholdLabels[tLevel] ?? 'unknown'}`)
    console.log('─'.repeat(44))
    console.log('Network: Aleo Testnet | veritaszk_core.aleo')
  })

program
  .command('list')
  .description('Show protocol info and how to find verified orgs')
  .option('-l, --limit <n>', 'Max results', '10')
  .action(() => {
    console.log('VeritasZK — Zero-Knowledge Solvency Protocol')
    console.log('─'.repeat(44))
    console.log('Dashboard:  https://veritaszk.vercel.app')
    console.log('Registry:   veritaszk_registry.aleo')
    console.log('Core:       veritaszk_core.aleo')
    console.log('Audit:      veritaszk_audit.aleo')
    console.log('npm SDK:    npm install veritaszk-sdk')
    console.log('MCP:        npx veritaszk-mcp')
    console.log('')
    console.log('Use: veritaszk verify <commitment> to check any org')
  })

program
  .command('proof <commitment>')
  .description('Get full proof metadata for an organization')
  .option('-f, --format <fmt>', 'Output format: json or table', 'table')
  .action(async (commitment: string, opts) => {
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
    const data = {
      org_commitment: commitment,
      is_solvent: solvent === true || solvent === 'true',
      proof_timestamp_block: parseU32(timestamp),
      expiry_block: parseU32(expiry),
      verification_count: parseU32(count) ?? 0,
      threshold_level: threshold
        ? Number(String(threshold).replace('u8', '')) : 0,
      audit_event_count: parseU32(auditCount) ?? 0,
      last_proof_block: parseU32(lastBlock),
      network: 'testnet',
    }
    if (opts.format === 'json') {
      console.log(JSON.stringify(data, null, 2))
    } else {
      Object.entries(data).forEach(([k, v]) =>
        console.log(`${k.padEnd(26)} ${v}`)
      )
    }
  })

program
  .command('watch <commitment>')
  .description('Poll solvency status every 30 seconds')
  .action(async (commitment: string) => {
    console.log(`Watching: ${commitment}`)
    console.log('Polling every 30s. Ctrl+C to stop.\n')
    let lastSolvent: boolean | null = null
    let lastCount = 0
    const poll = async () => {
      const [solvent, count] = await Promise.all([
        q(CORE, 'solvency_proofs', commitment),
        q(CORE, 'verification_counts', commitment),
      ])
      const isSolvent = solvent === true || solvent === 'true'
      const verCount = parseU32(count) ?? 0
      const changed = lastSolvent !== null &&
        (lastSolvent !== isSolvent || lastCount !== verCount)
      const ts = new Date().toISOString()
      console.log(
        `[${ts}] ${isSolvent ? '✓ SOLVENT' : '✗ NOT SOLVENT'}` +
        ` | verifications: ${verCount}` +
        (changed ? ' ← CHANGED' : '')
      )
      lastSolvent = isSolvent
      lastCount = verCount
    }
    await poll()
    setInterval(poll, 30000)
  })

program.parse()
