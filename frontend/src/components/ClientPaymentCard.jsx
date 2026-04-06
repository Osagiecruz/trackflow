import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'https://trackflow-production-22cc.up.railway.app';

export default function ClientPaymentCard({ quotation: initialQuotation, onUpdate }) {
  const [quotation, setQuotation] = useState(initialQuotation);
  const [showPayForm, setShowPayForm] = useState(false);
  const [crypto, setCrypto] = useState('BTC');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!quotation) return null;

  const statusConfig = {
    unpaid: { label: 'Payment Required', color: 'var(--danger)', bg: 'rgba(226,75,74,0.1)', border: 'rgba(226,75,74,0.25)' },
    pending_confirmation: { label: 'Payment Submitted — Awaiting Confirmation', color: 'var(--warning)', bg: 'rgba(232,160,32,0.1)', border: 'rgba(232,160,32,0.25)' },
    paid: { label: 'Payment Confirmed ✓', color: 'var(--success)', bg: 'rgba(61,184,122,0.1)', border: 'rgba(61,184,122,0.25)' },
  };

  const cfg = statusConfig[quotation.status] || statusConfig.unpaid;

  async function submitPayment(e) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please include a message to the agency');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('client_token');
      await axios.post(`${API}/api/quotations/${quotation.id}/pay`, {
        crypto_currency: crypto,
        message,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuotation(prev => ({ ...prev, status: 'pending_confirmation' }));
      setShowPayForm(false);
      setMessage('');
      toast.success('Payment notification sent to agency!');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  }

  function copyAddress(address) {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  }

  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${cfg.border}`,
      borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 6 }}>
            Quotation & Payment
          </div>
          <span style={{
            display: 'inline-block',
            background: cfg.bg, color: cfg.color,
            fontSize: '0.75rem', fontWeight: 700,
            padding: '4px 12px', borderRadius: 20,
            border: `1px solid ${cfg.border}`,
          }}>
            {cfg.label}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand)' }}>
          {quotation.currency} {parseFloat(quotation.total).toFixed(2)}
        </div>
      </div>

      {/* Line items */}
      <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
          Invoice Breakdown
        </div>
        {quotation.items?.map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: i < quotation.items.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{quotation.currency} {parseFloat(item.amount).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '2px solid var(--border2)' }}>
          <span style={{ fontWeight: 800 }}>Total Due</span>
          <span style={{ fontWeight: 800, color: 'var(--brand)', fontSize: '1rem' }}>
            {quotation.currency} {parseFloat(quotation.total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Crypto addresses — only show if unpaid */}
      {quotation.status === 'unpaid' && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            Payment Addresses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quotation.btc_address && (
              <div style={{ background: 'rgba(247,147,26,0.08)', border: '1px solid rgba(247,147,26,0.2)', borderRadius: 10, padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F7931A' }}>₿ Bitcoin (BTC)</span>
                  <button onClick={() => copyAddress(quotation.btc_address)} style={{ fontSize: '0.72rem', color: '#F7931A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                    Copy
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#F7931A', wordBreak: 'break-all', lineHeight: 1.5 }}>
                  {quotation.btc_address}
                </div>
              </div>
            )}
            {quotation.eth_address && (
              <div style={{ background: 'rgba(98,126,234,0.08)', border: '1px solid rgba(98,126,234,0.2)', borderRadius: 10, padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#627EEA' }}>⬡ Ethereum (ETH)</span>
                  <button onClick={() => copyAddress(quotation.eth_address)} style={{ fontSize: '0.72rem', color: '#627EEA', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                    Copy
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#627EEA', wordBreak: 'break-all', lineHeight: 1.5 }}>
                  {quotation.eth_address}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {quotation.notes && (
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {quotation.notes}
        </div>
      )}

      {/* CTA */}
      {quotation.status === 'unpaid' && !showPayForm && (
        <button
          onClick={() => setShowPayForm(true)}
          style={{
            width: '100%', padding: '13px', borderRadius: 10,
            background: 'var(--brand)', border: 'none', color: '#0D0E0F',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          I've Paid — Notify Agency →
        </button>
      )}

      {/* Pay form */}
      {quotation.status === 'unpaid' && showPayForm && (
        <form onSubmit={submitPayment} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
              Which crypto did you pay with?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['BTC', 'ETH'].map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setCrypto(c)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 9,
                    fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                    background: crypto === c ? (c === 'BTC' ? 'rgba(247,147,26,0.15)' : 'rgba(98,126,234,0.15)') : 'var(--surface3)',
                    color: crypto === c ? (c === 'BTC' ? '#F7931A' : '#627EEA') : 'var(--text-muted)',
                    border: `1px solid ${crypto === c ? (c === 'BTC' ? 'rgba(247,147,26,0.4)' : 'rgba(98,126,234,0.4)') : 'var(--border2)'}`,
                  }}
                >
                  {c === 'BTC' ? '₿ Bitcoin' : '⬡ Ethereum'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
              Message to agency *
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              required
              placeholder="e.g. I have sent the payment. Please check and confirm."
              style={{
                width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none', resize: 'vertical', lineHeight: 1.6,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowPayForm(false)} style={{
              flex: 1, padding: '11px', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--border2)',
              color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{
              flex: 2, padding: '11px', borderRadius: 10,
              background: 'var(--brand)', border: 'none', color: '#0D0E0F',
              fontFamily: 'var(--font-sans)', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Sending…' : 'Send Payment Notification →'}
            </button>
          </div>
        </form>
      )}

      {quotation.status === 'pending_confirmation' && (
        <div style={{ textAlign: 'center', padding: '0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Your payment receipt has been sent to the agency.<br />
          You will receive an email once it is confirmed.
        </div>
      )}

      {quotation.status === 'paid' && (
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--success)', fontWeight: 700 }}>Payment confirmed by agency</div>
        </div>
      )}
    </div>
  );
}