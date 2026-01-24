/* MIT License: AppFactory-Final payfast-adapter (skeleton) */
import crypto from 'crypto'

export interface PayFastCheckoutOptions {
  merchantId: string
  merchantKey: string
  returnURL: string
  notifyURL: string
  itemName: string
  amount: number
  itemDescription?: string
  customStr1?: string
}

export function buildPayFastURL(opts: PayFastCheckoutOptions): string {
  const params = new URLSearchParams()
  params.set('merchant_id', opts.merchantId)
  params.set('merchant_key', opts.merchantKey)
  params.set('return_url', opts.returnURL)
  params.set('notify_url', opts.notifyURL)
  params.set('amount', opts.amount.toFixed(2))
  params.set('item_name', opts.itemName)
  if (opts.itemDescription) params.set('item_description', opts.itemDescription)
  if (opts.customStr1) params.set('custom_str1', opts.customStr1)

  // Note: In real PayFast integration you also generate a signature/hash here.
  // This skeleton keeps things simple for local development while preserving API shape.
  const base = 'https://www.payfast.co.za/eng/process'
  return `${base}?${params.toString()}`
}

export function verifyIPN(params: Record<string, string | undefined>, _merchantKey?: string, _passphrase?: string): boolean {
  // Verify that the IPN indicates completion
  const status = (params['pf_payment_status'] || params['payment_status'] || '').toUpperCase()
  if (!status) return false
  const isComplete = status === 'COMPLETE' || status === 'COMPLETED' || status === 'COMPLETEPAYMENT'
  if (!isComplete) return false

  // Build a canonical parameter string from relevant fields (excluding signatures)
  const exclude = new Set(['pf_signature', 'pf_passphrase', 'signature', 'pf_checksum'])
  const keys = Object.keys(params).filter((k) => !exclude.has(k) && (params as any)[k] !== undefined && (params as any)[k] !== '')
  keys.sort()
  const fragments: string[] = keys.map((k) => `${k}=${params[k as keyof typeof params]}`)
  const paramString = fragments.join('&')

  const passphrase = (params['pf_passphrase'] as string) || _passphrase || ''
  const md5 = (input: string) => crypto.createHash('md5').update(input).digest('hex')
  const digest1 = md5(paramString + (passphrase || ''))
  const digest2 = md5((passphrase || '') + paramString)

  const signature = (params['pf_signature'] as string) || (params['signature'] as string) || ''
  if (signature && (signature === digest1 || signature === digest2)) {
    return true
  }
  // No valid signature means invalid IPN in production
  return false
}

export function parseIPN(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  raw.split('&').forEach((pair) => {
    const [k, v] = pair.split('=')
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
  })
  return out
}

export default { buildPayFastURL, verifyIPN, parseIPN }
