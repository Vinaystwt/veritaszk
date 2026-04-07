# VeritasZK — Wave 5 Engineering Context
# This file is never committed to GitHub.
# If starting a new QWEN session, read this file first.

## Project
VeritasZK: ZK proof-of-solvency on Aleo.
Tagline: Prove Solvency. Reveal Nothing.
GitHub: https://github.com/Vinaystwt/veritaszk
Frontend: https://veritaszk.vercel.app
Deadline: April 12, 2026 by 5 PM

## Architecture
Three Leo programs with CPI:
- veritaszk_registry.aleo: org identity, credentials, delegation
- veritaszk_core.aleo: proof generation, multi-wallet, expiry, disclosure
- veritaszk_audit.aleo: immutable audit trail, compliance records
CPI chain: registry ← core → audit

## Privacy Model
All amounts in private Records. Public mappings contain only:
booleans, timestamps, counts, BHP256 commitment hashes.
Zero amounts ever in public state.

## Leo Version
v4.0.0 official release only. Never custom builds.
Every program requires @noupgrade constructor() {}

## Shield Wallet Fix
Bypass @provablehq/aleo-wallet-adaptor-shield entirely.
Use window.shield.requestTransaction() directly.
Poll window.shield.publicKey with exponential backoff after connect().

## Deployment Addresses (CONFIRMED LIVE ON ALEO TESTNET)

veritaszk_registry.aleo
  TX: at1m2tzwdtwh5c9xjvq9ux3lhwt6nlnpmq7awu7snkwp8ve65605ugsk7kj5e
  Explorer: https://explorer.aleo.org/program/veritaszk_registry.aleo
  Transitions: register_org, issue_verifier_credential,
               delegate_prover, revoke_credential

veritaszk_audit.aleo
  TX: at106j80dcfdrzvvc9j5tjevvc0084crn54r4dslwe5gtup9p2mpqyqu3jcms
  Explorer: https://explorer.aleo.org/program/veritaszk_audit.aleo
  Transitions: record_proof_event, flag_proof_expired,
               record_compliance_disclosure

veritaszk_core.aleo
  TX: at17u8flq6zlyyjhu72matz90ezhyfqsk5r7jy8ek5k6cdrx0gequxs9z5jme
  Explorer: https://explorer.aleo.org/program/veritaszk_core.aleo
  Transitions: commit_position, prove_solvency,
               prove_solvency_multi_wallet, verify_solvency,
               selective_disclose, prove_threshold, revoke_proof

Deploy wallet: aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00
Remaining balance: ~26 ALEO

## CPI Architecture Note
Registry validation enforced at application layer due to Leo
v4.0.0 CPI finalize mapping read compiler bug. Import statements
remain in core for architectural clarity. Document honestly in
README "What Works / What's Planned" section.

## Leo v4.0.0 Confirmed Working Syntax
- fn keyword (not async transition)
- final {} inline blocks (not async function)
- Mapping::set/get only inside final {} blocks
- block.height only accessible inside final {}
- Deploy: --priority-fees (plural) + --broadcast flag required
- CPI finalize mapping reads: compiler bug, use app-layer validation

## Test Transaction
register_org test TX:
at1swgrxxpmuwk5w9a3xpnmddc0256wue8833r0mscst9t5y2429vfqxj93w0

## Git Commit Method (NON-NEGOTIABLE — EVERY COMMIT)
Always use commit-tree method. Never git commit.
Branch: master
Author: Vinay <vinay11123sharma@gmail.com>
Email: vinay11123sharma@gmail.com

## npm Packages (PUBLISHED AND LIVE)

veritaszk-sdk @0.2.1
  URL: https://www.npmjs.com/package/veritaszk-sdk
  Install: npm install veritaszk-sdk
  Exports: verifySolvency, batchVerify, getAuditTrail,
           isRegistered, getVerificationCount, isProofExpired,
           useSolvencyStatus, useAuditTrail, VeritasZKWebhook
  Note: published as 0.2.1 (0.2.0 already existed on npm)

veritaszk-mcp @0.1.1
  URL: https://www.npmjs.com/package/veritaszk-mcp
  Note: published as veritaszk-mcp (not @veritaszk/mcp)
  Run: npx veritaszk-mcp
  Tools: check_solvency, get_proof_details, get_audit_trail,
         list_verified_orgs, request_verification

