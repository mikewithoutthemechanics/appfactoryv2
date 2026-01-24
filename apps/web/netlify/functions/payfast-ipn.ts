/* MIT License: AppFactory-Final PayFast IPN handler (Netlify Function) */
import type { Handler } from '@netlify/functions'
import { verifyIPN } from '../../../../packages/payfast-adapter/src/index'
import { addIPNEvent } from '../../../../packages/payfast-adapter/src/ipn-store'
// DB sink optional
import { getClient, initPFEventsTable, logEvent } from '../../../../packages/payfast-adapter/src/db'
import fs from 'fs'
import path from 'path'

export const handler: Handler = async (event) => {
  const body = event.body ?? ''
  // PayFast IPN posts URL-encoded payload
  const parsed = Object.fromEntries(new URLSearchParams(body))
  // Persist per-tenant IPN in /tmp (local dev builds or containers can inspect)
  const slug = (parsed as any)['custom_str1'] ?? 'default'
  try {
    const logDir = '/tmp'
    const logPath = path.join(logDir, `payfast-ipn-${slug}.log`)
    const entry = { t: new Date().toISOString(), payload: parsed }
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n')
  } catch {
    // ignore logging failures in production contracts
  }
  const isValid = verifyIPN(parsed as any)
  const useDB = (process.env.PF_USE_DB || 'false').toLowerCase() === 'true'
  if (isValid) {
    if (useDB) {
      try {
        const db = await import('../../../../packages/payfast-adapter/src/db')
        const client = await db.getClient()
        if (client) {
          await db.initPFEventsTable(client)
          await db.logEvent(client, slug, parsed)
          await client.end()
        }
      } catch {
        // if DB not accessible, fall back to in-memory
        addIPNEvent(slug, parsed)
      }
    } else {
      addIPNEvent(slug, parsed)
    }
    return {
      statusCode: 200,
      body: 'OK'
    }
  }
  return {
    statusCode: 400,
    body: 'Invalid IPN'
  }
}

export default { handler }
