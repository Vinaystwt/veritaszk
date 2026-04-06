# veritaszk-mcp

MCP (Model Context Protocol) server for
[VeritasZK](https://veritaszk.vercel.app) — the first
zero-knowledge proof-of-solvency system on Aleo.

Lets AI agents (Claude, GPT, and any MCP-compatible client)
query live solvency proofs directly from the Aleo blockchain.
Organizations prove assets exceed liabilities without revealing
any financial data. AI agents verify this in real time.

## Quick Start

No installation required:
```bash
npx veritaszk-mcp
```

## Claude Desktop Setup

Add to `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "veritaszk": {
      "command": "npx",
      "args": ["-y", "veritaszk-mcp"]
    }
  }
}
```

Restart Claude Desktop. You can now ask Claude:
- *"Is aleo1... solvent?"*
- *"Get proof details for aleo1..."*
- *"Show the audit trail for aleo1..."*

## Available Tools

| Tool | Description |
|------|-------------|
| `check_solvency` | Check if an org has a valid ZK solvency proof on Aleo |
| `get_proof_details` | Full metadata: timestamp, expiry, threshold, verification count |
| `get_audit_trail` | Proof event history from veritaszk_audit.aleo |
| `list_verified_orgs` | Protocol info and link to public dashboard |
| `request_verification` | Get command to trigger on-chain verification |

## Example Claude Interaction

After setup, ask Claude:

> *Check the solvency of aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00*

Claude will call `check_solvency` and return:
```
VeritasZK Solvency Check
Organization: aleo1cdmu479...
Status:       ✓ SOLVENT
Verified by:  12 parties
Expires at:   block 147857
Network: Aleo Testnet
```

## How It Works

VeritasZK runs three Leo programs on Aleo:
```
veritaszk_registry.aleo  — organization identity
         ↑
veritaszk_core.aleo  ──→  veritaszk_audit.aleo
ZK proof generation       immutable audit trail
```

All queries read public Aleo testnet mappings.
Private financial data is mathematically inaccessible —
not encrypted with a recoverable key, but proven via ZK.

## What the MCP Server Does NOT Return

By design, no tool in this server can return:
- Asset amounts or liability amounts
- Wallet addresses beyond the org commitment
- Asset types or portfolio composition
- Any data that could reveal financial strategy

This is guaranteed by the underlying Leo contracts.

## Related Packages

- [veritaszk-sdk](https://www.npmjs.com/package/veritaszk-sdk) — TypeScript SDK with React hooks and webhook support
- [veritaszk-cli](https://www.npmjs.com/package/veritaszk-cli) — Terminal queries for solvency proofs

## Links

- [Live Dashboard](https://veritaszk.vercel.app)
- [GitHub](https://github.com/Vinaystwt/veritaszk)
- [Aleo Explorer — Core Program](https://explorer.aleo.org/program/veritaszk_core.aleo)

Built on Aleo — privacy by default.
