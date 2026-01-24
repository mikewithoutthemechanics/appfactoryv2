import { describe, it, expect } from 'vitest'
import { verifyIPN, buildPayFastURL } from '../src/index'
import crypto from 'crypto'

function md5(input: string) {
  return crypto.createHash('md5').update(input).digest('hex')
}

describe('PayFast IPN verification', () => {
  it('verifies using MD5 digest1 (paramString + passphrase)', () => {
    const params: any = {
      merchant_id: 'm1',
      merchant_key: 'k1',
      pf_payment_status: 'COMPLETE',
      amount: '9.99',
      item_name: 'Test',
    }
    const keys = Object.keys(params).sort()
    const paramString = keys.map((k) => `${k}=${params[k]}`).join('&')
    const passphrase = ''
    const digest1 = md5(paramString + passphrase)
    params.pf_signature = digest1
    const ok = verifyIPN(params)
    expect(ok).toBe(true)
  })

  it('verifies using MD5 digest2 (passphrase + paramString)', () => {
    const params: any = {
      merchant_id: 'm1',
      merchant_key: 'k1',
      pf_payment_status: 'COMPLETED',
      amount: '9.99',
      item_name: 'Test',
    }
    const keys = Object.keys(params).sort()
    const paramString = keys.map((k) => `${k}=${params[k]}`).join('&')
    const passphrase = ''
    const digest2 = md5(passphrase + paramString)
    params.pf_signature = digest2
    const ok = verifyIPN(params)
    expect(ok).toBe(true)
  })

  it('fails on invalid signature', () => {
    const params: any = {
      merchant_id: 'm1',
      merchant_key: 'k1',
      pf_payment_status: 'COMPLETE',
      amount: '9.99',
      item_name: 'Test',
      pf_signature: 'deadbeef'
    }
    const ok = verifyIPN(params)
    expect(ok).toBe(false)
  })
})
