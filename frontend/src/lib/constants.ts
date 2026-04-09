export const RAILWAY_BASE = 'https://veritaszk-production.up.railway.app'
export const EXPLORER_BASE = 'https://testnet.explorer.provable.com'

export const PROGRAMS = [
  {
    id: 'veritaszk_registry.aleo',
    txHash: 'at1syv4aged4jk0gspqyadeq7sq40yga2x85kxc7pcyj60w9vydzczq3mj3at',
    transitions: [
      'register_org', 'issue_verifier_credential', 'delegate_prover',
      'revoke_credential', 'delegate_proof_authority', 'register_org_name',
    ],
    description: 'Organization identity, credentials, and delegation',
    explorerUrl: `${EXPLORER_BASE}/program/veritaszk_registry.aleo`,
  },
  {
    id: 'veritaszk_core.aleo',
    txHash: 'at19tn3me0tm5sct8q2a3zwz0ffkujtztz9td04psrjj3pmcencj5gse7yv3y',
    transitions: [
      'commit_position', 'prove_solvency', 'prove_solvency_multi_wallet',
      'verify_solvency', 'selective_disclose', 'prove_threshold',
      'revoke_proof', 'revoke_proof_record', 'submit_proof_with_expiry', 'refresh_proof',
    ],
    description: 'Proof generation, multi-wallet support, expiry, selective disclosure',
    explorerUrl: `${EXPLORER_BASE}/program/veritaszk_core.aleo`,
  },
  {
    id: 'veritaszk_audit.aleo',
    txHash: 'at1jqffrkx5tepef74nvqhmzscywg2ulx8p9ejf70gxj873l07lhgrqdhggfa',
    transitions: [
      'record_proof_event', 'flag_proof_expired',
      'record_compliance_disclosure', 'log_verification', 'link_proof_history',
    ],
    description: 'Immutable audit trail and compliance disclosure records',
    explorerUrl: `${EXPLORER_BASE}/program/veritaszk_audit.aleo`,
  },
  {
    id: 'veritaszk_threshold.aleo',
    txHash: 'at1j9ghj3zu5a9n47t07nsyj3uu6f5q6g54u8vn22gse68e428lacqq7ugnz4',
    transitions: ['prove_threshold', 'verify_tier', 'revoke_tier_proof'],
    description: 'Multi-asset bundle threshold proofs and tier attestation',
    explorerUrl: `${EXPLORER_BASE}/program/veritaszk_threshold.aleo`,
  },
]

export const TIERS = [
  {
    tier: 1,
    name: 'Standard',
    ratio: 1.0,
    label: '≥ 1.0×',
    color: '#8888a0',
    description: 'You have enough. Assets cover all liabilities. The minimum threshold for operational solvency.',
    regulatory: 'Baseline solvency under general accounting standards',
  },
  {
    tier: 2,
    name: 'Verified',
    ratio: 1.5,
    label: '≥ 1.5×',
    color: '#4fffb0',
    description: 'You have a buffer. 50% more in assets than liabilities.',
    regulatory: 'Basel III Tier 1 Capital adequacy',
  },
  {
    tier: 3,
    name: 'Strong',
    ratio: 2.0,
    label: '≥ 2.0×',
    color: '#e5ff4f',
    description: 'Substantial reserves. Double the liabilities covered.',
    regulatory: 'Solvency II SCR / MiCA Article 76',
  },
  {
    tier: 4,
    name: 'Institutional',
    ratio: 3.0,
    label: '≥ 3.0×',
    color: '#ffffff',
    description: 'Fortress-level reserves. Triple coverage.',
    regulatory: 'Basel III advanced IRB / Insurance SCR buffer',
  },
]

export const DEMO_ORGS = [
  {
    commitment: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    orgName: 'DemoExchange',
    tier: 4,
    tierName: 'Institutional',
    status: 'active' as const,
    coverageRatio: 3.75,
    assets: 3000000,
    liabilities: 800000,
    verificationCount: 147,
    expiringsSoon: false,
  },
  {
    commitment: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    orgName: 'TestFund',
    tier: 3,
    tierName: 'Strong',
    status: 'active' as const,
    coverageRatio: 2.22,
    assets: 2000000,
    liabilities: 900000,
    verificationCount: 89,
    expiringsSoon: false,
  },
  {
    commitment: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    orgName: 'SampleDAO',
    tier: 2,
    tierName: 'Verified',
    status: 'active' as const,
    coverageRatio: 1.67,
    assets: 1500000,
    liabilities: 900000,
    verificationCount: 54,
    expiringsSoon: false,
  },
  {
    commitment: 'd4e5f6789012345678901234567890abcdef1234567890abcdef12345678901',
    orgName: 'ProtoLending',
    tier: 1,
    tierName: 'Standard',
    status: 'active' as const,
    coverageRatio: 1.05,
    assets: 1000000,
    liabilities: 950000,
    verificationCount: 23,
    expiringsSoon: true,
  },
]

export const SZABO_SENTENCE = "A ZK-native implementation of Nick Szabo's 1993 confidential auditing protocol: organizations produce unforgeable, timestamp-anchored solvency attestations using range proofs over private financial data, revealing only a regulatory tier classification aligned with Basel III and Solvency II capital requirements."

export const TRUST_BADGES = [
  '4 Programs Deployed on Aleo Testnet',
  'Live Chain Indexer at Block 15,613,711+',
  'Zero Competitors in ZK Solvency Proof Space',
  'Basel III · Solvency II · MiCA Article 76 Aligned',
  'No Off-Chain Keys — Zero Financial Data Stored by VeritasZK',
]

export const SEED_KEY = 'vzk_demo_seeded_v1'
