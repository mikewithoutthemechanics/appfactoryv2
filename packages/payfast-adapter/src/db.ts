// MIT License: AppFactory-Final DB helper for PayFast events (Postgres)
import { Client } from 'pg'

export async function getClient(): Promise<Client | null> {
  const url = process.env.PF_DB_URL || process.env.PAYFAST_DB_URL || process.env.DATABASE_URL
  if (!url) return null
  const client = new Client({ connectionString: url })
  try {
    await client.connect()
    return client
  } catch {
    try { await client.end() } catch {}
    return null
  }
}

export async function initPFEventsTable(client: Client): Promise<void> {
  await client.query(`CREATE TABLE IF NOT EXISTS payfast_events (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`)
}

export async function logEvent(client: Client, slug: string, payload: any): Promise<void> {
  await client.query('INSERT INTO payfast_events (slug, payload) VALUES ($1, $2)', [slug, payload])
}

export async function getEvents(client: Client, slug: string, limit = 200): Promise<any[]> {
  const res = await client.query('SELECT id, slug, payload, created_at FROM payfast_events WHERE slug = $1 ORDER BY created_at DESC LIMIT $2', [slug, limit])
  return res.rows
}

export default { getClient, initPFEventsTable, logEvent, getEvents }
