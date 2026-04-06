#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
const EXPLORER = 'https://api.explorer.provable.com/v1/testnet';
const CORE = 'veritaszk_core.aleo';
const AUDIT = 'veritaszk_audit.aleo';
const REGISTRY = 'veritaszk_registry.aleo';
async function q(program, mapping, key) {
    const res = await fetch(`${EXPLORER}/program/${program}/mapping/${mapping}/${key}`);
    if (!res.ok)
        return null;
    try {
        return await res.json();
    }
    catch {
        return null;
    }
}
const server = new Server({ name: 'veritaszk-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });
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
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === 'check_solvency') {
        const c = args?.org_commitment;
        const [solvent, expiry, count] = await Promise.all([
            q(CORE, 'solvency_proofs', c),
            q(CORE, 'proof_expiry', c),
            q(CORE, 'verification_counts', c),
        ]);
        const isSolvent = solvent === true || solvent === 'true';
        const expiryBlock = expiry
            ? Number(String(expiry).replace('u32', '')) : null;
        const verCount = count
            ? Number(String(count).replace('u32', '')) : 0;
        return { content: [{ type: 'text', text: [
                        'VeritasZK Solvency Check',
                        `Organization: ${c}`,
                        `Status:       ${isSolvent ? '✓ SOLVENT' : '✗ NOT SOLVENT'}`,
                        `Verified by:  ${verCount} parties`,
                        `Expires at:   block ${expiryBlock ?? 'no expiry set'}`,
                        'Network: Aleo Testnet',
                    ].join('\n') }] };
    }
    if (name === 'get_proof_details') {
        const c = args?.org_commitment;
        const [solvent, timestamp, expiry, count, threshold] = await Promise.all([
            q(CORE, 'solvency_proofs', c),
            q(CORE, 'proof_timestamps', c),
            q(CORE, 'proof_expiry', c),
            q(CORE, 'verification_counts', c),
            q(CORE, 'threshold_proofs', c),
        ]);
        return { content: [{ type: 'text',
                    text: JSON.stringify({ org_commitment: c,
                        is_solvent: solvent === true || solvent === 'true',
                        proof_timestamp_block: timestamp, expiry_block: expiry,
                        verification_count: count, threshold_level: threshold,
                        network: 'testnet' }, null, 2) }] };
    }
    if (name === 'get_audit_trail') {
        const c = args?.org_commitment;
        const [count, lastBlock, expired] = await Promise.all([
            q(AUDIT, 'event_count', c),
            q(AUDIT, 'last_proof_block', c),
            q(AUDIT, 'expired_proofs', c),
        ]);
        return { content: [{ type: 'text',
                    text: JSON.stringify({ org_commitment: c,
                        total_proof_events: count, last_proof_block: lastBlock,
                        is_expired: expired, audit_program: AUDIT }, null, 2) }] };
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
                    ].join('\n') }] };
    }
    if (name === 'request_verification') {
        const c = args?.org_commitment;
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
                    ].join('\n') }] };
    }
    throw new Error(`Unknown tool: ${name}`);
});
const transport = new StdioServerTransport();
await server.connect(transport);