veritaszk-cli @0.1.1
  URL: https://www.npmjs.com/package/veritaszk-cli
  Note: published as veritaszk-cli (not @veritaszk/cli)
  Run: npx veritaszk-cli verify <commitment>
  Commands: verify, list, proof, watch

## API Endpoints (LIVE ON VERCEL)
GET /api/health
GET /api/verify/[commitment]
Both CORS enabled.

## Frontend Pages (ALL LIVE ON VERCEL)
/ (landing)        - Full redesign, design system, live stats
/organization      - 5-step form, Shield Wallet, demo mode
/verifier          - Search + verify, audit trail, compliance report
/public            - Live dashboard, filters, sort, auto-refresh
/vision            - Editorial long-form, 5 sections
/docs              - 8 sections, sticky sidebar, correct SDK docs
/org/[commitment]  - Dynamic profile, timeline, badge embed
/enterprise        - 4 use cases, 4 integration cards
/badge.js          - Standalone embed widget in /public/

## Design System (frontend/src/components/ui/)
Components: StatusBadge, CommitmentDisplay, StatsCounter,
            LoadingSpinner, CodeBlock, GlassCard
CSS tokens: --bg-base, --bg-surface, --bg-elevated,
            --accent-primary (#10b981), --status-active,
            --status-expiring, --status-expired,
            --text-primary, --text-secondary, --font-mono
Font: Inter (Google Fonts)

## Route Structure
/organization  → frontend/src/app/organization/page.tsx
/verifier      → frontend/src/app/verifier/page.tsx
/public        → frontend/src/app/public/page.tsx
/vision        → frontend/src/app/vision/page.tsx
/docs          → frontend/src/app/docs/page.tsx
/org/[commitment] → frontend/src/app/org/[commitment]/page.tsx
/enterprise    → frontend/src/app/enterprise/page.tsx

## Bot (NOT YET DEPLOYED TO RAILWAY)
Files: bot/src/index.ts, bot/railway.toml, bot/Procfile
Local /health: working
Railway deployment: PENDING — Vinay must do this manually
at https://railway.app (connect Vinaystwt/veritaszk repo,
root directory: bot, env var: PORT=3001)

## Known Frontend Issues (TO BE FIXED NEXT)
The following issues exist in the current deployed frontend
and will be fixed in the next task:

LANDING PAGE:
- Stats bar shows 0/0/0 — live testnet query may not be
  returning data correctly
- Large empty gap between hero and stats bar
- Matrix rain / atmospheric background not visible

ORGANIZATION PAGE:
- "Organization Portal" heading and content has no left
  padding — touches viewport edge
- "Shield extension not detected" needs better styling
- Large empty white space below the step form content
- Step tracker icons look like placeholder system icons

DOCS PAGE:
- Left sidebar navigation links highlight incorrectly
- Some content sections may still have old API references

VISION PAGE:
- Body text has no left margin — touches viewport left edge
- Pull quote has no emerald left border treatment
- Text lines stretch full viewport width (no max-width)

PUBLIC DASHBOARD:
- "Dashboard" is highlighted in navbar instead of nothing
  (route is /public but nav link says Dashboard)
- Stats show 0/0/0 — empty state is showing correctly
  but the X icon in empty state card looks wrong

VERIFY PAGE:
- Oversized shield icon circle at top
- Page still feels sparse despite added content sections

## Phase Status
Phase 0: COMPLETE
Phase 1: COMPLETE — 3 programs deployed, 14/14 transitions
Phase 2: COMPLETE — SDK, MCP, CLI, REST API published
Phase 3: COMPLETE (frontend built) — fixes pending
Phase 4 (next): Frontend polish fixes + README revamp
Phase 5 (after): Final testing + submission prep

## Current State — End of Day April 7, 2026

### What is Done and Live
- Three Leo programs deployed on Aleo Testnet (Phase 1 complete)
  - veritaszk_registry.aleo
  - veritaszk_core.aleo
  - veritaszk_audit.aleo
  - Deploy address: aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00
- Three npm packages published (Phase 2 complete)
  - veritaszk-sdk @0.2.1
  - veritaszk-mcp @0.1.1
  - veritaszk-cli @0.1.1
