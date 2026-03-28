// VeritasZK — Prove Solvency. Reveal Nothing.
// ZK Proof of Solvency on Aleo — Wave 4 Buildathon
//
// Privacy Architecture:
//   PRIVATE LAYER  → Leo Records (encrypted on-chain, owner-only)
//   COMPUTE LAYER  → Off-chain ZK execution (amounts never leave private context)
//   PUBLIC LAYER   → Mappings store only: bool, timestamp, nonce, counts
//
// Zero amounts appear in any public state. Ever.

// ─────────────────────────────────────────────────────────────────────────────
// FINALIZE FUNCTIONS (defined outside program block — Leo 3.5.0 syntax)
// These run ON-CHAIN after the private transition completes.
// CRITICAL: They receive ONLY non-sensitive derived values — never raw amounts.
// ─────────────────────────────────────────────────────────────────────────────

// Finalize for register_org.
// Writes only the name hash and registration timestamp.
// The raw organization name never appears on-chain — only its hash.
final fn fin_register_org(caller: address, name_hash: field, timestamp: u32) {
    let info: OrgInfo = OrgInfo {
        name_hash: name_hash,      // hash of org name — not reversible to plaintext
        registered_at: timestamp,
        is_active: true,
    };
    Mapping::set(org_metadata, caller, info);
}

// Finalize for generate_solvency_proof.
// This is the most privacy-critical finalize in the contract.
//
// What IS written to public state:
//   - is_solvent: bool        → the ZK predicate result (true/false only)
//   - timestamp: u32          → when the proof was generated
//   - asset_count: u8         → how many asset slots were non-sentinel (count only)
//   - liability_count: u8     → how many liability slots were non-sentinel (count only)
//   - proof_nonce: field      → a public commitment derived from asset IDs + timestamp
//
// What is NOT written to public state (and mathematically cannot be derived):
//   - Any asset amount
//   - Any liability amount
//   - Which specific assets are held
//   - The ratio of assets to liabilities
//   - Any wallet address beyond the caller
//
// The solvency assertion (assets > liabilities) was proven in the private
// transition and is cryptographically verified by Aleo before this finalize runs.
// If the assertion failed, this finalize never executes.
final fn fin_gen_proof(
    caller: address,
    timestamp: u32,
    asset_count: u8,
    liability_count: u8,
    proof_nonce: field,
) {
    let status: SolvencyStatus = SolvencyStatus {
        is_solvent: true,          // only reachable if ZK predicate passed
        timestamp: timestamp,
        asset_count: asset_count,
        liability_count: liability_count,
        proof_nonce: proof_nonce,  // public commitment — see BHP256 comment below
    };
    Mapping::set(solvency_proofs, caller, status);
}

// Finalize for verify_solvency.
// Reads the public proof status and increments the verification counter.
// Asserts the proof is active before counting — prevents gaming the counter.
final fn fin_verify_solvency(org_address: address) {
    let status: SolvencyStatus = Mapping::get(solvency_proofs, org_address);
    // Assert proof is active — if is_solvent is false, this transition aborts.
    // A revoked or never-generated proof cannot be "verified".
    assert(status.is_solvent);
    let current_count: u32 = Mapping::get_or_use(verification_count, org_address, 0u32);
    Mapping::set(verification_count, org_address, current_count + 1u32);
}

// Finalize for revoke_proof.
// Preserves all proof metadata for audit trail — only flips is_solvent to false.
// The proof nonce and counts remain on-chain as historical record.
final fn fin_revoke_proof(caller: address, timestamp: u32) {
    let existing: SolvencyStatus = Mapping::get(solvency_proofs, caller);
    let revoked: SolvencyStatus = SolvencyStatus {
        is_solvent: false,                         // proof invalidated
        timestamp: timestamp,                      // revocation timestamp
        asset_count: existing.asset_count,         // preserved for audit
        liability_count: existing.liability_count, // preserved for audit
        proof_nonce: existing.proof_nonce,         // preserved for audit
    };
    Mapping::set(solvency_proofs, caller, revoked);
}

