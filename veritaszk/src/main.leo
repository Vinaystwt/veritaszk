// VeritasZK — Prove Solvency. Reveal Nothing.
// ZK Proof of Solvency on Aleo — Wave 4 Buildathon

final fn fin_register_org(caller: address, name_hash: field, timestamp: u32) {
    let info: OrgInfo = OrgInfo {
        name_hash: name_hash,
        registered_at: timestamp,
        is_active: true,
    };
    Mapping::set(org_metadata, caller, info);
}

final fn fin_gen_proof(
    caller: address,
    timestamp: u32,
    asset_count: u8,
    liability_count: u8,
    proof_nonce: field,
) {
    let status: SolvencyStatus = SolvencyStatus {
        is_solvent: true,
        timestamp: timestamp,
        asset_count: asset_count,
        liability_count: liability_count,
        proof_nonce: proof_nonce,
    };
    Mapping::set(solvency_proofs, caller, status);
}

final fn fin_verify_solvency(org_address: address) {
    let status: SolvencyStatus = Mapping::get(solvency_proofs, org_address);
    assert(status.is_solvent);
    let current_count: u32 = Mapping::get_or_use(verification_count, org_address, 0u32);
    Mapping::set(verification_count, org_address, current_count + 1u32);
}

final fn fin_revoke_proof(caller: address, timestamp: u32) {
    let existing: SolvencyStatus = Mapping::get(solvency_proofs, caller);
    let revoked: SolvencyStatus = SolvencyStatus {
        is_solvent: false,
        timestamp: timestamp,
        asset_count: existing.asset_count,
        liability_count: existing.liability_count,
        proof_nonce: existing.proof_nonce,
    };
    Mapping::set(solvency_proofs, caller, revoked);
}

program veritaszk.aleo {

    struct SolvencyStatus {
        is_solvent: bool,
        timestamp: u32,
        asset_count: u8,
        liability_count: u8,
        proof_nonce: field,
    }

    struct OrgInfo {
        name_hash: field,
        registered_at: u32,
        is_active: bool,
    }

    record AssetRecord {
        owner: address,
        asset_type: u8,
        amount: u64,
        asset_id: field,
    }

    record LiabilityRecord {
        owner: address,
        liability_type: u8,
        amount: u64,
        liability_id: field,
    }

    mapping solvency_proofs: address => SolvencyStatus;
    mapping org_metadata: address => OrgInfo;
    mapping verification_count: address => u32;

    @noupgrade
    constructor() {}

    fn register_org(public name_hash: field, public timestamp: u32) -> Final {
        let caller: address = self.caller;
        return final { fin_register_org(caller, name_hash, timestamp); };
    }

    fn declare_asset(asset_type: u8, amount: u64, asset_id: field) -> AssetRecord {
        let caller: address = self.caller;
        return AssetRecord {
            owner: caller,
            asset_type: asset_type,
            amount: amount,
            asset_id: asset_id,
        };
    }

    fn declare_liability(liability_type: u8, amount: u64, liability_id: field) -> LiabilityRecord {
        let caller: address = self.caller;
        return LiabilityRecord {
            owner: caller,
            liability_type: liability_type,
            amount: amount,
            liability_id: liability_id,
        };
    }

    fn generate_solvency_proof(
        a0: AssetRecord,
        a1: AssetRecord,
        a2: AssetRecord,
        a3: AssetRecord,
        a4: AssetRecord,
        l0: LiabilityRecord,
        l1: LiabilityRecord,
        l2: LiabilityRecord,
        l3: LiabilityRecord,
        l4: LiabilityRecord,
        public timestamp: u32,
    ) -> Final {
        let total_assets: u64 = a0.amount + a1.amount + a2.amount + a3.amount + a4.amount;
        let total_liabilities: u64 = l0.amount + l1.amount + l2.amount + l3.amount + l4.amount;
        assert(total_assets > total_liabilities);

        let ac0: u8 = (a0.asset_type != 0u8) ? 1u8 : 0u8;
        let ac1: u8 = (a1.asset_type != 0u8) ? 1u8 : 0u8;
        let ac2: u8 = (a2.asset_type != 0u8) ? 1u8 : 0u8;
        let ac3: u8 = (a3.asset_type != 0u8) ? 1u8 : 0u8;
        let ac4: u8 = (a4.asset_type != 0u8) ? 1u8 : 0u8;
        let asset_count: u8 = ac0 + ac1 + ac2 + ac3 + ac4;

        let lc0: u8 = (l0.liability_type != 0u8) ? 1u8 : 0u8;
        let lc1: u8 = (l1.liability_type != 0u8) ? 1u8 : 0u8;
        let lc2: u8 = (l2.liability_type != 0u8) ? 1u8 : 0u8;
        let lc3: u8 = (l3.liability_type != 0u8) ? 1u8 : 0u8;
        let lc4: u8 = (l4.liability_type != 0u8) ? 1u8 : 0u8;
        let liability_count: u8 = lc0 + lc1 + lc2 + lc3 + lc4;

        let nonce_preimage: field = a0.asset_id + a1.asset_id + a2.asset_id + a3.asset_id + a4.asset_id + timestamp as field;
        let proof_nonce: field = BHP256::hash_to_field(nonce_preimage);

        let caller: address = self.caller;
        return final { fin_gen_proof(caller, timestamp, asset_count, liability_count, proof_nonce); };
    }

    fn verify_solvency(public org_address: address) -> Final {
        return final { fin_verify_solvency(org_address); };
    }

    fn revoke_proof(public timestamp: u32) -> Final {
        let caller: address = self.caller;
        return final { fin_revoke_proof(caller, timestamp); };
    }
}
