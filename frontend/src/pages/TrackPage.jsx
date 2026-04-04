import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackApi } from '../utils/api';
import MapView from '../components/MapView';
import Timeline from '../components/Timeline';
import StatusBadge from '../components/StatusBadge';
import { SubscribeModal } from '../components/StatusBadge';
import { formatDate, formatRelative } from '../utils/dates';

export default function TrackPage() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(trackingId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSubscribe, setShowSubscribe] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (trackingId) doTrack(trackingId);
  }, [trackingId]);

  async function doTrack(id) {
    const tid = (id || input).trim().toUpperCase();
    if (!tid) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await trackApi.track(tid);
      setResult(data);
      navigate(`/track/${tid}`, { replace: true });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No shipment found with that tracking ID. Please check and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const shipment = result?.shipment;
  const events = result?.events || [];
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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agency Login</a>
          <a href="/register" style={{
            background: 'var(--brand)', color: '#0D0E0F',
            padding: '7px 16px', borderRadius: 8,
            fontSize: '0.82rem', fontWeight: 700,
          }}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        padding: 'clamp(3rem,8vw,5rem) 1.5rem 3rem',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,160,32,0.1) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)',
          color: 'var(--brand)', fontSize: '0.72rem', fontWeight: 700,
          padding: '5px 12px', borderRadius: 20, marginBottom: '1.5rem',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
          2.4M shipments tracked today
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '1rem',
        }}>
          Track your parcel<br />
          <span style={{ color: 'var(--brand)' }}>anywhere on Earth</span>
        </h1>

        <p style={{
          color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem', maxWidth: 460, margin: '0 auto 2.5rem', lineHeight: 1.7,
        }}>
          Enter your tracking ID to see real-time updates, route history, and estimated delivery — from dispatch to your doorstep.
        </p>

        {/* Search */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 16, padding: '1.5rem',
          maxWidth: 640, margin: '0 auto',
          boxShadow: '0 0 60px rgba(232,160,32,0.06)',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem', textAlign: 'left' }}>
            Tracking number
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doTrack()}
              placeholder="e.g. TF-DE-US-29183746"
              style={{
                flex: 1, background: 'var(--surface3)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: '13px 16px',
                fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text)',
                outline: 'none',
              }}
            />
            <button
              onClick={() => doTrack()}
              disabled={loading}
              style={{
                background: 'var(--brand)', color: '#0D0E0F',
                border: 'none', borderRadius: 10, padding: '13px 22px',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Searching…' : 'Track →'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Try demo:</span>
            {['TF-DE-US-29183746', 'TF-CN-GB-88204517', 'TF-JP-NG-77310028'].map(id => (
              <button key={id} onClick={() => { setInput(id); doTrack(id); }}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  background: 'var(--surface3)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                }}>
                {id}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            maxWidth: 640, margin: '1rem auto 0',
            background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.25)',
            borderRadius: 10, padding: '12px 16px',
            color: 'var(--danger)', fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Stats bar */}
      {!shipment && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem,4vw,3rem)', padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          {[['198+','Countries'],['42','Carriers'],['99.4%','Accuracy'],['<2s','Update speed']].map(([n,l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--brand)' }}>{n}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {shipment && (
        <div ref={resultRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Header */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                {shipment.tracking_id}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
                {shipment.package?.description || 'Shipment'} · {shipment.origin_city}, {shipment.origin_country} → {shipment.destination_city}, {shipment.destination_country}
              </div>
              <StatusBadge status={shipment.status} />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                ['Carrier', shipment.carrier?.toUpperCase()],
                ['Est. Delivery', shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : '—'],
                ['Service', shipment.service || '—'],
                ['Last Update', latestEvent ? formatRelative(latestEvent.occurred_at) : '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.25rem 1.5rem 0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
              Route · Live Map
            </div>
            <MapView events={events} shipment={shipment} />
          </div>

          {/* Timeline + Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                Shipment Timeline
              </div>
              <Timeline events={events} />
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                Package Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  ['Origin', `${shipment.origin_city}, ${shipment.origin_country}`],
                  ['Destination', `${shipment.destination_city}, ${shipment.destination_country}`],
                  ['Weight', shipment.package?.weight ? `${shipment.package.weight} kg` : '—'],
                  ['Dimensions', shipment.package?.dimensions || '—'],
                  ['Shipper', shipment.sender?.name || '—'],
                  ['Recipient', shipment.recipient?.name || '—'],
                  ['Value', shipment.package?.value ? `${shipment.package.value} ${shipment.package.currency || 'USD'}` : '—'],
                  ['Tracking ID', shipment.tracking_id],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 5 }}>{lbl}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, wordBreak: 'break-all' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscribe CTA */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,160,32,0.08) 0%, rgba(232,160,32,0.03) 100%)',
            border: '1px solid rgba(232,160,32,0.2)',
            borderRadius: 16, padding: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Get notified about updates</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Receive SMS and email alerts when your parcel status changes.</div>
            </div>
            <button
              onClick={() => setShowSubscribe(true)}
              style={{
                background: 'var(--brand)', color: '#0D0E0F',
                border: 'none', borderRadius: 10, padding: '11px 22px',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              Subscribe to alerts
            </button>
          </div>
        </div>
      )}

      {/* Features (when no result) */}
      {!shipment && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
            Why TrackFlow
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🛰️', title: 'Real-time updates', desc: 'Live status from 42 global carriers, refreshed every 30 seconds as your package moves.', bg: 'rgba(232,160,32,0.1)' },
              { icon: '🗺️', title: 'Visual route map', desc: "See your package's exact path plotted on a live world map — from origin to destination.", bg: 'rgba(74,158,232,0.1)' },
              { icon: '📲', title: 'Multi-carrier', desc: 'DHL, FedEx, UPS, Royal Mail, La Poste, and 37 other carriers under one roof.', bg: 'rgba(61,184,122,0.1)' },
              { icon: '🔔', title: 'Instant alerts', desc: 'SMS and email notifications the moment your package clears customs or changes status.', bg: 'rgba(226,75,74,0.1)' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: 18 }}>{f.icon}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>TrackFlow © 2025</div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {['Privacy','Terms','API','Status'].map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
        </div>
      </footer>

      {showSubscribe && (
        <SubscribeModal trackingId={shipment?.tracking_id} onClose={() => setShowSubscribe(false)} />
      )}
    </div>
  );
}
