// MIT License: AppFactory-Final IPN event store (in-memory per-process store for local/dev)
export const ipnStore: Record<string, any[]> = {}

export function addIPNEvent(slug: string, event: any): void {
  if (!ipnStore[slug]) ipnStore[slug] = []
  ipnStore[slug].push(event)
}

export function getIPNEvents(slug: string): any[] {
  return ipnStore[slug] ?? []
}

export default { addIPNEvent, getIPNEvents }
