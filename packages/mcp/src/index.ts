#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const EXPLORER = 'https://api.explorer.provable.com/v1/testnet'
const CORE = 'veritaszk_core.aleo'
const AUDIT = 'veritaszk_audit.aleo'
const REGISTRY = 'veritaszk_registry.aleo'

async function q(program: string, mapping: string, key: string) {
  const res = await fetch(
    `${EXPLORER}/program/${program}/mapping/${mapping}/${key}`
  )
  if (!res.ok) return null
  try { return await res.json() } catch { return null }
}

async function queryIndexer(path: string, indexerUrl?: string) {
  const base = indexerUrl ?? process.env.VERITASZK_INDEXER_URL
  if (!base) return null
  const res = await fetch(`${base}${path}`)
  if (!res.ok) return null
  try { return await res.json() } catch { return null }
}

const server = new Server(
  { name: 'veritaszk-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'check_solvency',
      description: 'Check if an organization has a valid zero-knowledge solvency proof on Aleo via VeritasZK',
      inputSchema: { type: 'object',
        properties: { org_commitment: { type: 'string',
          description: 'Organization commitment field' } },
        required: ['org_commitment'] },
    },
    {
      name: 'get_proof_details',
      description: 'Get full solvency proof metadata including timestamp, expiry, threshold level, verification count',
      inputSchema: { type: 'object',
        properties: { org_commitment: { type: 'string' } },
        required: ['org_commitment'] },
    },
    {
      name: 'get_audit_trail',
      description: 'Get proof event audit trail for an organization from the VeritasZK audit program',
      inputSchema: { type: 'object',
        properties: { org_commitment: { type: 'string' } },
        required: ['org_commitment'] },
    },
    {
      name: 'list_verified_orgs',
      description: 'Get VeritasZK protocol info and how to find verified organizations on the public dashboard',
      inputSchema: { type: 'object',
        properties: { limit: { type: 'number' } } },
    },
    {
      name: 'request_verification',
      description: 'Get the command to trigger on-chain verification count increment for an organization',
      inputSchema: { type: 'object',
        properties: { org_commitment: { type: 'string' } },
        required: ['org_commitment'] },
    },
    {
      name: 'check_org_solvency',
      description: 'Check the solvency status and confidence tier of an organization via the VeritasZK REST API indexer',
      inputSchema: { type: 'object',
        properties: {
          commitment_or_name: { type: 'string', description: 'Organization commitment hash or registered name' },
          indexer_url: { type: 'string', description: 'Optional indexer URL (defaults to VERITASZK_INDEXER_URL env)' }
        },
        required: ['commitment_or_name'] },
    },
    {
      name: 'list_expiring_proofs',
      description: 'List organizations whose solvency proofs expire within a given block window',
      inputSchema: { type: 'object',
        properties: {
          within_blocks: { type: 'number', description: 'Number of blocks until expiry to check against' },
          indexer_url: { type: 'string', description: 'Optional indexer URL (defaults to VERITASZK_INDEXER_URL env)' }
        },
        required: ['within_blocks'] },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'check_solvency') {
    const c = args?.org_commitment as string
    const [solvent, expiry, count] = await Promise.all([
      q(CORE, 'solvency_proofs', c),
      q(CORE, 'proof_expiry', c),
      q(CORE, 'verification_counts', c),
    ])
    const isSolvent = solvent === true || solvent === 'true'
    const expiryBlock = expiry
      ? Number(String(expiry).replace('u32', '')) : null
    const verCount = count
      ? Number(String(count).replace('u32', '')) : 0
    return { content: [{ type: 'text', text: [
      'VeritasZK Solvency Check',
      `Organization: ${c}`,
      `Status:       ${isSolvent ? '✓ SOLVENT' : '✗ NOT SOLVENT'}`,
      `Verified by:  ${verCount} parties`,
      `Expires at:   block ${expiryBlock ?? 'no expiry set'}`,
      'Network: Aleo Testnet',
    ].join('\n') }] }
  }

  if (name === 'get_proof_details') {
    const c = args?.org_commitment as string
    const [solvent, timestamp, expiry, count, threshold] =
      await Promise.all([
        q(CORE, 'solvency_proofs', c),
        q(CORE, 'proof_timestamps', c),
        q(CORE, 'proof_expiry', c),
        q(CORE, 'verification_counts', c),
        q(CORE, 'threshold_proofs', c),
      ])
    return { content: [{ type: 'text',
      text: JSON.stringify({ org_commitment: c,
        is_solvent: solvent === true || solvent === 'true',
        proof_timestamp_block: timestamp, expiry_block: expiry,
        verification_count: count, threshold_level: threshold,
        network: 'testnet' }, null, 2) }] }
  }

  if (name === 'get_audit_trail') {
    const c = args?.org_commitment as string
    const [count, lastBlock, expired] = await Promise.all([
      q(AUDIT, 'event_count', c),
      q(AUDIT, 'last_proof_block', c),
      q(AUDIT, 'expired_proofs', c),
    ])
    return { content: [{ type: 'text',
      text: JSON.stringify({ org_commitment: c,
        total_proof_events: count, last_proof_block: lastBlock,
        is_expired: expired, audit_program: AUDIT }, null, 2) }] }
  }

  if (name === 'list_verified_orgs') {
    return { content: [{ type: 'text', text: [
      'VeritasZK — Zero-Knowledge Solvency Proofs on Aleo',
      '',
      'Public dashboard: https://veritaszk.vercel.app',
      '',
      'Deployed programs (Aleo Testnet):',
      `  Registry: ${REGISTRY}`,
      `  Core:     ${CORE}`,
      `  Audit:    ${AUDIT}`,
      '',
      'Use check_solvency with an org_commitment to verify',
      'any organization in real time.',
    ].join('\n') }] }
  }

  if (name === 'request_verification') {
    const c = args?.org_commitment as string
    return { content: [{ type: 'text', text: [
      'To trigger on-chain verification, run:',
      '',
      `leo execute verify_solvency ${c} \\`,
      '  --network testnet \\',
      '  --private-key YOUR_PRIVATE_KEY \\',
      '  --broadcast',
      '',
      `Program: ${CORE}`,
      'This increments the on-chain verification count.',
    ].join('\n') }] }
  }

  if (name === 'check_org_solvency') {
    const c = args?.commitment_or_name as string
    const idxUrl = args?.indexer_url as string | undefined
    const data = await queryIndexer(`/api/proofs/${c}`, idxUrl)
    if (!data) {
      return { content: [{ type: 'text', text:
        `Could not fetch solvency data for ${c}. Is the indexer running?` }] }
    }
    const tierNames: Record<number, string> = {
      0: 'Not Set', 1: 'Standard', 2: 'Verified', 3: 'Strong', 4: 'Institutional'
    }
    return { content: [{ type: 'text', text: JSON.stringify({
      commitment: data.commitment,
      isSolvent: data.isSolvent,
      tier: data.tier,
      tierName: tierNames[data.tier] ?? 'Unknown',
      proofStatus: data.proofStatus,
      expiry: data.expiry,
      isExpired: data.isExpired,
      verificationCount: data.verificationCount,
    }, null, 2) }] }
  }

  if (name === 'list_expiring_proofs') {
    const withinBlocks = args?.within_blocks as number
    const idxUrl = args?.indexer_url as string | undefined
    const all = await queryIndexer('/api/proofs', idxUrl)
    if (!all || !Array.isArray(all)) {
      return { content: [{ type: 'text', text:
        'Could not fetch proof list. Is the indexer running?' }] }
    }
    // We need current block — approximate from the data or use a heuristic
    const tierNames: Record<number, string> = {
      0: 'Not Set', 1: 'Standard', 2: 'Verified', 3: 'Strong', 4: 'Institutional'
    }
    const expiring = all
      .filter((p: any) => p.expiry > 0 && !p.isExpired)
      .map((p: any) => ({
        commitment: p.commitment,
        expiry: p.expiry,
        blocksRemaining: p.expiry - (p.timestamp || 0),
        tierName: tierNames[p.tier] ?? 'Unknown',
      }))
      .filter((p: any) => p.blocksRemaining <= withinBlocks)
    return { content: [{ type: 'text', text: JSON.stringify(expiring, null, 2) }] }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
