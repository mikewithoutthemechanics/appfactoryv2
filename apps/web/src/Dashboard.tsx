/* MIT License: AppFactory-Final Dashboard component with security measures */
import React, { useMemo } from 'react';

type TenantSpec = { slug: string; name: string; color: string };

interface DashboardProps {
  tenant: TenantSpec;
  pfEvents: any[];
}

function sanitizeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeHTML(str: string | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function Dashboard({
  tenant,
  pfEvents,
}: DashboardProps): JSX.Element {
  const safeTenantName = useMemo(() => escapeHTML(tenant.name), [tenant.name]);
  const safeTenantSlug = useMemo(() => escapeHTML(tenant.slug), [tenant.slug]);

  const eventCount = useMemo(() => {
    try {
      return Array.isArray(pfEvents) ? pfEvents.length : 0;
    } catch {
      return 0;
    }
  }, [pfEvents]);

  return (
    <section aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading" style={{ marginTop: 0 }}>
        Dashboard - {safeTenantName}
      </h2>
      <div
        style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}
      >
        <p>
          <strong>Tenant:</strong> {safeTenantSlug}
        </p>
        <p>
          <strong>Payment Events:</strong> {eventCount}
        </p>
        {Array.isArray(pfEvents) && pfEvents.length > 0 && (
          <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
            {pfEvents.slice(0, 10).map((event, idx) => {
              try {
                const safeId = escapeHTML(event?.id ?? idx);
                const safeStatus = escapeHTML(
                  event?.pf_payment_status ?? 'unknown',
                );
                return (
                  <li key={safeId}>
                    {safeStatus} - {safeId}
                  </li>
                );
              } catch {
                return <li key={idx}>Event data unavailable</li>;
              }
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
