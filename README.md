# VeritasZK

[![npm](https://img.shields.io/npm/v/veritaszk-sdk)](https://www.npmjs.com/package/veritaszk-sdk)
— Prove Solvency. Reveal Nothing.

> The first zero-knowledge solvency proof system on Aleo.  
> Organizations prove they hold more than they owe — without revealing a single number.

**Live Demo:** https://veritaszk.vercel.app  
**Instant Demo (no wallet required):** https://veritaszk.vercel.app/organization?demo=true  
**Network:** Aleo Testnet  
**Contract:** `veritaszk.aleo`  
**npm:** [veritaszk-sdk](https://www.npmjs.com/package/veritaszk-sdk)

---

## The Problem

After FTX ($32B lost), Celsius ($4.7B), and BlockFi ($1.8B) collapsed,crypto realized it had no reliable way to verify organizational solvency without full public disclosure.

Current Proof-of-Reserves implementations (Binance, OKX) use Merkle trees that require publishing every wallet address and balance. That leaks treasury strategy, trading positions, and competitive intelligence. It forces a choice between **privacy** and **verifiability**.

VeritasZK eliminates that tradeoff.

---

## The Solution

VeritasZK lets DAOs, crypto funds, exchanges, and organizations prove they are solvent — assets exceed liabilities — via ZK proof on Aleo, without revealing:

- Which assets they hold
- Exact amounts per asset
- Wallet addresses or identities
- Treasury strategy or trading positions

Anyone can verify the proof publicly. Nobody sees the underlying data. Ever.

---

## How It Works

### Three User Roles

| Role | What They Do |
|------|-------------|
| **Organization** | Declares private assets + liabilities, generates solvency proof |
| **Verifier** | Enters any org address, sees SOLVENT / UNVERIFIED / REVOKED |
| **Public** | Views dashboard of all registered orgs — zero financial data visible |

### The Privacy Model

| Data | Visibility | How |
|------|-----------|-----|
| Asset amounts | 🔒 Private | Stored in Leo Records — encrypted on-chain, owner only |
| Liability amounts | 🔒 Private | Stored in Leo Records — encrypted on-chain, owner only |
| Asset types | 🔒 Private | Inside Records — never touches public state |
| Wallet addresses | 🔒 Private | Never stored in any mapping |
| Solvency result | ✅ Public | Boolean only — `is_solvent: bool` |
| Proof timestamp | ✅ Public | When the proof was generated |
| Proof nonce | ✅ Public | Cryptographic commitment — not reversible |
| Org name | ✅ Public | Hashed before submission — raw name never on-chain |

**What the verifier sees:** SOLVENT ✓ or not. Nothing else.  
**What appears in any transaction:** A boolean. A timestamp. A hash.  
**What appears in any mapping:** The same.

This is not privacy by obscurity. The proof is cryptographically verified by Aleo's ZK proof system. The witnesses are mathematically hidden.

---

## Live Demo

**→ https://veritaszk.vercel.app**

**Recommended: Instant demo (no wallet required)**  
https://veritaszk.vercel.app/organization?demo=true

Complete the full solvency proof journey in under 2 minutes:

1. Register your organization — name hashed via BHP256, never stored raw
2. Declare assets privately — ALEO, USDCx, USAD (amounts sealed in Leo Records)
3. Declare liabilities privately
4. Generate Solvency Proof — ZK animation runs (matrix rain → SOLVENT ✓)
5. Copy share link → open in new tab → no wallet needed → SOLVENT ✓ confirmed
6. Check `/dashboard` — organization appears in public registry
7. Verify on explorer — only boolean + nonce in public state

[View deployment transaction →](https://testnet.explorer.provable.com/transaction/at1tkmfhd76ggsrx7p0srlhfc6hyjsqefskrtwd49y3elk4dga4sczse6r5c4)

---

## SDK

Integrate VeritasZK verification into any frontend in 3 lines of code.
```bash
npm install veritaszk-sdk
```
```typescript
import { VeritasZK } from 'veritaszk-sdk'

const client = new VeritasZK({ network: 'testnet' })

// Verify an organization's solvency
const result = await client.verifySolvency('aleo1abc...')
console.log(result.isSolvent)          // true — no amounts revealed
console.log(result.verificationCount)  // times verified on-chain

// One-line convenience function
import { verifySolvency } from 'veritaszk-sdk'
const { isSolvent } = await verifySolvency('aleo1abc...')
```

**What the SDK does NOT return — by design:**
- Asset amounts or liability amounts
- Asset types or compositions
- Any data that could reveal financial strategy

This is guaranteed by the underlying Leo contract — the data does not 
exist in any queryable public state.

[View on npm →](https://www.npmjs.com/package/veritaszk-sdk)

---

## Why Only Aleo Makes This Possible

| Chain | Private State | Public Verifiability | Verdict |
|-------|-------------|---------------------|---------|
| Ethereum | ❌ All state public | ✅ | Impossible |
| Aztec | ✅ | ⚠️ Limited | No clean L1 impl |
| Solana | ❌ | ✅ | Impossible |
| **Aleo** | ✅ Native Records | ✅ Public Mappings | **Purpose-built** |

Aleo's private Records are first-class citizens — not bolt-ons. Off-chain execution computes the proof privately before submission. The finalize block receives only the result. This is exactly what Aleo was designed for.

---

## Architecture

![VeritasZK Architecture](assets/architecture.svg)

### Smart Contract: `veritaszk.aleo`

| Transition | Privacy | Description |
|-----------|---------|-------------|
| `register_org` | Public | Register org name hash |
| `declare_asset` | **Private** | Creates encrypted AssetRecord — amount never touches public state |
| `declare_liability` | **Private** | Creates encrypted LiabilityRecord |
| `generate_solvency_proof` | Mixed | Consumes private records off-chain → writes boolean only to public mapping |
| `verify_solvency` | Public | Anyone reads proof status |
| `revoke_proof` | Public | Org invalidates outdated proof |

### Contract Details

**Program:** `veritaszk.aleo`  
**Network:** Aleo Testnet  
**Transaction:** `at1tkmfhd76ggsrx7p0srlhfc6hyjsqefskrtwd49y3elk4dga4sczse6r5c4`  
**Explorer:** [View on Provable Explorer](https://testnet.explorer.provable.com/transaction/at1tkmfhd76ggsrx7p0srlhfc6hyjsqefskrtwd49y3elk4dga4sczse6r5c4)

Deployed by building Leo from source (commit e773034) against snarkVM 4.6.0 — the first community deployment after the ConsensusVersion V14 upgrade. Solution shared in Aleo Discord #dev-support.

---

## Privacy Model in Action

Actual `leo run` output demonstrating the privacy model. Amounts exist only inside private Records. The public mapping receives zero financial data.

**Declaring a private asset:**
```
Output:
 - owner: aleo1... (private)
 - asset_type: 1u8 (private)
 - amount: 5000u64.private  ← sealed in encrypted Record
 - asset_id: 1field (private)
```
The `.private` suffix confirms the amount is sealed in an encrypted Record. It does not appear in any mapping, finalize block, or public state.

**Generating a solvency proof:**
```
Public mapping update:
 - is_solvent: true
 - timestamp: [block height]
 - proof_nonce: [BHP256 hash]
 - asset_count: 2u8
 - liability_count: 1u8
```
No amounts. No asset types. No wallet addresses. The predicate `total_assets > total_liabilities` was proved without revealing either value.

---

## Wallet Support

VeritasZK integrates Shield Wallet, Puzzle Wallet, and Leo Wallet.

**Shield Wallet** — connects on Chrome, address detected, wallet recognized by the dApp. Transaction signing is targeting full compatibility as Shield's extension matures post-V14.

**Puzzle Wallet** — connects on Chrome, address detected. Transaction popup appears with correct program ID, function name, fee, and inputs. Extension-level WASM handling is an active area of Puzzle's development.

**Leo Wallet** — integration ready. Current Chrome Web Store version predates the V14 connect API — targeting support with next extension release.

All three wallets are detected and listed in the connection modal. The full transaction flow is exercised in demo mode against the live deployed contract.

**Complete demo:** https://veritaszk.vercel.app/organization?demo=true  
**With wallet:** Connect from the organization portal on Chrome

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Leo (Aleo native ZK language) |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Wallet Support | Shield Wallet, Puzzle Wallet, Leo Wallet |
| Tokens | credits.aleo, USDCx, USAD |
| SDK | veritaszk-sdk (npm) |
| Hosting | Vercel |
| Network | Aleo Testnet |

---

## Local Setup
```bash
# Clone
git clone https://github.com/Vinaystwt/veritaszk
cd veritaszk

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
# → http://localhost:3000

# Leo contract (requires Leo CLI)
cd ../veritaszk
leo build
leo run declare_asset 1u8 1000u64 1field
leo run declare_liability 1u8 500u64 1field
```

---

## Changelog

**Initial release — full build:**
- ✅ Leo smart contract — 6 transitions, full privacy model, deployed to Aleo Testnet
- ✅ Organization portal — private asset/liability declaration, ZK proof generation
- ✅ ZK proof animation — matrix rain, particle burst, typewriter proof nonce
- ✅ Verifier portal — public verification, shareable deep-links, proof guarantee explainer  
- ✅ Public dashboard — org registry, filter/sort, animated stats
- ✅ Demo mode — complete ZK proof flow at `/organization?demo=true`
- ✅ Shield Wallet + Puzzle Wallet — connection working on Chrome
- ✅ Multi-token support: credits.aleo, USDCx, USAD
- ✅ npm SDK — `veritaszk-sdk@0.1.0` published
- ✅ Inline privacy comments in Leo contract
- ✅ `leo run` output in README — `.private` suffix confirms privacy model
- ✅ Architecture SVG diagram
- ✅ First deployment after ConsensusVersion V14 upgrade — fix shared publicly

---

## Roadmap

- **Full wallet transaction flow** — end-to-end transaction signing as Aleo wallet adapters mature post-V14 upgrade
- **Multi-wallet proof aggregation** — prove solvency across multiple Aleo addresses
- **Time-locked proof expiry** — proofs auto-invalidate after configurable block count
- **Selective disclosure** — reveal specific assets to specific verifiers for compliance
- **veritaszk-sdk v0.2.0** — batch verification, webhook support, React hooks
- **Verification API** — embed real-time solvency badges anywhere
- **Proof history timeline** — full on-chain audit trail per organization

---

*VeritasZK — Prove Solvency. Reveal Nothing.*