- REST API live: /api/verify/[commitment] and /api/health
- All 8 frontend pages deployed at https://veritaszk.vercel.app
  (all routes returning 200)
- Proof monitor bot built but NOT deployed to Railway yet
  (Vinay must deploy manually at railway.app)

### Frontend Status — HONEST ASSESSMENT
The frontend is built and live but has known visual issues
that survived multiple fix attempts:
- Organization page: content padding not visibly applying
- Public dashboard: content padding not visibly applying
- Vision page: body text padding not visibly applying
- Public nav: Dashboard link still highlighting incorrectly
- Organization page: large empty space below form

Decision: Frontend will be completely rebuilt from scratch
after competitor analysis and feature additions. Do not
attempt further incremental fixes on current frontend.

### What is NOT Done
- Bot not deployed to Railway
- Shield Wallet end-to-end transaction not tested live
- README not updated for Wave 5
- Submission write-up not written
- Demo video not recorded

## Plan — April 8 onwards

### Step 1: Sync all tools
- Create Executor Chat 3 (new Claude chat)
- Sync Claude Code with current state
- This chat (Chat 2) generates handoff doc for Chat 3

### Step 2: Competitor analysis (Claude Code)
- Deep analysis of NullPay website and features
- Deep analysis of Veiled Markets
- Deep analysis of ZKPerp
- Output: feature gap analysis and differentiation report

### Step 3: Feature additions
- Based on competitor analysis, identify high-impact
  features that can be built in 1-2 days
- Implement features that add real moving parts
- Priority: working transactions, not visual polish

### Step 4: Complete frontend rebuild from scratch
- New frontend built after features are finalized
- Reference: NullPay quality bar
- Built by QWEN with Claude Code spec

### Step 5: Final testing and submission
- Shield Wallet end-to-end testing
- Bot Railway deployment
- README update
- Demo video (Loom)
- AKINDO submission before 5 PM April 12

## Key Decisions

- Frontend will be rebuilt from scratch — not incrementally fixed
- QWEN handles all code execution autonomously
- Claude Code handles competitor analysis and feature ideation
- Chat 2 (this chat) handles strategy, planning, green-light gating
- Executor Chat 3 will be created tomorrow as the new
  primary strategy chat going forward
- All commits must use commit-tree method, author Vinay only
- Package names: veritaszk-sdk, veritaszk-mcp, veritaszk-cli
  (no @veritaszk/ scope — npm org does not exist)

## Current State — End of Day April 7, 2026 (Updated)

### Live and Deployed
- veritaszk_registry.aleo — deployed on Aleo Testnet
- veritaszk_core.aleo — deployed on Aleo Testnet
- veritaszk_audit.aleo — deployed on Aleo Testnet
- Deploy address: aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00
- veritaszk-sdk @0.2.1 — live on npm
- veritaszk-mcp @0.1.1 — live on npm
- veritaszk-cli @0.1.1 — live on npm
- All 8 pages live at https://veritaszk.vercel.app (all routes returning 200)

### NOT Done
- Bot not deployed to Railway
- Shield Wallet not tested live
- README not updated for Wave 5
- Submission write-up not done
- Demo video not recorded

### Frontend Decision
Current frontend will be completely rebuilt from scratch.
No further incremental fixes to current frontend.
QWEN will use its design skills to make all design
decisions autonomously during the rebuild.
Design decisions — typography, spacing, layout, colors,
components — are fully QWEN's responsibility during rebuild.

### Key Rules (never change these)
- All commits: commit-tree method only, never git commit
- Branch: master
- Author: Vinay <vinay11123sharma@gmail.com>
- Package names: veritaszk-sdk / veritaszk-mcp / veritaszk-cli
  (no @veritaszk/ scope — npm org does not exist)
- Zero references to prizes, competition, judges anywhere
  in user-facing text

### Phase Status
Phase 0: COMPLETE
Phase 1: COMPLETE — 3 programs deployed, 14/14 transitions
Phase 2: COMPLETE — SDK, MCP, CLI, REST API published
Phase 3: COMPLETE — all 8 pages built and live
Phase 4: PENDING — competitor analysis + feature additions
Phase 5: PENDING — complete frontend rebuild from scratch
Phase 6: PENDING — testing + README + submission
