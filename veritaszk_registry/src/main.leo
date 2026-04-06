// VeritasZK Registry — Organization identity, verifier credentials, delegation
// Part of the three-program CPI chain: registry ← core → audit

program veritaszk_registry.aleo {

    // ─── Mappings — public state, zero sensitive data ─────────────────

    mapping org_registry: field => bool;
    mapping verifier_credentials: field => bool;
    mapping delegation_registry: field => field;
    mapping org_registration_time: field => u32;

    // ─── Transition 1: Register organization ─────────────────────────
    fn register_org(private org_name_hash: field, private salt: field) -> (field, Final) {
        let commitment: field = BHP256::hash_to_field(org_name_hash);
        let salted: field = BHP256::hash_to_field(salt);
        let final_commitment: field = BHP256::hash_to_field(commitment + salted);
        return (final_commitment, final {
            assert(!Mapping::get_or_use(org_registry, final_commitment, false));
            Mapping::set(org_registry, final_commitment, true);
            Mapping::set(org_registration_time, final_commitment, block.height);
        });
    }

    // ─── Transition 2: Issue verifier credential ─────────────────────
    fn issue_verifier_credential(
        private verifier_address: address,
        public org_commitment: field
    ) -> Final {
        let verifier_key: field = BHP256::hash_to_field(verifier_address as field);
        return final {
            assert(Mapping::get_or_use(org_registry, org_commitment, false));
            Mapping::set(verifier_credentials, verifier_key, true);
        };
    }

    // ─── Transition 3: Delegate proof generation to third party ──────
    fn delegate_prover(
        private prover_address: address,
        public org_commitment: field
    ) -> Final {
        let prover_key: field = BHP256::hash_to_field(prover_address as field);
        return final {
            assert(Mapping::get_or_use(org_registry, org_commitment, false));
            Mapping::set(delegation_registry, org_commitment, prover_key);
        };
    }

    // ─── Transition 4: Revoke verifier credential ────────────────────
    fn revoke_credential(private verifier_address: address) -> Final {
        let verifier_key: field = BHP256::hash_to_field(verifier_address as field);
        return final {
            Mapping::set(verifier_credentials, verifier_key, false);
        };
    }

    @noupgrade
    constructor() {}
}
