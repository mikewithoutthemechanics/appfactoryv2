/* MIT License: AppFactory-Final PayFast ITN (Instant Transaction Notification) handler */
import type { Handler } from '@netlify/functions'
import { verifyIPN } from '../../../../packages/payfast-adapter/src/index'
import { addIPNEvent } from '../../../../packages/payfast-adapter/src/ipn-store'

export const handler: Handler = async (event) => {
  const body = event.body ?? ''
  const parsed = Object.fromEntries(new URLSearchParams(body))
  // You can optionally pass merchantKey/passphrase via env for ITN validation
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? ''
  const passphrase = process.env.PAYFAST_PASSPHRASE ?? ''
  const isValid = verifyIPN(parsed as any, merchantKey, passphrase)
  const slug = (parsed as any)['custom_str1'] || 'default'
  if (isValid) {
    addIPNEvent(slug, parsed)
  }
  if (isValid) {
    // Route to per-tenant sink or usage update here in a real system
    return {
      statusCode: 200,
      body: 'OK'
    }
  }
  return {
    statusCode: 400,
    body: 'Invalid ITN'
  }
}

export default { handler }
