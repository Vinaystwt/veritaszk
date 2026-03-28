# VeritasZK — Prove Solvency. Reveal Nothing.

> The first zero-knowledge solvency proof system on Aleo.  
> Organizations prove they hold more than they owe — without revealing a single number.

**Live Demo:** https://veritaszk.vercel.app  
**Network:** Aleo Testnet  
**Contract:** `veritaszk.aleo`  
**Buildathon:** Aleo Privacy Buildathon by AKINDO — Wave 4

---

## The Problem

After FTX, Celsius, and BlockFi collapsed, crypto realized it had 
no reliable way to verify organizational solvency — without full 
public disclosure.

Current Proof-of-Reserves implementations (Binance, OKX) use 
Merkle trees that require publishing every wallet address and 
balance. That leaks treasury strategy, trading positions, and 
competitive intelligence. It forces a choice between 
**privacy** and **verifiability**.

VeritasZK eliminates that tradeoff.

---

## The Solution

VeritasZK lets DAOs, crypto funds, exchanges, and organizations 
prove they are solvent — assets exceed liabilities — via ZK proof 
on Aleo, without revealing:

- Which assets they hold
- Exact amounts per asset  
- Wallet addresses or identities
- Treasury strategy or trading positions

Anyone can verify the proof publicly. Nobody sees the underlying 
data. Ever.

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

This is not privacy by obscurity. The proof is cryptographically 
verified by Aleo's ZK proof system. The witnesses are 
mathematically hidden.

---

## Why Only Aleo Makes This Possible

| Chain | Private State | Public Verifiability | Verdict |
|-------|-------------|---------------------|---------|
| Ethereum | ❌ All state public | ✅ | Impossible |
| Aztec | ✅ | ⚠️ Limited | No clean L1 impl |
| Solana | ❌ | ✅ | Impossible |
| **Aleo** | ✅ Native Records | ✅ Public Mappings | **Purpose-built** |

Aleo's private Records are first-class citizens — not bolt-ons. 
Off-chain execution computes the proof privately before 
submission. The finalize block receives only the result. 
This is exactly what Aleo was designed for.

---

## Architecture
```
┌─────────────────────────────────────────────────────┐
│                   PRIVATE LAYER                      │
│  AssetRecord { owner, asset_type, amount, id }      │
│  LiabilityRecord { owner, liability_type, amount }  │
│  → Encrypted on-chain. Owner-only access.           │
└─────────────────┬───────────────────────────────────┘
                  │ consumed by
┌─────────────────▼───────────────────────────────────┐
│              COMPUTATION LAYER                       │
│  generate_solvency_proof transition                 │
│  → Sums assets. Sums liabilities.                   │
│  → Asserts: total_assets > total_liabilities        │
│  → Computes proof_nonce via BHP256 hash             │
│  → Executes OFF-CHAIN (Aleo native)                 │
└─────────────────┬───────────────────────────────────┘
                  │ writes only
┌─────────────────▼───────────────────────────────────┐
│                PUBLIC LAYER                          │
│  solvency_proofs mapping:                           │
│  address → { is_solvent: bool, timestamp,           │
│              proof_nonce, asset_count }             │
│  → No amounts. No identities. Publicly verifiable.  │
└─────────────────────────────────────────────────────┘
```

### Smart Contract: `veritaszk.aleo`

| Transition | Privacy | Description |
|-----------|---------|-------------|
| `register_org` | Public | Register org name hash |
| `declare_asset` | **Private** | Creates encrypted AssetRecord |
| `declare_liability` | **Private** | Creates encrypted LiabilityRecord |
| `generate_solvency_proof` | Mixed | Consumes private records → writes public boolean |
| `verify_solvency` | Public | Anyone reads proof status |
| `revoke_proof` | Public | Org invalidates outdated proof |

### Frontend
```
Next.js 16 + TypeScript + Tailwind CSS
├── /organization    — Org portal (wallet-gated)
├── /verify          — Public verifier (no wallet needed)  
└── /dashboard       — Public org registry
```

---


## Privacy Model in Action

The following shows actual output from the Leo contract demonstrating
the privacy model. Amounts exist only inside private Records.
The public mapping receives zero financial data.

**Declaring a private asset (`leo run declare_asset 1u8 5000u64 1field`):**
```
➡️  Output

 - {
  owner: aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00.private,
  asset_type: 1u8.private,
  amount: 5000u64.private,
  asset_id: 1field.private,
  _nonce: 1089347752592445893799490357089215580889253368380903926629319695835121538137group.public,
  _version: 1u8.public
}
```

