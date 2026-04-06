import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dates';

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(null);
  const [activeTab, setActiveTab] = useState('agencies');
  const [subPayments, setSubPayments] = useState([]);
  const [subFilter, setSubFilter] = useState('pending');
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => { loadRequests(); }, [filter]);

  async function loadRequests() {
    setLoading(true);
    try {
      const { data } = await api.get(`/agency-requests${filter ? `?status=${filter}` : ''}`);
      setRequests(data.requests);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Admin access required');
      } else {
        toast.error('Failed to load requests');
      }
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    if (!confirm('Approve this agency and send them login credentials?')) return;
    setProcessing(id);
    try {
      const { data } = await api.post(`/agency-requests/${id}/approve`);
      toast.success(data.message);
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  }

  async function reject(id) {
    setProcessing(id);
    try {
      await api.post(`/agency-requests/${id}/reject`, { note: rejectNote });
      toast.success('Request rejected and applicant notified');
      setRejectModal(null);
      setRejectNote('');
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  }

  useEffect(() => {
    if (activeTab === 'subscriptions') loadSubPayments();
  }, [activeTab, subFilter]);

  async function loadSubPayments() {
    setSubLoading(true);
    try {
      const { data } = await api.get(`/subscriptions/payments?status=${subFilter}`);
      setSubPayments(data.payments);
    } catch { toast.error('Failed to load payments'); }
    finally { setSubLoading(false); }
  }

  async function confirmSubPayment(id) {
    if (!confirm('Confirm this subscription payment and activate the plan?')) return;
    try {
      await api.post(`/subscriptions/payments/${id}/confirm`);
      toast.success('Subscription activated!');
      loadSubPayments();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  }

  async function rejectSubPayment(id) {
    try {
      await api.post(`/subscriptions/payments/${id}/reject`);
      toast.success('Payment rejected');
      loadSubPayments();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  }

  const statusColors = {
    pending: { color: 'var(--warning)', bg: 'rgba(232,160,32,0.12)' },
    approved: { color: 'var(--success)', bg: 'rgba(61,184,122,0.12)' },
    rejected: { color: 'var(--danger)', bg: 'rgba(226,75,74,0.12)' },
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      {/* Main tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        {[['agencies', 'Agency Requests'], ['subscriptions', 'Subscription Payments']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveTab(val)} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem',
            fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
            background: activeTab === val ? 'var(--brand)' : 'var(--surface)',
            color: activeTab === val ? '#0D0E0F' : 'var(--text-muted)',
            border: `1px solid ${activeTab === val ? 'var(--brand)' : 'var(--border2)'}`,
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'agencies' && <>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['pending', 'approved', 'rejected', ''].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem',
              fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
              background: filter === s ? 'var(--brand)' : 'var(--surface)',
              color: filter === s ? '#0D0E0F' : 'var(--text-muted)',
              border: `1px solid ${filter === s ? 'var(--brand)' : 'var(--border2)'}`,
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Requests table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : !requests.length ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
            No {filter || ''} requests found.
          </div>
        ) : (
          <div>
            {requests.map((req, i) => (
              <div key={req.id} style={{
                padding: '1.5rem',
                borderBottom: i < requests.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{req.agency_name}</div>
                      <span style={{
                        display: 'inline-block',
                        background: statusColors[req.status]?.bg,
                        color: statusColors[req.status]?.color,
                        fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 10px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email </span>
                        <a href={`mailto:${req.email}`} style={{ fontSize: '0.82rem', color: 'var(--brand)' }}>{req.email}</a>
                      </div>
                      {req.country && (
                        <div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Country </span>
                          <span style={{ fontSize: '0.82rem' }}>{req.country}</span>
                        </div>
                      )}
                      {req.phone && (
                        <div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone </span>
                          <span style={{ fontSize: '0.82rem' }}>{req.phone}</span>
                        </div>
                      )}
                      {req.website && (
                        <div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Website </span>
                          <a href={req.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--brand)' }}>{req.website}</a>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Applied </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(req.created_at)}</span>
                      </div>
                    </div>

                    {req.description && (
                      <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
                        "{req.description}"
                      </div>
                    )}

                    {req.admin_note && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--danger)' }}>
                        Note: {req.admin_note}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                      <button
                        onClick={() => approve(req.id)}
                        disabled={processing === req.id}
                        style={{
                          padding: '9px 18px', borderRadius: 9,
                          background: 'rgba(61,184,122,0.15)',
                          border: '1px solid rgba(61,184,122,0.3)',
                          color: 'var(--success)',
                          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.82rem',
                          cursor: processing === req.id ? 'not-allowed' : 'pointer',
                          opacity: processing === req.id ? 0.6 : 1,
                        }}
                      >
                        {processing === req.id ? '…' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => { setRejectModal(req); setRejectNote(''); }}
                        disabled={processing === req.id}
                        style={{
                          padding: '9px 18px', borderRadius: 9,
                          background: 'rgba(226,75,74,0.1)',
                          border: '1px solid rgba(226,75,74,0.25)',
                          color: 'var(--danger)',
                          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {req.status !== 'pending' && req.reviewed_at && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right', flexShrink: 0 }}>
                      Reviewed {formatDate(req.reviewed_at)}<br />
                      by {req.reviewed_by}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>}

      {activeTab === 'subscriptions' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['pending', 'confirmed', 'rejected', ''].map(s => (
              <button key={s} onClick={() => setSubFilter(s)} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem',
                fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
                background: subFilter === s ? 'var(--brand)' : 'var(--surface)',
                color: subFilter === s ? '#0D0E0F' : 'var(--text-muted)',
                border: `1px solid ${subFilter === s ? 'var(--brand)' : 'var(--border2)'}`,
              }}>{s || 'All'}</button>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden' }}>
            {subLoading ? <div style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            : !subPayments.length ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.88rem' }}>No {subFilter} payments.</div>
            : subPayments.map((p, i) => (
              <div key={p.id} style={{ padding: '1.25rem 1.5rem', borderBottom: i < subPayments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.agency_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>{p.agency_email}</div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                      <span>Plan: <strong style={{ color: 'var(--brand)' }}>{p.plan} / {p.billing_cycle}</strong></span>
                      <span>Crypto: <strong>{p.crypto_currency}</strong></span>
                      <span style={{ color: p.status === 'confirmed' ? 'var(--success)' : p.status === 'rejected' ? 'var(--danger)' : 'var(--warning)', fontWeight: 700, textTransform: 'capitalize' }}>{p.status}</span>
                    </div>
                    {p.message && <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', maxWidth: 400 }}>{p.message}</div>}
                  </div>
                  {p.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => confirmSubPayment(p.id)} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(61,184,122,0.15)', border: '1px solid rgba(61,184,122,0.3)', color: 'var(--success)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>✓ Confirm</button>
                      <button onClick={() => rejectSubPayment(p.id)} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.25)', color: 'var(--danger)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>✕ Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    

      {/* Reject modal */}
      {rejectModal && (
        <div
          onClick={() => setRejectModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Reject Application</h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Rejecting <strong style={{ color: 'var(--text)' }}>{rejectModal.agency_name}</strong>. An email will be sent notifying them.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
                Reason (optional — included in rejection email)
              </label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="e.g. Insufficient business information provided"
                rows={3}
                style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => reject(rejectModal.id)}
                disabled={!!processing}
                style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'rgba(226,75,74,0.15)', border: '1px solid rgba(226,75,74,0.3)', color: 'var(--danger)', fontFamily: 'var(--font-sans)', fontWeight: 700, cursor: 'pointer' }}
              >
                {processing ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
