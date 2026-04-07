// VeritasZK Threshold — Programmable confidence tier range proofs
// 4th program in the VeritasZK ecosystem: registry ← core → audit + registry ← threshold
//
// Organizations prove solvency at a chosen confidence tier without revealing amounts.
// Public output: ONLY tier number (1-4) and is_solvent boolean.
// Tier mapping: 1=Standard (1.0x), 2=Verified (1.5x), 3=Strong (2.0x), 4=Institutional (3.0x)

program veritaszk_threshold.aleo {

    // ─── Structs ─────────────────────────────────────────────────────

    struct AssetBundle {
        native_credits: u64,
        stablecoin_usd: u64,
        btc_equivalent: u64,
        other_assets: u64,
    }

    // ─── Records (private — amounts never appear on-chain) ───────────

    record TierProofRecord {
        owner: address,
        org_commitment: field,
        tier_achieved: u8,
        is_solvent: bool,
        proof_nonce: field,
    }

    // ─── Public Mappings (zero amounts, zero sensitive data) ─────────

    mapping tier_results: field => u8;         // org_commitment → tier number (1-4)
    mapping tier_is_solvent: field => bool;    // org_commitment → solvency boolean
    mapping tier_block: field => u32;          // org_commitment → block when proved

    // ─── Transition 1: Prove threshold solvency ──────────────────────
    // Private inputs: multi-asset bundle, total liabilities, org commitment, nonce
    // Public input: target tier (1-4)
    // Output: TierProofRecord to caller, public mappings updated
    //
    // Tier multipliers (integer arithmetic only — no floats):
    //   Tier 1 (Standard):     assets >= liabilities          (1.0x)
    //   Tier 2 (Verified):     assets * 2 >= liabilities * 3  (1.5x)
    //   Tier 3 (Strong):       assets >= liabilities * 2      (2.0x)
    //   Tier 4 (Institutional): assets >= liabilities * 3     (3.0x)
    fn prove_threshold(
        private assets: AssetBundle,
        private liabilities: u64,
        private org_commitment: field,
        private proof_nonce: field,
        public tier_target: u8
    ) -> (TierProofRecord, Final) {
        // Aggregate all asset types into u128 to prevent overflow
        let total_assets: u128 =
            assets.native_credits as u128 +
            assets.stablecoin_usd as u128 +
            assets.btc_equivalent as u128 +
            assets.other_assets as u128;

        let total_liabilities: u128 = liabilities as u128;

        // Enforce the chosen tier threshold using integer arithmetic
        if tier_target == 1u8 {
            assert(total_assets >= total_liabilities);
        } else if tier_target == 2u8 {
            assert(total_assets * 2u128 >= total_liabilities * 3u128);
        } else if tier_target == 3u8 {
            assert(total_assets >= total_liabilities * 2u128);
        } else if tier_target == 4u8 {
            assert(total_assets >= total_liabilities * 3u128);
        } else {
            // Invalid tier — reject
            assert(false);
        }

        // Create the private proof record for the caller
        let proof: TierProofRecord = TierProofRecord {
            owner: self.caller,
            org_commitment: org_commitment,
            tier_achieved: tier_target,
            is_solvent: true,
            proof_nonce: proof_nonce,
        };

        return (proof, final {
            Mapping::set(tier_results, org_commitment, tier_target);
            Mapping::set(tier_is_solvent, org_commitment, true);
            Mapping::set(tier_block, org_commitment, block.height);
        });
    }

    // ─── Transition 2: Verify tier (public read) ─────────────────────
    // Anyone can verify an org's tier and solvency status.
    // Reads from public mappings. Increments no state — read-only assertion.
    fn verify_tier(public org_commitment: field) -> Final {
        return final {
            let solvent: bool = Mapping::get_or_use(tier_is_solvent, org_commitment, false);
            assert(solvent);
        };
    }

    // ─── Transition 3: Revoke tier proof ─────────────────────────────
    // Only the proof owner can revoke their own tier attestation.
    // Sets is_solvent to false in public mapping. Record remains private.
    fn revoke_tier_proof(
        private tier_proof: TierProofRecord,
        public org_commitment: field
    ) -> Final {
        // Authorization: only the record owner can revoke
        assert_eq(tier_proof.owner, self.caller);
        // Sanity: the commitment must match the record
        assert_eq(tier_proof.org_commitment, org_commitment);
        return final {
            Mapping::set(tier_is_solvent, org_commitment, false);
        };
    }

    @noupgrade
    constructor() {}
}
