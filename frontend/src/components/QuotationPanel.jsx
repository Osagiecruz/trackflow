import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function QuotationPanel({ shipmentId, agencyId }) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [items, setItems] = useState([{ description: '', amount: '' }]);
  const [btcAddress, setBtcAddress] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => { loadQuotation(); }, [shipmentId]);

  async function loadQuotation() {
    setLoading(true);
    try {
      const { data } = await api.get(`/quotations/shipment/${shipmentId}`);
      setQuotation(data.quotation);
      // Pre-fill form for editing
      setItems(data.quotation.items.map(i => ({ description: i.description, amount: i.amount })));
      setBtcAddress(data.quotation.btc_address || '');
      setEthAddress(data.quotation.eth_address || '');
      setNotes(data.quotation.notes || '');
      setCurrency(data.quotation.currency || 'USD');
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load quotation');
      }
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setItems(prev => [...prev, { description: '', amount: '' }]);
  }

  function removeItem(i) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i, field, value) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  const total = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  async function saveQuotation(e) {
    e.preventDefault();
    if (items.some(i => !i.description || !i.amount)) {
      toast.error('Fill in all item descriptions and amounts');
      return;
    }
    if (!btcAddress && !ethAddress) {
      toast.error('Add at least one crypto payment address');
      return;
    }

    setSaving(true);
    try {
      if (quotation) {
        const { data } = await api.put(`/quotations/${quotation.id}`, {
          items, btc_address: btcAddress, eth_address: ethAddress, notes, currency,
        });
        setQuotation(data.quotation);
        toast.success('Quotation updated');
      } else {
        const { data } = await api.post('/quotations', {
          shipment_id: shipmentId,
          items, btc_address: btcAddress, eth_address: ethAddress, notes, currency,
        });
        setQuotation(data.quotation);
        toast.success('Quotation created and client notified by email');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save quotation');
    } finally {
      setSaving(false);
    }
  }

  async function confirmPayment() {
    if (!confirm('Confirm that you have received the crypto payment?')) return;
    setConfirming(true);
    try {
      await api.post(`/quotations/${quotation.id}/confirm`);
      toast.success('Payment confirmed and client notified');
      loadQuotation();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  }

  const statusConfig = {
    unpaid: { label: 'Unpaid', color: 'var(--danger)', bg: 'rgba(226,75,74,0.12)' },
    pending_confirmation: { label: 'Payment Submitted — Awaiting Confirmation', color: 'var(--warning)', bg: 'rgba(232,160,32,0.12)' },
    paid: { label: 'Paid ✓', color: 'var(--success)', bg: 'rgba(61,184,122,0.12)' },
  };

  const inputStyle = {
    background: 'var(--surface3)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: '10px 12px', color: 'var(--text)',
    fontFamily: 'var(--font-sans)', fontSize: '0.85rem', outline: 'none',
  };

  if (loading) return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1rem' }}>Quotation & Payment</div>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>
          Quotation & Payment
        </div>
        {quotation?.status !== 'paid' && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: '0.78rem',
              fontFamily: 'var(--font-sans)', fontWeight: 700, cursor: 'pointer',
              background: showForm ? 'var(--surface3)' : 'var(--brand)',
              color: showForm ? 'var(--text)' : '#0D0E0F',
              border: `1px solid ${showForm ? 'var(--border2)' : 'var(--brand)'}`,
            }}
          >
            {showForm ? 'Cancel' : quotation ? 'Edit Quotation' : '+ Create Quotation'}
          </button>
        )}
      </div>

      {/* Existing quotation display */}
      {quotation && !showForm && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-block',
              background: statusConfig[quotation.status]?.bg,
              color: statusConfig[quotation.status]?.color,
              fontSize: '0.72rem', fontWeight: 700,
              padding: '3px 12px', borderRadius: 20,
              border: `1px solid ${statusConfig[quotation.status]?.color}44`,
            }}>
              {statusConfig[quotation.status]?.label}
            </span>
          </div>

          {/* Line items */}
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
            {quotation.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < quotation.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{quotation.currency} {parseFloat(item.amount).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '4px', borderTop: '2px solid var(--border2)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Total</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand)' }}>{quotation.currency} {parseFloat(quotation.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Crypto addresses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {quotation.btc_address && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>BTC Address</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#F7931A', wordBreak: 'break-all' }}>{quotation.btc_address}</div>
              </div>
            )}
            {quotation.eth_address && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>ETH Address</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#627EEA', wordBreak: 'break-all' }}>{quotation.eth_address}</div>
              </div>
            )}
          </div>

          {quotation.notes && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--surface2)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              {quotation.notes}
            </div>
          )}

          {/* Payment submissions */}
          {quotation.submissions?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Payment Submissions</div>
              {quotation.submissions.map((sub, i) => (
                <div key={i} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{sub.crypto_currency} payment</span>
                    <span style={{ fontSize: '0.72rem', color: sub.status === 'confirmed' ? 'var(--success)' : 'var(--warning)' }}>{sub.status}</span>
                  </div>
                  {sub.message && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.message}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Confirm payment button */}
          {quotation.status === 'pending_confirmation' && (
            <button
              onClick={confirmPayment}
              disabled={confirming}
              style={{
                width: '100%', padding: '11px', borderRadius: 10,
                background: 'rgba(61,184,122,0.15)', border: '1px solid rgba(61,184,122,0.3)',
                color: 'var(--success)', fontFamily: 'var(--font-sans)',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              {confirming ? 'Confirming…' : '✓ Confirm Payment Received'}
            </button>
          )}
        </div>
      )}

      {/* Create/Edit form */}
      {showForm && (
        <form onSubmit={saveQuotation}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
              {['USD', 'EUR', 'GBP', 'NGN'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Line items */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>Items</label>
              <button type="button" onClick={addItem} style={{ fontSize: '0.75rem', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>+ Add item</button>
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={item.description}
                  onChange={e => updateItem(i, 'description', e.target.value)}
                  placeholder="e.g. Shipping fee"
                  style={{ ...inputStyle, flex: 2 }}
                  required
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={e => updateItem(i, 'amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{ ...inputStyle, flex: 1 }}
                  required
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>×</button>
                )}
              </div>
            ))}
            <div style={{ textAlign: 'right', fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand)', marginTop: 8 }}>
              Total: {currency} {total.toFixed(2)}
            </div>
          </div>

          {/* Crypto addresses */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
              Bitcoin (BTC) Address
            </label>
            <input value={btcAddress} onChange={e => setBtcAddress(e.target.value)} placeholder="bc1q…" style={{ ...inputStyle, width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }} />
          </div>

          <div style={{ marginBottom: '0.875rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
              Ethereum (ETH) Address
            </label>
            <input value={ethAddress} onChange={e => setEthAddress(e.target.value)} placeholder="0x…" style={{ ...inputStyle, width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
              Notes (optional)
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Payment instructions, due date, etc."
              style={{ ...inputStyle, width: '100%', resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'var(--brand)', border: 'none', color: '#0D0E0F',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : quotation ? 'Update Quotation' : 'Create Quotation & Notify Client'}
          </button>
        </form>
      )}

      {!quotation && !showForm && (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
          No quotation yet. Create one to request payment from the client.
        </div>
      )}
    </div>
  );
}