The `amount` field is marked `.private` — it exists only inside the encrypted
`AssetRecord`. It does not appear in any mapping, finalize block, or public state.
The `_nonce` is a cryptographic blinding factor — it reveals nothing about the amount.

**Declaring a private liability (`leo run declare_liability 1u8 2000u64 1field`):**
```
➡️  Output

 - {
  owner: aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00.private,
  liability_type: 1u8.private,
  amount: 2000u64.private,
  liability_id: 1field.private,
  _nonce: 6455143737953259765406033392729023187788695499265001382919185992290328304668group.public,
  _version: 1u8.public
}
```

**Generating a solvency proof (2 assets totalling 5000, 1 liability of 1500):**
```
➡️  Output

 - {
  program_id: veritaszk.aleo,
  function_name: generate_solvency_proof,
  arguments: [
    aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00,
    1700000000u32,
    2u8,
    1u8,
    3380839802934998011275142667485699624928343012989225456971976014915814340027field
  ]
}
```

The `solvency_proofs` mapping receives only:
- `aleo1cdmu...` — the organization address (caller)
- `1700000000u32` — the timestamp
- `2u8` — asset count (2 non-sentinel slots used)
- `1u8` — liability count (1 non-sentinel slot used)
- `3380839...field` — a BHP256 commitment derived from asset IDs + timestamp

No amounts. No asset types. No individual balances.
The predicate `total_assets > total_liabilities` (5000 > 1500) was proved
without revealing either value. The verifier learns only that it holds.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Leo (Aleo native ZK language) |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Wallet | Leo Wallet / Puzzle Wallet (aleo-wallet-adapter) |
| Tokens | credits.aleo, USDCx, USAD |
| Hosting | Vercel |
| Network | Aleo Testnet |

---

## Live Demo

**→ https://veritaszk.vercel.app**

**Full user journey (2 minutes):**
1. Connect wallet at `/organization`
2. Register your organization name
3. Declare 2 assets privately (ALEO + USDCx)
4. Declare 1 liability privately
5. Click "Generate Solvency Proof" — watch the ZK animation
6. Copy the share link
7. Open share link in new tab — no wallet required
8. See SOLVENT ✓ — zero financial data visible
9. Check `/dashboard` — your org appears in the registry

---

## Local Setup
```bash
# Clone
git clone https://github.com/Vinaystwt/veritaszk
cd veritaszk

# Install frontend dependencies
cd frontend
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env.local

# Run locally
npm run dev
# → http://localhost:3000

# Leo contract (requires Leo CLI)
cd ../veritaszk
leo build
leo run declare_asset 1u8 1000u64 1field
```

---

## Smart Contract

**Program:** `veritaszk.aleo`  
**Network:** Aleo Testnet  
**Deployment:** Pending testnet faucet (17.73 credits required)

Key transition signatures:
```
fn declare_asset(asset_type: u8, amount: u64, asset_id: field) 
  -> AssetRecord

fn generate_solvency_proof(
  a0: AssetRecord, a1: AssetRecord, a2: AssetRecord, 
  a3: AssetRecord, a4: AssetRecord,
  l0: LiabilityRecord, l1: LiabilityRecord, l2: LiabilityRecord,
  l3: LiabilityRecord, l4: LiabilityRecord,
  timestamp: u32
) -> Future
```

---

## Wave 4 Changelog

**First submission — built entirely in Wave 4:**
- ✅ Complete Leo smart contract — 6 transitions, full privacy model
- ✅ Organization portal — private asset/liability declaration + proof generation
- ✅ Verifier portal — public solvency verification, shareable deep-links
- ✅ Public dashboard — org registry with live proof status
- ✅ ZK proof animation — full-screen generation sequence with matrix rain + particle burst
- ✅ Wallet integration — Leo Wallet + Puzzle Wallet
- ✅ Multi-token support: credits.aleo, USDCx, USAD
- ✅ Simulation mode — full demo journey works without testnet dependency
- ✅ Deployed: https://veritaszk.vercel.app

---

## Wave 5 Roadmap

- Multi-party proof aggregation (prove across multiple wallets)
- Time-locked proofs (auto-expire after N blocks)
- Selective disclosure mode (reveal specific assets to specific verifiers)
- npm SDK — `veritaszk-sdk` for third-party integration
- Mainnet deployment
- Compliance API for regulated entities

---

*VeritasZK — Prove Solvency. Reveal Nothing.*
