/* MIT License: Dashboard component integrating CoinGecko free API */
import React, { useEffect, useState } from 'react';

/* ── Types ─────────────────────────────────────────── */

type Coin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
};

type CoinMarketReturn = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
};

/* ── Helpers ───────────────────────────────────────── */

function fmtUSD(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function fmtCap(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}

/* ── Props ─────────────────────────────────────────── */

type TenantSpec = {
  slug: string;
  name: string;
  color: string;
};

interface DashboardProps {
  tenant: TenantSpec;
  pfEvents: any[];
}

/* ── Component ────────────────────────────────────── */

export default function Dashboard({
  tenant,
  pfEvents,
}: DashboardProps): React.ReactElement {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCoins() {
      setLoading(true);
      setError(null);
      try {
        /* CoinGecko /coins/markets – free, no API key, ZIP it so the
           response is only ~1 kB for the top 12 coins */
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false',
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CoinMarketReturn[] = await res.json();
        if (!cancelled) setCoins(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCoins();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Render ── */

  return (
    <section
      style={{
        border: `2px solid ${tenant.color}`,
        borderRadius: 12,
        padding: 20,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: tenant.color,
          marginBottom: 4,
        }}
      >
        {tenant.name} — Crypto Market Overview
      </div>
      <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>
        Live prices powered by CoinGecko (public API, no API key required).
      </p>

      {/* PF events badge */}
      {pfEvents.length > 0 && (
        <div
          style={{
            display: 'inline-block',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: 999,
            padding: '2px 10px',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {pfEvents.length} PayFast event{pfEvents.length !== 1 ? 's' : ''}{' '}
          received
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          Failed to load market data: {error}
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            style={{
              marginLeft: 12,
              padding: '4px 12px',
              fontSize: 13,
              border: 'none',
              borderRadius: 4,
              background: '#991b1b',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 16,
                height: 140,
                animation: 'pulse 1.4s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Coin card grid */}
      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {coins.map((coin) => (
            <div
              key={coin.id}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 14,
                transition: 'box-shadow 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 4px 12px rgba(0,0,0,.1)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')
              }
            >
              {/* Rank */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  style={{ width: 28, height: 28 }}
                  loading="lazy"
                />
                <div>
                  <div
                    style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}
                  >
                    {coin.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                    }}
                  >
                    {coin.symbol}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                {fmtUSD(coin.current_price)}
              </div>

              {/* 24 h change */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color:
                    coin.price_change_percentage_24h >= 0
                      ? '#16a34a'
                      : '#dc2626',
                }}
              >
                {fmtPct(coin.price_change_percentage_24h)} (24 h)
              </div>

              {/* Market cap */}
              <div
                style={{
                  fontSize: 12,
                  color: '#6b7280',
                  marginTop: 4,
                }}
              >
                Cap: {fmtCap(coin.market_cap)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lazy-load shimmer style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>
    </section>
  );
}
