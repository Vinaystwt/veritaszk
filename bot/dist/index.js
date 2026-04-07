import express from 'express';
const EXPLORER = 'https://api.explorer.provable.com/v1/testnet';
const CORE = 'veritaszk_core.aleo';
const AUDIT = 'veritaszk_audit.aleo';
const REGISTRY = 'veritaszk_registry.aleo';
const THRESHOLD = 'veritaszk_threshold.aleo';
const PORT = process.env.PORT ?? 3001;
const POLL_MS = 30 * 1000;
const HEARTBEAT_MS = 60 * 60 * 1000;
const cache = [];
let lastIndexedBlock = 0;
const startTime = Date.now();
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
function parseU8(val) {
    if (!val)
        return 0;
    return Number(String(val).replace('u8', '').trim());
}
async function getCurrentBlock() {
    try {
        const res = await fetch(`${EXPLORER}/block/height/latest`);
        if (!res.ok)
            return 0;
        const data = await res.json();
        return Number(data) || 0;
    }
    catch {
        return 0;
    }
}
// ─── Poll all known commitments ──────────────────────────────────────
async function pollAll() {
    const currentBlock = await getCurrentBlock();
    if (currentBlock > 0)
        lastIndexedBlock = currentBlock;
    // Collect all unique commitments from cache
    const commitments = cache.map(e => e.commitment);
    if (commitments.length === 0)
        return;
    for (const entry of cache) {
        const c = entry.commitment;
        try {
            const [solvent, proofStatus, expiry, count, threshold, timestamp] = await Promise.all([
                q(CORE, 'solvency_proofs', c),
                q(CORE, 'proof_status', c),
                q(CORE, 'proof_expiry', c),
                q(CORE, 'verification_counts', c),
                q(CORE, 'threshold_proofs', c),
                q(CORE, 'proof_timestamps', c),
            ]);
            const isSolvent = solvent === true || solvent === 'true';
            const status = parseU8(proofStatus) ?? 0;
            const exp = parseU32(expiry) ?? 0;
            const isExpired = status === 2 || (exp > 0 && currentBlock > exp);
            entry.status = {
                commitment: c,
                isSolvent,
                proofStatus: status,
                timestamp: parseU32(timestamp) ?? 0,
                expiry: exp,
                isExpired,
                verificationCount: parseU32(count) ?? 0,
                tier: parseU8(threshold),
            };
        }
        catch {
            // Keep existing status on error
        }
    }
    console.log(`[${new Date().toISOString()}] Indexed ${cache.length} proofs, block ${currentBlock}`);
}
// ─── Legacy bot behavior (keep intact) ───────────────────────────────
let lastHeartbeatTime = 'never';
async function heartbeat() {
    lastHeartbeatTime = new Date().toISOString();
    console.log(`[${lastHeartbeatTime}] Heartbeat`);
}
const app = express();
// ─── Middleware ──────────────────────────────────────────────────────
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS')
        return res.sendStatus(200);
    next();
});
app.use(express.json());
// ─── Legacy routes ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        lastIndexedBlock,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        programs: [
            'veritaszk_registry.aleo',
            'veritaszk_core.aleo',
            'veritaszk_audit.aleo',
            'veritaszk_threshold.aleo',
        ],
    });
});
app.get('/', (_req, res) => {
    res.json({
        service: 'VeritasZK Proof Monitor Bot',
        health: '/health',
        dashboard: 'https://veritaszk.vercel.app',
    });
});
// ─── Indexer REST API ────────────────────────────────────────────────
// GET /api/health
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        lastIndexedBlock,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        programs: [
            'veritaszk_registry.aleo',
            'veritaszk_core.aleo',
            'veritaszk_audit.aleo',
            'veritaszk_threshold.aleo',
        ],
    });
});
// GET /api/proofs
app.get('/api/proofs', (_req, res) => {
    res.json(cache.map(e => e.status));
});
// GET /api/proofs/:commitment
app.get('/api/proofs/:commitment', (req, res) => {
    const entry = cache.find(e => e.commitment === req.params.commitment);
    if (!entry)
        return res.status(404).json({ error: 'commitment not tracked' });
    res.json(entry.status);
});
// GET /api/tiers
app.get('/api/tiers', (_req, res) => {
    const tiers = { tier1: 0, tier2: 0, tier3: 0, tier4: 0, total: 0 };
    for (const e of cache) {
        const t = e.status.tier;
        if (t >= 1 && t <= 4)
            tiers[`tier${t}`]++;
        tiers.total++;
    }
    res.json(tiers);
});
// GET /api/stats
app.get('/api/stats', (_req, res) => {
    let activeProofs = 0, expiredProofs = 0, revokedProofs = 0, totalVerifications = 0;
    for (const e of cache) {
        const s = e.status;
        if (s.proofStatus === 1)
            activeProofs++;
        if (s.proofStatus === 2)
            expiredProofs++;
        if (s.proofStatus === 3)
            revokedProofs++;
        totalVerifications += s.verificationCount;
    }
    res.json({
        totalOrgs: cache.length,
        activeProofs,
        expiredProofs,
        revokedProofs,
        totalVerifications,
        lastIndexedBlock,
    });
});
// POST /api/proofs/register
app.post('/api/proofs/register', (req, res) => {
    const { commitment } = req.body;
    if (!commitment)
        return res.status(400).json({ error: 'commitment required' });
    const exists = cache.find(e => e.commitment === commitment);
    if (exists)
        return res.json({ added: false, reason: 'already tracked' });
    cache.push({
        commitment,
        status: {
            commitment,
            isSolvent: false,
            proofStatus: 0,
            timestamp: 0,
            expiry: 0,
            isExpired: false,
            verificationCount: 0,
            tier: 0,
        },
    });
    console.log(`[${new Date().toISOString()}] Registered new commitment: ${commitment.slice(0, 16)}...`);
    res.json({ added: true });
});
// ─── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`VeritasZK Indexer running on port ${PORT}`);
});
// Seed with deploy wallet for initial monitoring
cache.push({
    commitment: 'aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00',
    status: {
        commitment: 'aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00',
        isSolvent: false,
        proofStatus: 0,
        timestamp: 0,
        expiry: 0,
        isExpired: false,
        verificationCount: 0,
        tier: 0,
    },
});
pollAll();
setInterval(pollAll, POLL_MS);
setInterval(heartbeat, HEARTBEAT_MS);
