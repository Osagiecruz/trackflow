// ShipmentsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { shipmentsApi } from '../utils/api';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../utils/dates';
import toast from 'react-hot-toast';

export function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', carrier: '', search: '', page: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await shipmentsApi.list({ ...params, limit: 20 });
      setShipments(data.shipments);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm('Delete this shipment?')) return;
    await shipmentsApi.remove(id);
    toast.success('Shipment deleted');
    load();
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Shipments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage all your tracked parcels</p>
        </div>
        <Link to="/dashboard/shipments/new" style={{
          background: 'var(--brand)', color: '#0D0E0F',
          padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem',
        }}>+ New Shipment</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search tracking ID, recipient…"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          style={{
            flex: 1, minWidth: 200, background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', outline: 'none',
          }}
        />
        {['', 'pending', 'in_transit', 'out_for_delivery', 'delivered', 'exception'].map(s => (
          <button key={s} onClick={() => setFilters(f => ({ ...f, status: s, page: 1 }))}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem',
              fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
              background: filters.status === s ? 'var(--brand)' : 'var(--surface)',
              color: filters.status === s ? '#0D0E0F' : 'var(--text-muted)',
              border: `1px solid ${filters.status === s ? 'var(--brand)' : 'var(--border2)'}`,
            }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Tracking ID', 'Route', 'Status', 'Carrier', 'Est. Delivery', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : shipments.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < shipments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link to={`/dashboard/shipments/${s.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--brand)' }}>{s.tracking_id}</Link>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem' }}>{s.origin_city}, {s.origin_country} → {s.destination_city}, {s.destination_country}</td>
                <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={s.status} /></td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.carrier}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.estimated_delivery ? formatDate(s.estimated_delivery) : '—'}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/dashboard/shipments/${s.id}`} style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600 }}>View</Link>
                    <button onClick={() => handleDelete(s.id)} style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !shipments.length && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No shipments found. <Link to="/dashboard/shipments/new" style={{ color: 'var(--brand)' }}>Create one →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
              style={{
                width: 36, height: 36, borderRadius: 8, fontSize: '0.82rem',
                fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
                background: filters.page === i + 1 ? 'var(--brand)' : 'var(--surface)',
                color: filters.page === i + 1 ? '#0D0E0F' : 'var(--text-muted)',
                border: `1px solid ${filters.page === i + 1 ? 'var(--brand)' : 'var(--border2)'}`,
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShipmentsPage;
