// VeritasZK Core — ZK solvency proof logic with CPI architecture
// CPI chain: registry ← core → audit
//
// CPI design: Registry validation occurs at the application layer.
// The frontend calls register_org in the registry before calling prove_solvency.
// Core focuses on the privacy-critical solvency proof logic.

import veritaszk_registry.aleo;
import veritaszk_audit.aleo;

program veritaszk_core.aleo {

    // ─── Records (private, amounts never public) ─────────────────────

    record AssetRecord {
        owner: address,
        amount: u128,
        asset_type: u8,
    }

    record DisclosureRecord {
        owner: address,
        org_commitment: field,
        asset_type: u8,
    }

    // ─── Public Mappings (zero amounts, zero sensitive data) ─────────

    mapping solvency_proofs: field => bool;
    mapping proof_timestamps: field => u32;
    mapping proof_expiry: field => u32;
    mapping asset_commitments: field => field;
    mapping verification_counts: field => u32;
    mapping multi_wallet_commitments: field => field;
    mapping threshold_proofs: field => u8;

    // ─── Transition 1: Commit position ───────────────────────────────
    // Stores a hashed position commitment for later proof verification
    fn commit_position(
        private assets: AssetRecord,
        private liabilities_total: u128,
        private nonce: field
    ) -> (AssetRecord, Final) {
        let commitment: field = Poseidon2::hash_to_field(
            assets.amount + liabilities_total
        );
        let salted_commitment: field = BHP256::hash_to_field(
            commitment + nonce
        );
        let org_key: field = BHP256::hash_to_field(assets.owner as field);

        let unchanged: AssetRecord = AssetRecord {
            owner: assets.owner,
            amount: assets.amount,
            asset_type: assets.asset_type,
        };

        return (unchanged, final {
            Mapping::set(asset_commitments, org_key, salted_commitment);
        });
    }

    // ─── Transition 2: Prove solvency ────────────────────────────────
    // Core ZK predicate: assets exceed liabilities, proven privately
    fn prove_solvency(
        private assets: AssetRecord,
        private liabilities_total: u128,
        private nonce: field,
        public org_commitment: field,
        public expiry_blocks: u32
    ) -> (AssetRecord, Final) {
        // THE ZK PREDICATE — proved without revealing either value
        assert(assets.amount > liabilities_total);

        let commitment: field = Poseidon2::hash_to_field(
            assets.amount + liabilities_total
        );
        let salted_commitment: field = BHP256::hash_to_field(
            commitment + nonce
        );
        let org_key: field = BHP256::hash_to_field(assets.owner as field);

        let unchanged: AssetRecord = AssetRecord {
            owner: assets.owner,
            amount: assets.amount,
            asset_type: assets.asset_type,
        };

        return (unchanged, final {
            // Validate commitment matches stored position
            let stored: field = Mapping::get(asset_commitments, org_key);
            assert_eq(stored, salted_commitment);

            // Write proof result — boolean only, zero amounts exposed
            Mapping::set(solvency_proofs, org_commitment, true);
            Mapping::set(proof_timestamps, org_commitment, block.height);
            let expiry: u32 = block.height + expiry_blocks;
            Mapping::set(proof_expiry, org_commitment, expiry);
        });
    }

    // ─── Transition 3: Multi-wallet proof aggregation ────────────────
    // Proves combined assets across two wallets exceed liabilities
    fn prove_solvency_multi_wallet(
        private assets1: AssetRecord,
        private assets2: AssetRecord,
        private liabilities_total: u128,
        private nonce: field,
        public org_commitment: field,
        public expiry_blocks: u32
    ) -> (AssetRecord, AssetRecord, Final) {
        let total_assets: u128 = assets1.amount + assets2.amount;
        assert(total_assets > liabilities_total);

        let commitment: field = Poseidon2::hash_to_field(
            total_assets + liabilities_total
        );
        let salted_commitment: field = BHP256::hash_to_field(
            commitment + nonce
        );

        let unchanged1: AssetRecord = AssetRecord {
            owner: assets1.owner,
            amount: assets1.amount,
            asset_type: assets1.asset_type,
        };
        let unchanged2: AssetRecord = AssetRecord {
            owner: assets2.owner,
            amount: assets2.amount,
            asset_type: assets2.asset_type,
        };

        return (unchanged1, unchanged2, final {
            Mapping::set(multi_wallet_commitments, org_commitment, salted_commitment);
            Mapping::set(solvency_proofs, org_commitment, true);
            Mapping::set(proof_timestamps, org_commitment, block.height);
            let expiry: u32 = block.height + expiry_blocks;
            Mapping::set(proof_expiry, org_commitment, expiry);
        });
    }

    // ─── Transition 4: Verify solvency (public) ──────────────────────
    fn verify_solvency(public org_commitment: field) -> Final {
        return final {
            // Proof must exist
            assert(
                Mapping::get_or_use(solvency_proofs, org_commitment, false)
            );
            // Proof must not be expired
            let expiry: u32 = Mapping::get_or_use(
                proof_expiry, org_commitment, 4294967295u32
            );
            assert(block.height < expiry);
            // Increment verification count
            let count: u32 = Mapping::get_or_use(
                verification_counts, org_commitment, 0u32
            );
            Mapping::set(verification_counts, org_commitment, count + 1u32);
        };
    }

    // ─── Transition 5: Selective disclosure ──────────────────────────
    // Reveals asset_type to authorized verifier without revealing amount
    fn selective_disclose(
        private assets: AssetRecord,
        private authorized_verifier: address,
        public org_commitment: field
    ) -> (AssetRecord, DisclosureRecord, Final) {
        let unchanged: AssetRecord = AssetRecord {
            owner: assets.owner,
            amount: assets.amount,
            asset_type: assets.asset_type,
        };

        let disclosure: DisclosureRecord = DisclosureRecord {
            owner: authorized_verifier,
            org_commitment: org_commitment,
            asset_type: assets.asset_type,
        };

        return (unchanged, disclosure, final {
            assert(
                Mapping::get_or_use(solvency_proofs, org_commitment, false)
            );
        });
    }

    // ─── Transition 6: Threshold solvency proof ──────────────────────
    // Proves collateralization ratio above threshold without revealing amounts
    fn prove_threshold(
        private assets: AssetRecord,
        private liabilities_total: u128,
        public org_commitment: field,
        public threshold_level: u8
    ) -> (AssetRecord, Final) {
        // Enforce threshold — 1=basic, 2=100% buffer, 3=200% buffer
        if threshold_level == 1u8 {
            assert(assets.amount > liabilities_total);
        } else if threshold_level == 2u8 {
            assert(assets.amount > liabilities_total * 2u128);
        } else {
            assert(assets.amount > liabilities_total * 3u128);
        }

        let unchanged: AssetRecord = AssetRecord {
            owner: assets.owner,
            amount: assets.amount,
            asset_type: assets.asset_type,
        };

        return (unchanged, final {
            Mapping::set(solvency_proofs, org_commitment, true);
            Mapping::set(proof_timestamps, org_commitment, block.height);
            Mapping::set(threshold_proofs, org_commitment, threshold_level);
        });
    }

    // ─── Transition 7: Revoke proof ──────────────────────────────────
    fn revoke_proof(public org_commitment: field) -> Final {
        return final {
            Mapping::set(solvency_proofs, org_commitment, false);
        };
    }

    @noupgrade
    constructor() {}
}
