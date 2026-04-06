import { verifySolvency, batchVerify, isRegistered,
         getAuditTrail, getVerificationCount } from '../index'

const TEST_COMMITMENT =
  'aleo1cdmu479q6duu327wgm3vnphqtq2n4q4vcvp66f5742gv5f8f9qxq0w9r00'

describe('veritaszk-sdk', () => {
  test('verifySolvency returns correct shape', async () => {
    const r = await verifySolvency(TEST_COMMITMENT)
    expect(r).toHaveProperty('orgCommitment')
    expect(r).toHaveProperty('isSolvent')
    expect(r).toHaveProperty('verificationCount')
    expect(typeof r.isSolvent).toBe('boolean')
    expect(typeof r.verificationCount).toBe('number')
  }, 15000)

  test('batchVerify handles array', async () => {
    const r = await batchVerify([TEST_COMMITMENT])
    expect(Array.isArray(r)).toBe(true)
    expect(r[0]).toHaveProperty('orgCommitment')
    expect(r[0]).toHaveProperty('isSolvent')
  }, 15000)

  test('isRegistered returns boolean', async () => {
    const r = await isRegistered(TEST_COMMITMENT)
    expect(typeof r).toBe('boolean')
  }, 15000)

  test('getAuditTrail returns correct shape', async () => {
    const r = await getAuditTrail(TEST_COMMITMENT)
    expect(r).toHaveProperty('orgCommitment')
    expect(r).toHaveProperty('eventCount')
    expect(typeof r.eventCount).toBe('number')
  }, 15000)

  test('getVerificationCount returns number', async () => {
    const r = await getVerificationCount(TEST_COMMITMENT)
    expect(typeof r).toBe('number')
  }, 15000)
})
