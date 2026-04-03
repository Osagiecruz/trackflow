import { useState } from 'react';
import { trackApi } from '../utils/api';
import toast from 'react-hot-toast';

// ─── StatusBadge ──────────────────────────────────────────
const STATUS_CONFIG = {
  pending:          { label: 'Awaiting Pickup',    color: '#4A9EE8', bg: 'rgba(74,158,232,0.12)' },
  in_transit:       { label: 'In Transit',          color: '#E8A020', bg: 'rgba(232,160,32,0.12)' },
  out_for_delivery: { label: 'Out for Delivery',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  customs_cleared:  { label: 'Customs Cleared',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  delivered:        { label: 'Delivered',           color: '#3DB87A', bg: 'rgba(61,184,122,0.12)' },
  exception:        { label: 'Delivery Exception',  color: '#E24B4A', bg: 'rgba(226,75,74,0.12)' },
  returned:         { label: 'Returned',            color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#8A8880', bg: 'rgba(138,136,128,0.12)' };
  const isActive = ['in_transit', 'out_for_delivery', 'pending'].includes(status);

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, color: cfg.color,
      fontSize: '0.75rem', fontWeight: 700,
      padding: '5px 12px', borderRadius: 20,
      border: `1px solid ${cfg.color}44`,
      letterSpacing: '0.04em',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: cfg.color,
        animation: isActive ? 'pulse 1.5s infinite' : 'none',
      }} />
      {cfg.label}
    </span>
  );
}

export default StatusBadge;

// ─── SubscribeModal ───────────────────────────────────────
export function SubscribeModal({ trackingId, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email && !phone) { toast.error('Enter email or phone'); return; }

    setLoading(true);
    try {
      await trackApi.subscribe(trackingId, { email: email || undefined, phone: phone || undefined });
      toast.success('Subscribed! You\'ll receive status updates.');
      onClose();
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%',
        }}
      >
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', marginBottom: 8 }}>Get shipment alerts</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We'll notify you when your parcel's status changes — customs, delivery, or exceptions.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: '12px 14px', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
              Phone (SMS)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              style={{
                width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: '12px 14px', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 10,
                background: 'transparent', border: '1px solid var(--border2)',
                color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '12px', borderRadius: 10,
                background: 'var(--brand)', border: 'none',
                color: '#0D0E0F', fontFamily: 'var(--font-sans)',
                fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
