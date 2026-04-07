program veritaszk_threshold.aleo;

record TierProofRecord:
    owner as address.private;
    org_commitment as field.private;
    tier_achieved as u8.private;
    is_solvent as boolean.private;
    proof_nonce as field.private;

struct AssetBundle:
    native_credits as u64;
    stablecoin_usd as u64;
    btc_equivalent as u64;
    other_assets as u64;

mapping tier_results:
    key as field.public;
    value as u8.public;

mapping tier_is_solvent:
    key as field.public;
    value as boolean.public;

mapping tier_block:
    key as field.public;
    value as u32.public;

function prove_threshold:
    input r0 as AssetBundle.private;
    input r1 as u64.private;
    input r2 as field.private;
    input r3 as field.private;
    input r4 as u8.public;
    cast r0.native_credits into r5 as u128;
    cast r0.stablecoin_usd into r6 as u128;
    add r5 r6 into r7;
    cast r0.btc_equivalent into r8 as u128;
    add r7 r8 into r9;
    cast r0.other_assets into r10 as u128;
    add r9 r10 into r11;
    cast r1 into r12 as u128;
    is.eq r4 1u8 into r13;
    gte r11 r12 into r14;
    not r13 into r15;
    or r14 r15 into r16;
    assert.eq r16 true;
    is.eq r4 2u8 into r17;
    mul r11 2u128 into r18;
    mul r12 3u128 into r19;
    gte r18 r19 into r20;
    and r15 r17 into r21;
    not r21 into r22;
    or r20 r22 into r23;
    assert.eq r23 true;
    not r17 into r24;
    is.eq r4 3u8 into r25;
    mul r12 2u128 into r26;
    gte r11 r26 into r27;
    and r15 r24 into r28;
    and r28 r25 into r29;
    not r29 into r30;
    or r27 r30 into r31;
    assert.eq r31 true;
    not r25 into r32;
    is.eq r4 4u8 into r33;
    gte r11 r19 into r34;
    and r28 r32 into r35;
    and r35 r33 into r36;
    not r36 into r37;
    or r34 r37 into r38;
    assert.eq r38 true;
    not r33 into r39;
    and r35 r39 into r40;
    not r40 into r41;
    or false r41 into r42;
    assert.eq r42 true;
    cast self.caller r2 r4 true r3 into r43 as TierProofRecord.record;
    async prove_threshold r2 r4 into r44;
    output r43 as TierProofRecord.record;
    output r44 as veritaszk_threshold.aleo/prove_threshold.future;

finalize prove_threshold:
    input r0 as field.public;
    input r1 as u8.public;
    set r1 into tier_results[r0];
    set true into tier_is_solvent[r0];
    set block.height into tier_block[r0];

function verify_tier:
    input r0 as field.public;
    async verify_tier r0 into r1;
    output r1 as veritaszk_threshold.aleo/verify_tier.future;

finalize verify_tier:
    input r0 as field.public;
    get.or_use tier_is_solvent[r0] false into r1;
    assert.eq r1 true;

function revoke_tier_proof:
    input r0 as TierProofRecord.record;
    input r1 as field.public;
    assert.eq r0.owner self.caller;
    assert.eq r0.org_commitment r1;
    async revoke_tier_proof r1 into r2;
    output r2 as veritaszk_threshold.aleo/revoke_tier_proof.future;

finalize revoke_tier_proof:
    input r0 as field.public;
    set false into tier_is_solvent[r0];

constructor:
    assert.eq edition 0u16;
