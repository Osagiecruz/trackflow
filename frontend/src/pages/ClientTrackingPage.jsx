import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatusBadge } from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import MapView from '../components/MapView';
import { formatDate, formatRelative } from '../utils/dates';
import ClientPaymentCard from '../components/ClientPaymentCard';
import toast from 'react-hot-toast';


const API = import.meta.env.VITE_API_URL || 'https://trackflow-production-22cc.up.railway.app';

export default function ClientTrackingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const clientInfo = JSON.parse(localStorage.getItem('client_info') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('client_token');
    if (!token) { navigate('/client/login'); return; }

    axios.get(`${API}/api/client/tracking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setData(res.data);
        return axios.get(`${API}/api/quotations/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(q => setQuotation(q.data.quotation)).catch(() => {});
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('client_token');
          localStorage.removeItem('client_info');
          navigate('/client/login');
        } else {
          toast.error('Failed to load tracking data');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_info');
    navigate('/client/login');
  }

  const shipment = data?.shipment;
  const events = data?.events || [];
  const latestEvent = events[events.length - 1];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,14,15,0.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
          TrackFlow
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{clientInfo.full_name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{clientInfo.username}</div>
          </div>
          <button onClick={logout} style={{
            padding: '7px 14px', borderRadius: 8,
            background: 'transparent', border: '1px solid var(--border2)',
            color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem', cursor: 'pointer',
          }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner" />
          </div>
        ) : !shipment ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No shipment found.
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Tracking ID: {shipment.tracking_id}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
                {shipment.package?.description || 'Your Package'} · {shipment.origin_city}, {shipment.origin_country} → {shipment.destination_city}, {shipment.destination_country}
              </div>
              <StatusBadge status={shipment.status} />

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  ['Carrier', shipment.carrier?.toUpperCase()],
                  ['Est. Delivery', shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : '—'],
                  ['Last Update', latestEvent ? formatRelative(latestEvent.occurred_at) : '—'],
                  ['Recipient', shipment.recipient?.name || '—'],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 3 }}>{lbl}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {(() => {
              const steps = ['pending', 'in_transit', 'customs_cleared', 'out_for_delivery', 'delivered'];
              const currentIdx = steps.indexOf(shipment.status);
              const progress = currentIdx === -1 ? 0 : Math.round((currentIdx / (steps.length - 1)) * 100);
              const labels = ['Created', 'In Transit', 'Customs', 'Out for Delivery', 'Delivered'];
              return (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Delivery Progress</div>
                  <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                    <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--brand)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {labels.map((label, i) => (
                      <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', margin: '0 auto 6px',
                          background: i <= currentIdx ? 'var(--brand)' : 'var(--surface3)',
                          border: `2px solid ${i <= currentIdx ? 'var(--brand)' : 'var(--border2)'}`,
                        }} />
                        <div style={{ fontSize: '0.65rem', color: i <= currentIdx ? 'var(--brand)' : 'var(--text-dim)', fontWeight: i === currentIdx ? 700 : 400 }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Map */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem 1.5rem 0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
                Live Route Map
              </div>
              <MapView events={events} shipment={shipment} />
            </div>

            {/* Timeline */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                Shipment Timeline
              </div>
              <Timeline events={events} />
            </div>

            {/* Payment */}
            {quotation && (
              <ClientPaymentCard
                quotation={quotation}
                onUpdate={() => axios.get(`${API}/api/quotations/my`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('client_token')}` },
                }).then(q => setQuotation(q.data.quotation)).catch(() => {})}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}