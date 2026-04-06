# veritaszk-sdk

TypeScript SDK for [VeritasZK](https://veritaszk.vercel.app) — the first
zero-knowledge proof-of-solvency system on Aleo.

Organizations prove assets exceed liabilities via ZK proof without revealing
amounts, asset types, or wallet addresses. Anyone can verify the result.
Nobody sees the underlying data. Ever.

## Quick Start

```bash
npm install veritaszk-sdk
```

```typescript
import { verifySolvency } from 'veritaszk-sdk'

const result = await verifySolvency('aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00')
console.log(result.isSolvent)          // true — no amounts revealed
console.log(result.verificationCount)  // times verified on-chain
```

## Architecture

VeritasZK runs three Leo programs on Aleo Testnet in a CPI chain:

```
veritaszk_registry.aleo  (org identity, credentials, delegation)
         ↑
veritaszk_core.aleo ──→ veritaszk_audit.aleo
(ZK proof generation)    (immutable audit trail)
```

This SDK queries public mappings across all three programs.
Private financial data is mathematically inaccessible — the amounts
exist only in encrypted Leo Records.

## API Reference

### Core Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `verifySolvency(commitment)` | Full solvency status for one org | `Promise<SolvencyStatus>` |
| `batchVerify(commitments[])` | Check multiple orgs in parallel | `Promise<BatchVerifyResult[]>` |
| `isRegistered(commitment)` | Check if org is in registry | `Promise<boolean>` |
| `getAuditTrail(commitment)` | Proof event history from audit program | `Promise<AuditEvent>` |
| `getVerificationCount(commitment)` | Number of on-chain verifications | `Promise<number>` |
| `isProofExpired(commitment)` | Check if proof has expired | `Promise<boolean>` |

### React Hooks

| Hook | Description |
|------|-------------|
| `useSolvencyStatus(commitment)` | Auto-refreshing solvency status (polls every 30s) |
| `useAuditTrail(commitment)` | Fetches audit event history on mount |

### Webhook

| Class | Description |
|-------|-------------|
| `VeritasZKWebhook` | Polls solvency status and POSTs to your webhook URL on state changes |

## Usage

### Verify a single organization

```typescript
import { verifySolvency } from 'veritaszk-sdk'

const status = await verifySolvency('aleo1...')
// {
//   orgCommitment: 'aleo1...',
//   isSolvent: true,
//   timestamp: 142857,
//   expiryBlock: 147857,
//   verificationCount: 12,
//   thresholdLevel: 2,
//   hasMultiWallet: false,
//   isExpired: false,
//   lastProofBlock: 142857
// }
```

### Batch verification

```typescript
import { batchVerify } from 'veritaszk-sdk'

const results = await batchVerify([
  'aleo1abc...',
  'aleo1def...',
])
// [{ orgCommitment: 'aleo1abc...', isSolvent: true }, ...]
```

### Check registry

```typescript
import { isRegistered } from 'veritaszk-sdk'

const registered = await isRegistered('aleo1...')
// true — organization has registered via veritaszk_registry.aleo
```

### Audit trail

```typescript
import { getAuditTrail } from 'veritaszk-sdk'

const trail = await getAuditTrail('aleo1...')
// {
//   orgCommitment: 'aleo1...',
//   eventCount: 5,
//   lastProofBlock: 142857,
//   isExpired: false
// }
```

### React hooks

```tsx
import { useSolvencyStatus } from 'veritaszk-sdk/react'

function SolvencyBadge({ commitment }: { commitment: string }) {
  const { status, loading, error } = useSolvencyStatus(commitment)

  if (loading) return <span>Checking...</span>
  if (error) return <span>Error: {error}</span>
  if (!status) return null

  return (
    <span style={{ color: status.isSolvent ? '#10b981' : '#ef4444' }}>
      {status.isSolvent ? '✓ SOLVENT' : '✗ NOT SOLVENT'}
    </span>
  )
}
```

### Webhook monitoring

```typescript
import { VeritasZKWebhook } from 'veritaszk-sdk/webhooks'

const webhook = new VeritasZKWebhook({
  url: 'https://your-server.com/webhook',
  events: ['proof.generated', 'proof.expired', 'proof.revoked'],
  orgCommitment: 'aleo1...',
  pollIntervalMs: 60000,
})

webhook.start()
// POSTs to your URL whenever solvency state changes
```

## What the SDK Does NOT Return

By design, no function in this SDK can return:

- Asset amounts or liability amounts
- Wallet addresses beyond the org commitment
- Asset types or portfolio composition
- Any data that could reveal financial strategy

This is guaranteed by the underlying Leo contracts — the data does not
exist in any queryable public state on Aleo.

## Deployed Programs

| Program | Explorer |
|---------|----------|
| `veritaszk_registry.aleo` | [Explorer](https://explorer.aleo.org/program/veritaszk_registry.aleo) |
| `veritaszk_core.aleo` | [Explorer](https://explorer.aleo.org/program/veritaszk_core.aleo) |
| `veritaszk_audit.aleo` | [Explorer](https://explorer.aleo.org/program/veritaszk_audit.aleo) |

## Related Packages

- [veritaszk-mcp](https://www.npmjs.com/package/veritaszk-mcp) — MCP server for AI agent integration (Claude Desktop)
- [veritaszk-cli](https://www.npmjs.com/package/veritaszk-cli) — Terminal queries for solvency proofs

## Links

- [Live Dashboard](https://veritaszk.vercel.app)
- [GitHub](https://github.com/Vinaystwt/veritaszk)
- [Aleo Explorer](https://explorer.aleo.org/program/veritaszk_core.aleo)
- [Documentation](https://veritaszk.vercel.app/docs)

Built on Aleo — privacy by default.
