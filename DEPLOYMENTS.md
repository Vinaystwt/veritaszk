# VeritasZK — Deployment Addresses

## Wave 4 Deployments (original)

### veritaszk_registry.aleo
- TX (Wave 4): at1m2tzwdtwh5c9xjvq9ux3lhwt6nlnpmq7awu7snkwp8ve65605ugsk7kj5e
- Explorer: https://testnet.explorer.provable.com/program/veritaszk_registry.aleo

### veritaszk_core.aleo
- TX (Wave 4): at17u8flq6zlyyjhu72matz90ezhyfqsk5r7jy8ek5k6cdrx0gequxs9z5jme
- Explorer: https://testnet.explorer.provable.com/program/veritaszk_core.aleo

### veritaszk_audit.aleo
- TX (Wave 4): at106j80dcfdrzvvc9j5tjevvc0084crn54r4dslwe5gtup9p2mpqyqu3jcms
- Explorer: https://testnet.explorer.provable.com/program/veritaszk_audit.aleo

## Wave 5 Deployments (updated)

### veritaszk_threshold.aleo (NEW — Wave 5)
- TX: at1j9ghj3zu5a9n47t07nsyj3uu6f5q6g54u8vn22gse68e428lacqq7ugnz4
- Explorer: https://testnet.explorer.provable.com/program/veritaszk_threshold.aleo
- Transitions: prove_threshold, verify_tier, revoke_tier_proof

### veritaszk_core.aleo (Wave 5 update — edition 1)
- TX: at19tn3me0tm5sct8q2a3zwz0ffkujtztz9td04psrjj3pmcencj5gse7yv3y
- Explorer: https://testnet.explorer.provable.com/program/veritaszk_core.aleo
- New transitions: submit_proof_with_expiry, refresh_proof, revoke_proof_record
- New record: RevokeReceipt
- New mapping: proof_status

### veritaszk_audit.aleo (Wave 5 update — edition 1)
- TX: at1jqffrkx5tepef74nvqhmzscywg2ulx8p9ejf70gxj873l07lhgrqdhggfa
- Explorer: https://testnet.explorer.provable.com/program/veritaszk_audit.aleo
- New transitions: log_verification, link_proof_history
- New record: AuditRecord
- New mappings: verification_counts, proof_history

### veritaszk_registry.aleo (Wave 5 update — edition 1)
- TX: at1syv4aged4jk0gspqyadeq7sq40yga2x85kxc7pcyj60w9vydzczq3mj3at
- Explorer: https://testnet.explorer.provable.com/program/veritaszk_registry.aleo
- New transitions: delegate_proof_authority, register_org_name
- New record: DelegateRecord
- New mappings: name_registry, salt_to_commitment