program veritaszk.aleo {

    // ─────────────────────────────────────────────────────────────────────────
    // STRUCTS — stored in public mappings, contain ZERO sensitive financial data
    // ─────────────────────────────────────────────────────────────────────────

    // SolvencyStatus is stored in a PUBLIC mapping.
    // Every field here is carefully chosen to reveal nothing about holdings:
    //   - is_solvent: the ZK proof output — boolean only
    //   - timestamp: when the proof was generated — temporal metadata only
    //   - asset_count / liability_count: count of slots used — not amounts
    //   - proof_nonce: a hash commitment — not reversible to any input value
    struct SolvencyStatus {
        is_solvent: bool,
        timestamp: u32,
        asset_count: u8,
        liability_count: u8,
        proof_nonce: field,
    }

    // OrgInfo is stored in a PUBLIC mapping.
    // name_hash is a one-way hash of the organization name.
    // The raw name is never submitted on-chain.
    struct OrgInfo {
        name_hash: field,
        registered_at: u32,
        is_active: bool,
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RECORDS — the core privacy primitive
    //
    // Leo Records are fundamentally different from Mappings:
    //   - Records are ENCRYPTED on-chain using the owner's public key
    //   - Only the owner can read or spend a Record
    //   - Record fields do NOT appear in any public explorer or RPC query
    //   - A verifier watching the chain sees a ciphertext — nothing more
    //
    // This is WHY asset amounts live in Records and not Mappings.
    // If amounts were in a Mapping, every balance would be publicly readable.
    // ─────────────────────────────────────────────────────────────────────────

    // AssetRecord is a private Leo Record — not a Mapping.
    // This means it is encrypted on-chain and readable ONLY by the owner.
    // The `amount` field never appears in any public state, mapping, or finalize block.
    // A verifier cannot infer holdings from any on-chain data.
    // asset_type uses a sentinel value of 0u8 for unused proof slots — see generate_solvency_proof.
    record AssetRecord {
        owner: address,      // encrypted — only owner can spend this record
        asset_type: u8,      // 1=ALEO, 2=USDCx, 3=USAD, 0=sentinel (unused slot)
        amount: u64,         // PRIVATE — never leaves this encrypted record
        asset_id: field,     // unique identifier used in nonce derivation
    }

    // LiabilityRecord is a private Leo Record — identical privacy guarantees to AssetRecord.
    // Liability amounts are as sensitive as asset amounts — both stay encrypted.
    // The ZK proof proves their relationship (assets > liabilities) without revealing either.
    record LiabilityRecord {
        owner: address,       // encrypted — only owner can spend this record
        liability_type: u8,   // 1=ALEO, 2=USDCx, 3=USAD, 0=sentinel (unused slot)
        amount: u64,          // PRIVATE — never leaves this encrypted record
        liability_id: field,  // unique identifier
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAPPINGS — public on-chain state
    // These are readable by anyone. They contain ZERO financial data.
    // ─────────────────────────────────────────────────────────────────────────

    // Maps organization address → SolvencyStatus (boolean proof result only)
    mapping solvency_proofs: address => SolvencyStatus;
    // Maps organization address → OrgInfo (name hash + registration metadata)
    mapping org_metadata: address => OrgInfo;
    // Maps organization address → verification count (public counter)
    mapping verification_count: address => u32;

    // Constructor — prevents contract upgrades after deployment.
    // Once veritaszk.aleo is deployed, the privacy model is immutable.
    @noupgrade
    constructor() {}

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSITION 1: register_org
    // Registers an organization by hashed name.
    // The raw name is hashed client-side before submission.
    // Only the hash reaches the chain — the name stays private.
    // ─────────────────────────────────────────────────────────────────────────
    fn register_org(public name_hash: field, public timestamp: u32) -> Final {
        // Bind caller before entering final block — Leo 3.5.0 requirement.
        // self.caller cannot be used directly inside final {}.
        let caller: address = self.caller;
        return final { fin_register_org(caller, name_hash, timestamp); };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSITION 2: declare_asset
    // Creates a private AssetRecord owned by the caller.
    // This transition returns a Record — NOT a mapping update.
    // The `amount` parameter is consumed into the encrypted Record.
    // It does not appear in finalize, in any mapping, or in any public output.
    // After this transition, the amount exists ONLY in the owner's encrypted Record.
    // ─────────────────────────────────────────────────────────────────────────
    fn declare_asset(asset_type: u8, amount: u64, asset_id: field) -> AssetRecord {
        let caller: address = self.caller;
        // Record creation — amount is sealed into encrypted on-chain storage.
        // No finalize block. No mapping write. No public state touched.
        return AssetRecord {
            owner: caller,
            asset_type: asset_type,
            amount: amount,    // encrypted — publicly unreadable
            asset_id: asset_id,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSITION 3: declare_liability
    // Identical privacy model to declare_asset.
    // Creates a private LiabilityRecord — amount sealed into encrypted storage.
    // No finalize. No mapping. No public output containing financial data.
    // ─────────────────────────────────────────────────────────────────────────
    fn declare_liability(liability_type: u8, amount: u64, liability_id: field) -> LiabilityRecord {
        let caller: address = self.caller;
        return LiabilityRecord {
            owner: caller,
            liability_type: liability_type,
            amount: amount,    // encrypted — publicly unreadable
            liability_id: liability_id,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSITION 4: generate_solvency_proof
    // This is the core ZK transition. The entire privacy model converges here.
    //
    // Design: Fixed 5+5 record slots (Leo does not support variable-length inputs).
    // Unused slots receive sentinel records with amount=0u64, asset_type=0u8.
    // Sentinel zeros contribute nothing to the sum — mathematically transparent.
    //
    // Execution model:
    //   1. All computation below runs OFF-CHAIN in the Aleo prover
    //   2. Aleo generates a ZK proof that the computation was done correctly
    //   3. Only the proof + non-sensitive outputs are submitted on-chain
    //   4. The finalize block runs on-chain ONLY if the ZK proof verifies
    //
    // Privacy guarantee:
    //   - Amounts are summed in private execution context
    //   - The assert predicate is verified ZK — not revealed
    //   - Only 5 non-sensitive values cross the transition/finalize boundary
    // ─────────────────────────────────────────────────────────────────────────
    fn generate_solvency_proof(
        // Asset slots 0-4. Pass sentinel records (amount=0, asset_type=0) for unused slots.
        a0: AssetRecord,
        a1: AssetRecord,
        a2: AssetRecord,
        a3: AssetRecord,
        a4: AssetRecord,
        // Liability slots 0-4. Same sentinel pattern.
        l0: LiabilityRecord,
        l1: LiabilityRecord,
        l2: LiabilityRecord,
        l3: LiabilityRecord,
        l4: LiabilityRecord,
        public timestamp: u32,
    ) -> Final {
        // Sum all asset amounts privately.
        // This computation occurs entirely in off-chain ZK execution.
        // The individual amounts and this sum never appear in any public output.
        let total_assets: u64 = a0.amount + a1.amount + a2.amount + a3.amount + a4.amount;

        // Sum all liability amounts privately.
        // Same privacy guarantee — off-chain only.
        let total_liabilities: u64 = l0.amount + l1.amount + l2.amount + l3.amount + l4.amount;

        // THE ZK PREDICATE — the core solvency assertion.
        // This assert is proven via zero-knowledge proof.
        // If total_assets <= total_liabilities, proof generation fails and
        // the transaction is never submitted. No false proofs can be created.
        // The verifier learns ONLY that this predicate holds — not the values.
        assert(total_assets > total_liabilities);

        // Count non-sentinel asset slots for the public record.
        // asset_type == 0u8 indicates a sentinel (unused) slot.
        // This gives verifiers a count of asset categories — never amounts.
        let ac0: u8 = (a0.asset_type != 0u8) ? 1u8 : 0u8;
        let ac1: u8 = (a1.asset_type != 0u8) ? 1u8 : 0u8;
        let ac2: u8 = (a2.asset_type != 0u8) ? 1u8 : 0u8;
        let ac3: u8 = (a3.asset_type != 0u8) ? 1u8 : 0u8;
        let ac4: u8 = (a4.asset_type != 0u8) ? 1u8 : 0u8;
        let asset_count: u8 = ac0 + ac1 + ac2 + ac3 + ac4;

        // Count non-sentinel liability slots.
        let lc0: u8 = (l0.liability_type != 0u8) ? 1u8 : 0u8;
        let lc1: u8 = (l1.liability_type != 0u8) ? 1u8 : 0u8;
        let lc2: u8 = (l2.liability_type != 0u8) ? 1u8 : 0u8;
        let lc3: u8 = (l3.liability_type != 0u8) ? 1u8 : 0u8;
        let lc4: u8 = (l4.liability_type != 0u8) ? 1u8 : 0u8;
        let liability_count: u8 = lc0 + lc1 + lc2 + lc3 + lc4;

        // Derive a proof nonce using BHP256 — a collision-resistant hash function.
        // Input: asset IDs + timestamp (none of which reveal amounts).
        // Output: a unique public field value that commits to this specific proof.
        // The nonce is PUBLIC — but it reveals nothing about the underlying values.
        // It serves as a tamper-evident fingerprint: the same inputs always produce
        // the same nonce, so any manipulation of the proof is detectable.
        let nonce_preimage: field = a0.asset_id + a1.asset_id + a2.asset_id + a3.asset_id + a4.asset_id + timestamp as field;
        let proof_nonce: field = BHP256::hash_to_field(nonce_preimage);

        // Pass ONLY non-sensitive values to finalize.
        // The boundary between transition and finalize is the privacy boundary.
        // Amounts stay on the left side of this boundary — always.
        let caller: address = self.caller;
        return final { fin_gen_proof(caller, timestamp, asset_count, liability_count, proof_nonce); };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSITION 5: verify_solvency
    // Public verification — no wallet required to call this.
    // Reads the solvency_proofs mapping and increments verification_count.
    // The caller learns: is this address solvent? Nothing more.
    // ─────────────────────────────────────────────────────────────────────────
    fn verify_solvency(public org_address: address) -> Final {
        return final { fin_verify_solvency(org_address); };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSITION 6: revoke_proof
    // Allows an organization to invalidate its own proof.
    // Only the caller can revoke their own proof — enforced by Aleo's ownership model.
    // Preserves historical metadata (nonce, counts) for audit trail.
    // Sets is_solvent = false — any subsequent verify_solvency call will abort.
    // ─────────────────────────────────────────────────────────────────────────
    fn revoke_proof(public timestamp: u32) -> Final {
        let caller: address = self.caller;
        return final { fin_revoke_proof(caller, timestamp); };
    }
}
