# VeritasZK — Prove Solvency. Reveal Nothing.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-veritaszk.vercel.app-4fffb0?style=flat-square)](https://veritaszk.vercel.app)
[![Aleo Testnet](https://img.shields.io/badge/Aleo-Testnet-blue?style=flat-square)](https://testnet.explorer.provable.com/program/veritaszk_threshold.aleo)
[![npm](https://img.shields.io/badge/npm-veritaszk--sdk-red?style=flat-square)](https://www.npmjs.com/package/veritaszk-sdk)
[![Indexer](https://img.shields.io/badge/Indexer-Live-green?style=flat-square)](https://veritaszk-production.up.railway.app/api/health)

> *"We can achieve auditing logs unforgeable after commitment via secure timestamps. Since auditing controls are used to secure trillions of dollars of transactions every year, they are not going away."*
> — Nick Szabo, Confidential Auditing, 1993

VeritasZK is the first onchain implementation of Szabo's 1993 confidential auditing protocol — built natively on Aleo. Organizations prove their assets exceed liabilities via zero-knowledge range proofs. The proof reveals exactly one number (a tier classification from 1-4) and one boolean (is_solvent). Nothing else. Ever.

**→ [Live Demo](https://veritaszk.vercel.app) · [Indexer API](https://veritaszk-production.up.railway.app/api/health) · [npm](https://www.npmjs.com/package/veritaszk-sdk)**

---

## The Problem

November 2, 2022 — CoinDesk leaks FTX's balance sheet. Six days later, $8 billion in customer funds is gone.

July 2022 — Celsius freezes withdrawals. $4.7 billion missing.

November 2022 — BlockFi files for bankruptcy. $1.8 billion.

**Common thread:** All had clean self-reported financials. No independent cryptographic verification existed.

The industry responded with Merkle Proof of Reserves. Binance published their reserves in late 2022 — 150,000+ wallet addresses made public. Trading bots exploited the address data within 48 hours. Privacy and transparency were forced to be a tradeoff.

**The gap:** No mechanism existed to prove solvency without either trusting the company's own numbers or revealing every wallet address they own.

---

## The Insight

Nick Szabo solved this theoretically in 1993.

Range proofs over private inputs can prove a ratio (assets ÷ liabilities ≥ threshold) without revealing the numerator or denominator. The proof is cryptographically unforgeable. The underlying data is never disclosed.

The missing piece for 30 years: a blockchain where ZK proofs execute natively, private inputs remain private by default, and public mappings store only the verified result.

Aleo is that blockchain.

---

## Why Only Aleo

This protocol is **impossible to implement correctly on transparent chains:**

| Chain | Problem |
|-------|---------|
| Ethereum | All state is public — asset amounts would be visible |
| Aztec | Private state exists but no clean L1 implementation |
| Solana | Fully public — no privacy primitives |
| **Aleo** | **Private Records by default. Off-chain ZK execution. Public Mappings for results only.** |

Aleo's architecture maps perfectly to the requirement:
- **Private Records** store asset/liability data — encrypted onchain, never exposed
- **Leo transitions** execute the range proof off-chain in the user's wallet
- **Public Mappings** store only the tier number and boolean — the verified result
- **Selective disclosure** allows controlled reveal for compliance if needed

No other L1 provides this combination. VeritasZK is not a workaround — it is what Aleo was designed to enable.

---

## How It Works
```
┌─────────────────────────────────────────────────────────────┐
│                    ORGANIZATION                              │
│                                                             │
│  Private Inputs (never leave the wallet):                   │
│  • native_credits: 3,000,000 ALEO                          │
│  • stablecoin_usd: 1,500,000 USDCx                         │
│  • btc_equivalent: 500,000                                  │
│  • other_assets: 200,000                                    │
│  • total_liabilities: 1,000,000                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │  Leo transition executes in Shield Wallet
                       │  ZK range proof computed off-chain
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  ALEO TESTNET                                │
│                                                             │
│  Public output (all that's stored):                         │
│  • tier: 4                                                  │
│  • is_solvent: true                                         │
│  • commitment: thr_at1ftfa0c2cj...                         │
│  • expiry_block: 16,132,111                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │  Anyone can query
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               VERIFIER (counterparty, regulator)            │
│                                                             │
│  Sees: Tier 4 Institutional · Assets ≥ 3.0× Liabilities    │
│        Basel III Advanced IRB · Valid until block 16.1M     │
│                                                             │
│  Never sees: Any amount. Any address. Any asset name.       │
└─────────────────────────────────────────────────────────────┘
```

---

## Tier System

| Tier | Name | Coverage | Regulatory Standard |
|------|------|----------|---------------------|
| **T1** | Standard | ≥ 1.0× | Baseline solvency (general accounting) |
| **T2** | Verified | ≥ 1.5× | Basel III Tier 1 Capital adequacy |
| **T3** | Strong | ≥ 2.0× | Solvency II SCR coverage · MiCA Article 76 |
| **T4** | Institutional | ≥ 3.0× | Basel III advanced IRB · Insurance SCR buffer |

---

## User Roles

**Organization** — registers onchain identity, submits `prove_threshold` via Shield Wallet, manages proof expiry and delegation, downloads compliance certificate.

**Verifier** — any counterparty, regulator, or auditor. No wallet required. Searches by org name or commitment hash. Sees tier and expiry. Cannot see any underlying financial data.

**Public** — views the live proof ledger at `/public`. All active proofs, tier distribution, expiring soon alerts. Fully transparent at the proof level, fully private at the data level.

---

## Deployed Programs — Aleo Testnet

| Program | Transaction | Role |
|---------|-------------|------|
| [veritaszk_registry.aleo](https://testnet.explorer.provable.com/program/veritaszk_registry.aleo) | `at1syv4aged4jk0gspqyadeq7sq40yga2x85kxc7pcyj60w9vydzczq3mj3at` | Org identity, delegation, name registry |
| [veritaszk_core.aleo](https://testnet.explorer.provable.com/program/veritaszk_core.aleo) | `at19tn3me0tm5sct8q2a3zwz0ffkujtztz9td04psrjj3pmcencj5gse7yv3y` | Proof engine, expiry, revocation, multi-wallet |
| [veritaszk_audit.aleo](https://testnet.explorer.provable.com/program/veritaszk_audit.aleo) | `at1jqffrkx5tepef74nvqhmzscywg2ulx8p9ejf70gxj873l07lhgrqdhggfa` | Compliance trail, verification logging, proof history |
| [veritaszk_threshold.aleo](https://testnet.explorer.provable.com/program/veritaszk_threshold.aleo) | `at1j9ghj3zu5a9n47t07nsyj3uu6f5q6g54u8vn22gse68e428lacqq7ugnz4` | AssetBundle range proofs, tier attestations |

---

## Architecture
```
                veritaszk_registry.aleo
                ─────────────────────────
                register_org
                delegate_proof_authority
                register_org_name
                          │
                          │ validates org identity
                          ▼
                veritaszk_core.aleo
                ─────────────────────────
                prove_solvency
                prove_solvency_multi_wallet
                submit_proof_with_expiry
                refresh_proof
                revoke_proof_record
                selective_disclose
                /                         \
 audit events  /                           \  tier proofs
              /                             \
             ▼                               ▼
veritaszk_audit.aleo            veritaszk_threshold.aleo
─────────────────────           ──────────────────────────
log_verification                prove_threshold
link_proof_history              verify_tier
record_proof_event              revoke_tier_proof
record_compliance_disclosure
```

**AssetBundle struct** — 4 private asset classes:
```leo
struct AssetBundle {
    native_credits: u64,   // ALEO credits (private)
    stablecoin_usd: u64,   // USDCx / USAD  (private)
    btc_equivalent: u64,   // BTC-equivalent (private)
    other_assets: u64,     // Other assets   (private)
}
```

**Proof lifecycle:**
1. `prove_threshold` — submits range proof, issues `TierProofRecord` onchain
2. `submit_proof_with_expiry` — anchors proof to a specific block height
3. `refresh_proof` — renews expiring proof without revealing data
4. `revoke_proof_record` — organization invalidates outdated proof
5. `delegate_proof_authority` — compliance team submits on org's behalf

> **Technical note:** Registry validation is enforced at the application layer due to a Leo v4.0.0 CPI finalize-mapping read compiler limitation. Import statements remain in `veritaszk_core.aleo` for architectural clarity. Full CPI cross-program invocation is planned for the next Leo release.

---

## Privacy Model

**What goes onchain:**
```
tier: u8              // 1, 2, 3, or 4
is_solvent: bool      // true or false
commitment: field     // cryptographic hash
expiry_block: u32     // block height anchor
```

**What never goes onchain:**
```
❌ Asset amounts (any)
❌ Liability amounts
❌ Wallet addresses
❌ Asset composition or names
❌ Treasury strategy
❌ Identity of verifiers
❌ Historical balance data
```

**No off-chain keys:** VeritasZK holds zero encryption keys for financial data. Proof computation happens entirely inside the organization's Shield Wallet. No VeritasZK server, database, or backend ever receives a balance sheet. This is architecturally different from solutions that encrypt data under a project-controlled key — if that key is compromised, all historical financial data is exposed. VeritasZK has no such key to compromise.

---

## Live Infrastructure

### REST API Indexer
**Base URL:** `https://veritaszk-production.up.railway.app`

```bash
# Health check — current block height
curl https://veritaszk-production.up.railway.app/api/health

# All active proofs
curl https://veritaszk-production.up.railway.app/api/proofs

# Single org verification
curl https://veritaszk-production.up.railway.app/api/proofs/thr_commitment

# Network statistics
curl https://veritaszk-production.up.railway.app/api/stats

# Tier distribution across all orgs
curl https://veritaszk-production.up.railway.app/api/tiers
```

### SDK

```bash
npm install veritaszk-sdk
```

```typescript
import { batchVerifyFromIndexer, watchProof, isProofExpiredFromIndexer } from 'veritaszk-sdk'

// Verify multiple organizations at once
const results = await batchVerifyFromIndexer(
  ['commitment_1', 'commitment_2'],
  'https://veritaszk-production.up.railway.app'
)

// Watch for live status changes (watchdog for expiry)
const stop = watchProof(
  commitment,
  (status) => console.log('Tier:', status.tier, '| Expired:', status.isExpired),
  indexerUrl,
  30000  // poll every 30 seconds
)

// Check if a specific proof has expired
const expired = await isProofExpiredFromIndexer(commitment, indexerUrl)
```

### MCP Server (AI Agent Integration)

```bash
npm install veritaszk-mcp
```

```json
{
  "mcpServers": {
    "veritaszk": {
      "command": "npx",
      "args": ["veritaszk-mcp"]
    }
  }
}
```

Tools available to AI agents:
- `check_org_solvency` — verify an organization's current tier and status
- `list_expiring_proofs` — find proofs expiring within a time window

### CLI

```bash
npm install -g veritaszk-cli

veritaszk verify --org DemoExchange      # verify by name
veritaszk verify --commitment thr_abc    # verify by commitment
veritaszk list                           # list all active proofs
veritaszk watch thr_commitment           # watch for status changes
veritaszk stats                          # network statistics
```

---

## Frontend — 7 Pages

| Page | Purpose |
|------|---------|
| [`/`](https://veritaszk.vercel.app) | Hero, mechanism, live stats, comparison table, inline 5-second demo |
| [`/organization`](https://veritaszk.vercel.app/organization) | Shield Wallet, org registration, prove_threshold, certificate download |
| [`/verifier`](https://veritaszk.vercel.app/verifier) | Zero-wallet verification, regulatory mapping, embeddable badge |
| [`/public`](https://veritaszk.vercel.app/public) | Live proof ledger, tier filters, expiry tracking |
| [`/vision`](https://veritaszk.vercel.app/vision) | The problem, Szabo lineage, regulatory alignment, roadmap |
| [`/docs`](https://veritaszk.vercel.app/docs) | API reference, SDK docs, animated CPI architecture diagram |
| [`/enterprise`](https://veritaszk.vercel.app/enterprise) | Compliance workflow, integration options |

**Shield Wallet integration:** Full 7-state connection machine with correct `connect(network, decryptPermission, programs[])` invocation, `executeTransaction` with exact Leo struct literal format, `transactionStatus` polling for real `at1...` transaction IDs, and manual address fallback.

---

## Who Needs This

| User | Problem | VeritasZK Solution |
|------|---------|-------------------|
| **Crypto exchanges** | Prove custodial solvency to institutional clients | T4 Institutional attestation without revealing trading positions |
| **DAO treasuries** | Transparent solvency for governance token holders | Public tier badge, private treasury |
| **DeFi lending** | Borrower collateral verification | Onchain tier proof, no strategy disclosure |
| **Stablecoin issuers** | Reserve ratio attestation under MiCA Article 76 | T3 Strong maps directly to MiCA Article 76 |
| **Regulated funds** | Basel III / Solvency II compliance reporting | Tier system maps to regulatory standards |

---

## Wave 5 Changelog

**New programs:**
- `veritaszk_threshold.aleo` — 4th Leo program with AssetBundle struct and programmable confidence tiers 1-4

**New program features (veritaszk_core, veritaszk_audit, veritaszk_registry):**
- Proof expiry with block-height anchoring (`submit_proof_with_expiry`)
- Proof refresh without re-revealing data (`refresh_proof`)
- Proof revocation with onchain record (`revoke_proof_record`)
- Delegation authority for compliance teams (`delegate_proof_authority`)
- Onchain verification logging (`log_verification`)
- Proof history linking (`link_proof_history`)
- Org name registry (`register_org_name`)

**New infrastructure:**
- REST API indexer on Railway — true chain indexer, polls Aleo testnet every 12 seconds
- `veritaszk-sdk@0.3.1` — batchVerify, watchProof, isProofExpired
- `veritaszk-mcp@0.2.1` — MCP server for AI agent compliance monitoring
- `veritaszk-cli@0.2.1` — terminal-based verification

**New frontend:**
- Complete rebuild — 7 pages, "Engraved Vault" design system
- ZKFieldAnimation hero — 320 hex-char particles collapse into Tier 4 badge
- Real Shield Wallet transaction submission (prove_threshold on testnet)
- transactionStatus polling for verified `at1...` TX IDs
- Downloadable compliance certificate (PNG with QR code)
- Embeddable verification badge
- Proof expiry countdown with color-coded urgency (green → amber → red)
- MCP server for AI agent integration

---

## Local Development

```bash
git clone https://github.com/Vinaystwt/veritaszk
cd veritaszk

# Frontend
cd frontend && npm install && npm run dev
# → http://localhost:3000

# Indexer
cd bot && npm install && npm run dev

# Leo programs (requires Leo CLI v4.0.0+)
cd veritaszk_threshold && leo build --network testnet
cd veritaszk_core && leo build --network testnet
cd veritaszk_audit && leo build --network testnet
cd veritaszk_registry && leo build --network testnet
```

No `.env` required for frontend — Railway indexer URL is public.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Leo v4.0.0 — 4 programs, Aleo Testnet |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| Wallet | Shield Wallet — Aleo native |
| Chain indexer | Node.js, Railway (always-on) |
| npm packages | veritaszk-sdk · veritaszk-mcp · veritaszk-cli |
| Hosting | Vercel (frontend) · Railway (indexer) |

---

*Nick Szabo proposed confidential auditing in 1993.*
*We built it natively on Aleo in 2026.*
*VeritasZK — Prove Solvency. Reveal Nothing.*
