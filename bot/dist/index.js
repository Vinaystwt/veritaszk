import express from 'express';
const EXPLORER = 'https://api.explorer.provable.com/v1/testnet';
const CORE = 'veritaszk_core.aleo';
const PORT = process.env.PORT ?? 3001;
const POLL_MS = 10 * 60 * 1000;
const HEARTBEAT_MS = 60 * 60 * 1000;
const MONITORED_ORGS = [
    'aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00',
];
const orgStatuses = new Map();
let lastPollTime = 'never';
let lastHeartbeatTime = 'never';
let totalPolls = 0;
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
function parseU32(val) {
    if (!val)
        return null;
    return Number(String(val).replace('u32', '').trim());
}
async function getCurrentBlock() {
    try {
        const res = await fetch(`${EXPLORER}/block/height/latest`);
        return Number(await res.json()) || 0;
    }
    catch {
        return 0;
    }
}
function getState(isSolvent, expiry, current) {
    if (!isSolvent)
        return 'NO_PROOF';
    if (!expiry || expiry === 0)
        return 'ACTIVE';
    if (current > expiry)
        return 'EXPIRED';
    if (expiry - current < 1000)
        return 'EXPIRING';
    return 'ACTIVE';
}
async function pollOrgs() {
    totalPolls++;
    lastPollTime = new Date().toISOString();
    const currentBlock = await getCurrentBlock();
    for (const commitment of MONITORED_ORGS) {
        try {
            const [solvent, expiry, count] = await Promise.all([
                q(CORE, 'solvency_proofs', commitment),
                q(CORE, 'proof_expiry', commitment),
                q(CORE, 'verification_counts', commitment),
            ]);
            const isSolvent = solvent === true || solvent === 'true';
            const expiryBlock = parseU32(expiry);
            const state = getState(isSolvent, expiryBlock, currentBlock);
            orgStatuses.set(commitment, {
                commitment, state, isSolvent, expiryBlock,
                lastChecked: new Date().toISOString(),
                verificationCount: parseU32(count) ?? 0,
            });
            console.log(`[${new Date().toISOString()}] ` +
                `${commitment.slice(0, 16)}... ` +
                `state=${state} block=${currentBlock}`);
        }
        catch (e) {
            console.error(`Poll error:`, e);
        }
    }
}
async function heartbeat() {
    lastHeartbeatTime = new Date().toISOString();
    console.log(`[${lastHeartbeatTime}] Heartbeat`);
}
const app = express();
app.get('/health', (_req, res) => {
    const statuses = Array.from(orgStatuses.values());
    res.json({
        status: 'ok',
        service: 'VeritasZK Proof Monitor',
        network: 'testnet',
        lastPoll: lastPollTime,
        lastHeartbeat: lastHeartbeatTime,
        totalPolls,
        proofsMonitored: MONITORED_ORGS.length,
        states: {
            active: statuses.filter(s => s.state === 'ACTIVE').length,
            expiring: statuses.filter(s => s.state === 'EXPIRING').length,
            expired: statuses.filter(s => s.state === 'EXPIRED').length,
            noProof: statuses.filter(s => s.state === 'NO_PROOF').length,
        },
        orgs: statuses,
        timestamp: new Date().toISOString(),
    });
});
app.get('/', (_req, res) => {
    res.json({
        service: 'VeritasZK Proof Monitor Bot',
        health: '/health',
        dashboard: 'https://veritaszk.vercel.app',
    });
});
app.listen(PORT, () => {
    console.log(`Monitor running on port ${PORT}`);
});
pollOrgs();
setInterval(pollOrgs, POLL_MS);
setInterval(heartbeat, HEARTBEAT_MS);
