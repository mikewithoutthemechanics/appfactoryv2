/* MIT License: AppFactory-Final enhanced App (multi-tenant dashboard) */
import React, { useEffect, useMemo, useState } from 'react'
import Dashboard from './Dashboard'

type Plan = { id: string; name: string; amount: number }
type TenantSpec = { slug: string; name: string; color: string }

const TENANTS: TenantSpec[] = [
  { slug: 'default', name: 'AppFactory Default', color: '#64748B' },
  { slug: 'acme', name: 'Acme Co', color: '#4F46E5' },
  { slug: 'beta', name: 'Beta LLC', color: '#10B981' }
]

const INITIAL = TENANTS[0]

export default function App(): JSX.Element {
  // Tenant switcher (UI-driven, automated in Netlify path)
  const [currentSlug, setCurrentSlug] = useState<string>(INITIAL.slug)
  const currentTenant = TENANTS.find(t => t.slug === currentSlug) ?? INITIAL
  const brandColor = currentTenant.color

  // Plans and PayFast URL builder
  const plans: Plan[] = [
    { id: 'basic', name: 'Basic', amount: 9.99 },
    { id: 'pro', name: 'Pro',   amount: 29.99 }
  ]
  const [selectedPlan, setSelectedPlan] = useState<string>('basic')
  const slugForPayFast = currentSlug

  // PayFast URL generation (adapter optional, fallback available)
  const [payfastURL, setPayfastURL] = useState<string>('')
  useEffect(() => {
    import('../../../../appfactory-final/packages/payfast-adapter/src/index')
      .then((mod) => {
        // @ts-ignore
        const build = mod.buildPayFastURL
        const plan = plans.find(p => p.id === selectedPlan) ?? plans[0]
        const url = build({
          merchantId: (process.env.VITE_PAYFAST_MERCHANT_ID as string) || '',
          merchantKey: (process.env.VITE_PAYFAST_MERCHANT_KEY as string) || '',
          returnURL: window.location.origin + '/payfast/return',
          notifyURL: window.location.origin + '/.netlify/functions/payfast-ipn',
          itemName: `${plan.name} - AppFactory Final Subscription`,
          amount: plan.amount,
          customStr1: slugForPayFast
        } as any)
        setPayfastURL(url)
      })
      .catch(() => {
        const plan = plans.find(p => p.id === selectedPlan) ?? plans[0]
        const url = `https://www.payfast.co.za/eng/process?merchant_id=&merchant_key=&return_url=${encodeURIComponent(window.location.origin + '/payfast/return')}&notify_url=${encodeURIComponent(window.location.origin + '/.netlify/functions/payfast-ipn')}&amount=${encodeURIComponent(plan.amount.toFixed(2))}&item_name=${encodeURIComponent(plan.name + ' - AppFactory Final Subscription')}`
        setPayfastURL(url)
      })
  }, [selectedPlan, currentSlug])

  // PF IPN events (in-memory or DB) to feed Dashboard
  const [pfEvents, setPfEvents] = useState<any[]>([]) // will be filled via IPN sink

  // Tenant switcher change effect (hourglass-like; kept minimal for now)
  useEffect(() => {
    // optional: detect subdomain and auto-switch
    const host = typeof window !== 'undefined' ? window.location.hostname : ''
    const hostSlug = host.split('.')[0]
    const found = TENANTS.find(t => t.slug === hostSlug)
    if (found && found.slug !== currentSlug) setCurrentSlug(found.slug)
  }, [])

  // Render
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', padding: 12, background: brandColor, color: '#fff' }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>AppFactory Final</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>Tenant</span>
          <select value={currentSlug} onChange={(e) => setCurrentSlug(e.target.value)}>
            {TENANTS.map(t => (
              <option value={t.slug} key={t.slug}>{t.name}</option>
            ))}
          </select>
          <button onClick={() => alert('This is a demo; credentials should be saved securely.')}>Info</button>
        </div>
      </header>
      <main style={{ padding: 16 }}>
        <Dashboard tenant={currentTenant} pfEvents={pfEvents} />
        <section style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>PayFast</div>
          {payfastURL ? (
            <a href={payfastURL} target="_blank" rel="noreferrer">Pay with PayFast</a>
          ) : (
            <span>Loading PayFast URL...</span>
          )}
        </section>
      </main>
    </div>
  )
}
