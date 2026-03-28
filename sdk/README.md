# veritaszk-sdk

Zero-knowledge solvency verification for Aleo.
Verify any organization's proof of solvency in 3 lines of code —
without seeing their financial data.

## Install
```bash
npm install veritaszk-sdk
```

## Usage
```typescript
import { VeritasZK } from "veritaszk-sdk"

const client = new VeritasZK({ network: "testnet" })

// Verify an organization's solvency
const result = await client.verifySolvency("aleo1abc...")
console.log(result.isSolvent)         // true
console.log(result.timestamp)         // proof timestamp
console.log(result.verificationCount) // times verified
// Note: no amounts, no asset types, no financial data returned

// Get organization info
const org = await client.getOrgInfo("aleo1abc...")
console.log(org?.isActive) // true

// One-line convenience function
import { verifySolvency } from "veritaszk-sdk"
const { isSolvent } = await verifySolvency("aleo1abc...")
```

## What the SDK does NOT return

By design, `veritaszk-sdk` never returns:
- Asset amounts or liability amounts
- Asset types or compositions
- Wallet addresses beyond the one queried
- Any data that could reveal financial strategy

This is guaranteed by the underlying Leo smart contract —
the data does not exist in any queryable public state.

## API Reference

### `new VeritasZK(config?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| network | `"testnet"` \| `"mainnet"` | `"testnet"` | Aleo network |
| rpcUrl | `string` | Aleo testnet RPC | Custom RPC endpoint |
| programId | `string` | `"veritaszk.aleo"` | Contract program ID |

### `client.verifySolvency(address)` → `Promise<SolvencyResult>`

| Field | Type | Description |
|-------|------|-------------|
| isSolvent | boolean | Whether a valid proof exists |
| timestamp | number | When the proof was generated |
| proofNonce | string | BHP256 commitment — not reversible |
| assetCount | number | Number of asset categories declared |
| liabilityCount | number | Number of liability categories declared |
| verificationCount | number | Times this proof has been verified |
| lastChecked | Date | When this query was made |

### `client.getOrgInfo(address)` → `Promise<OrgInfo | null>`

### `client.getVerificationCount(address)` → `Promise<number>`

## Links

- [Live Demo](https://veritaszk.vercel.app)
- [GitHub](https://github.com/Vinaystwt/veritaszk)
- [Aleo Explorer](https://explorer.aleo.org)

Built on [Aleo](https://aleo.org) — privacy by default.
