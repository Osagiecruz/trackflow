import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, shipmentsApi } from '../utils/api';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../utils/dates';

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.overview(),
      shipmentsApi.list({ limit: 8, page: 1 }),
    ]).then(([ovRes, shipRes]) => {
      setOverview(ovRes.data.overview);
      setRecent(shipRes.data.shipments);
    }).finally(() => setLoading(false));
  }, []);

  const stats = overview ? [
    { label: 'Total Shipments',  value: overview.total.toLocaleString(),      color: 'var(--text)' },
    { label: 'In Transit',       value: overview.in_transit.toLocaleString(),  color: 'var(--warning)' },
    { label: 'Delivered',        value: overview.delivered.toLocaleString(),   color: 'var(--success)' },
    { label: 'On-Time Rate',     value: `${overview.on_time_rate}%`,           color: 'var(--info)' },
  ] : [];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Overview of your shipping operations</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 14, padding: '1.25rem',
          }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/dashboard/shipments/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--brand)', color: '#0D0E0F',
          padding: '10px 20px', borderRadius: 10,
          fontWeight: 700, fontSize: '0.88rem',
        }}>
          + Create Shipment
        </Link>
        <Link to="/dashboard/shipments" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          color: 'var(--text)', padding: '10px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: '0.88rem',
        }}>
          View All Shipments
        </Link>
        <Link to="/dashboard/analytics" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          color: 'var(--text)', padding: '10px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: '0.88rem',
        }}>
          Analytics
        </Link>
      </div>

      {/* Recent Shipments */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16 }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recent Shipments</div>
          <Link to="/dashboard/shipments" style={{ fontSize: '0.8rem', color: 'var(--brand)' }}>View all →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Tracking ID','Route','Status','Carrier','Est. Delivery','Created'].map(h => (
                  <th key={h} style={{
                    padding: '0.75rem 1rem', textAlign: 'left',
                    fontSize: '0.68rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--text-dim)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Link to={`/dashboard/shipments/${s.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--brand)' }}>
                      {s.tracking_id}
                    </Link>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem' }}>
                    {s.origin_city}, {s.origin_country} → {s.destination_city}, {s.destination_country}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <StatusBadge status={s.status} />
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {s.carrier}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {s.estimated_delivery ? formatDate(s.estimated_delivery) : '—'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {formatDate(s.created_at)}
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  No shipments yet. <Link to="/dashboard/shipments/new" style={{ color: 'var(--brand)' }}>Create your first →</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
