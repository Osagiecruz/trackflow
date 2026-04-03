// AnalyticsPage.jsx
import { useState, useEffect } from 'react';
import { analyticsApi } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const CARRIER_COLORS = { dhl: '#E8A020', fedex: '#4A9EE8', ups: '#3DB87A', custom: '#8B5CF6' };
const STATUS_COLORS = { pending: '#4A9EE8', in_transit: '#E8A020', out_for_delivery: '#F59E0B', delivered: '#3DB87A', exception: '#E24B4A', returned: '#8B5CF6' };

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.overview().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;

  const chartStyle = { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' };

  return (
    <div style={{ padding: '2rem', maxWidth: 1200 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Performance overview for your shipping operations</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Shipments', value: data?.overview?.total?.toLocaleString(), color: 'var(--text)' },
          { label: 'In Transit', value: data?.overview?.in_transit, color: 'var(--warning)' },
          { label: 'Delivered', value: data?.overview?.delivered, color: 'var(--success)' },
          { label: 'Exceptions', value: data?.overview?.exceptions, color: 'var(--danger)' },
          { label: 'On-Time Rate', value: `${data?.overview?.on_time_rate || 0}%`, color: 'var(--info)' },
          { label: 'Last 30 Days', value: data?.overview?.last_30_days, color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.04em', color: s.color }}>{s.value ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Daily Volume (30 days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.daily_volume || []}>
              <XAxis dataKey="date" tick={chartStyle} tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis tick={chartStyle} />
              <Tooltip contentStyle={{ background: '#1E2022', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'Syne, sans-serif', fontSize: 12 }} />
              <Bar dataKey="count" fill="#E8A020" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>By Carrier</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data?.by_carrier || []} dataKey="count" nameKey="carrier" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                {(data?.by_carrier || []).map((entry, i) => (
                  <Cell key={i} fill={CARRIER_COLORS[entry.carrier] || '#888'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E2022', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {(data?.by_carrier || []).map(c => (
              <div key={c.carrier} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CARRIER_COLORS[c.carrier] || '#888' }} />
                {c.carrier?.toUpperCase()} ({c.count})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
