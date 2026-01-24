/* MIT License: AppFactory-Final PayFast events sink (Netlify Function) */
import type { Handler } from '@netlify/functions'
import { getIPNEvents } from '../../../../packages/payfast-adapter/src/ipn-store'
// Optional DB fetch
export async function fetchDBEvents(slug: string) {
  try {
    const db = await import('../../../../packages/payfast-adapter/src/db')
    const client = await db.getClient()
    if (client) {
      await db.initPFEventsTable(client)
      const rows = await db.getEvents(client, slug)
      await client.end()
      return rows
    }
  } catch {
    return null
  }
  return null
}

export const handler: Handler = async (event) => {
  const slug = (event.queryStringParameters?.slug) || 'default'
  // Try DB-backed events first
  const dbEvents = await (async () => {
    try {
      const db = await import('../../../../packages/payfast-adapter/src/db')
      const client = await db.getClient()
      if (client) {
        await db.initPFEventsTable(client)
        const rows = await db.getEvents(client, slug)
        await client.end()
        return rows
      }
    } catch {
      // ignore and fallback to in-memory
    }
    return null
  })()
  if (dbEvents && Array.isArray(dbEvents) && dbEvents.length > 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ slug, events: dbEvents }),
      headers: { 'Content-Type': 'application/json' }
    }
  }
  const events = getIPNEvents(slug)
  return {
    statusCode: 200,
    body: JSON.stringify({ slug, events }),
    headers: { 'Content-Type': 'application/json' }
  }
}

export default { handler }
