# veritaszk-cli

Command-line tool for [VeritasZK](https://veritaszk.vercel.app)
— the first zero-knowledge proof-of-solvency system on Aleo.

Query live solvency proofs from your terminal. No wallet
required for read-only verification.

## Quick Start

```bash
npx veritaszk-cli verify aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00
```

## Commands

### verify

Check solvency status of any organization:

```bash
npx veritaszk-cli verify aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00
```

```
VeritasZK Solvency Check
────────────────────────────────────────────
Organization: aleo1cdmu479q6duu3...9qxq0w9r00
Status:       ✓ SOLVENT
Proven at:    block 142857
Expires at:   block 147857
Verified by:  12 parties
Threshold:    100% buffer (assets > 2× liabilities)
────────────────────────────────────────────
Network: Aleo Testnet | veritaszk_core.aleo
```

### list

Show protocol info and deployed programs:

```bash
npx veritaszk-cli list
```

### proof

Get full proof metadata:

```bash
# Human-readable table (default)
npx veritaszk-cli proof aleo1...

# JSON output for scripting
npx veritaszk-cli proof aleo1... --format json
```

JSON output includes: `org_commitment`, `is_solvent`,
`proof_timestamp_block`, `expiry_block`, `verification_count`,
`threshold_level`, `audit_event_count`, `last_proof_block`.

### watch

Poll solvency status every 30 seconds:

```bash
npx veritaszk-cli watch aleo1...
# Ctrl+C to stop
```

Prints a timestamped line each poll cycle.
Flags changes with `← CHANGED` when status or
verification count updates.

## CI/CD Integration

Use the JSON output in scripts:

```bash
RESULT=$(npx veritaszk-cli proof aleo1... --format json)
IS_SOLVENT=$(echo $RESULT | node -e "
  let d=''; process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>
    console.log(JSON.parse(d).is_solvent))
")
echo "Solvent: $IS_SOLVENT"
```

## What the CLI Does NOT Return

By design, no command returns:
- Asset amounts or liability amounts
- Wallet addresses or portfolio composition
- Any data that would reveal financial strategy

This is guaranteed by the underlying Leo contracts —
the data does not exist in any queryable public state.

## Related Packages

- [veritaszk-sdk](https://www.npmjs.com/package/veritaszk-sdk) — TypeScript SDK with React hooks and webhook support
- [veritaszk-mcp](https://www.npmjs.com/package/veritaszk-mcp) — MCP server for AI agent integration (Claude Desktop)

## Links

- [Live Dashboard](https://veritaszk.vercel.app)
- [GitHub](https://github.com/Vinaystwt/veritaszk)
- [Aleo Explorer](https://explorer.aleo.org/program/veritaszk_core.aleo)

Built on Aleo — privacy by default.
