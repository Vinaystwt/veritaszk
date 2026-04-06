// VeritasZK Audit — Immutable proof event trail, compliance disclosure records
// Part of the three-program CPI chain: registry ← core → audit

program veritaszk_audit.aleo {

    // ─── Mappings — public audit trail, zero sensitive data ──────────

    // key: event_id, value: block.height when event was recorded
    mapping proof_events: field => u32;

    // key: org_commitment, value: total number of proof events
    mapping event_count: field => u32;

    // key: org_commitment, value: true if marked expired by monitor
    mapping expired_proofs: field => bool;

    // key: hash(org_commitment + regulator_commitment), value: true if disclosed
    mapping compliance_disclosures: field => bool;

    // key: org_commitment, value: block.height of most recent proof event
    mapping last_proof_block: field => u32;

    // ─── Transition 1: Record a proof generation event ───────────────
    fn record_proof_event(
        public org_commitment: field,
        public event_id: field
    ) -> Final {
        return final {
            Mapping::set(proof_events, event_id, block.height);
            let count: u32 = Mapping::get_or_use(event_count, org_commitment, 0u32);
            Mapping::set(event_count, org_commitment, count + 1u32);
            Mapping::set(last_proof_block, org_commitment, block.height);
        };
    }

    // ─── Transition 2: Flag a proof as expired ───────────────────────
    fn flag_proof_expired(public org_commitment: field) -> Final {
        return final {
            Mapping::set(expired_proofs, org_commitment, true);
        };
    }

    // ─── Transition 3: Record compliance disclosure to regulator ─────
    fn record_compliance_disclosure(
        public org_commitment: field,
        public regulator_commitment: field
    ) -> Final {
        let disclosure_key: field = BHP256::hash_to_field(
            org_commitment + regulator_commitment
        );
        return final {
            Mapping::set(compliance_disclosures, disclosure_key, true);
        };
    }

    @noupgrade
    constructor() {}
}
