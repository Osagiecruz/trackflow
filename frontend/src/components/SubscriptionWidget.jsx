import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SubscriptionWidget() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [crypto, setCrypto] = useState('BTC');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/my'),
      api.get('/subscriptions/plans'),
    ]).then(([subRes, planRes]) => {
      setSubscription(subRes.data.subscription);
      setPendingPayment(subRes.data.pendingPayment);
      setPlans(planRes.data.plans);
    }).catch(() => toast.error('Failed to load subscription'))
      .finally(() => setLoading(false));
  }, []);

  const proPlan = plans.find(p => p.name === 'pro');
  const monthlyPrice = proPlan ? (proPlan.monthly_price / 100).toFixed(0) : '50';
  const yearlyPrice = proPlan ? (proPlan.yearly_price / 100).toFixed(0) : '540';
  const cryptoAddress = billingCycle === 'monthly'
    ? (crypto === 'BTC' ? proPlan?.btc_address : proPlan?.eth_address)
    : (crypto === 'BTC' ? proPlan?.btc_address : proPlan?.eth_address);

  const amount = billingCycle === 'monthly' ? `$${monthlyPrice}` : `$${yearlyPrice} (save 10%)`;

  async function submitPayment(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/subscriptions/pay', {
        plan: 'pro',
        billing_cycle: billingCycle,
        crypto_currency: crypto,
        message,
      });
      toast.success('Payment submitted! Admin will verify and activate your plan.');
      setShowUpgrade(false);
      // Refresh
      const res = await api.get('/subscriptions/my');
      setPendingPayment(res.data.pendingPayment);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  function copyAddress(addr) {
    if (!addr) { toast.error('No address configured yet. Contact admin.'); return; }
    navigator.clipboard.writeText(addr);
    toast.success('Address copied!');
  }

  if (loading) return null;

  const statusColors = {
    active: { color: 'var(--success)', bg: 'rgba(61,184,122,0.1)' },
    grace: { color: 'var(--warning)', bg: 'rgba(232,160,32,0.1)' },
    expired: { color: 'var(--danger)', bg: 'rgba(226,75,74,0.1)' },
    cancelled: { color: 'var(--danger)', bg: 'rgba(226,75,74,0.1)' },
  };
  const sc = statusColors[subscription?.status] || statusColors.active;

  const shipmentsUsed = subscription?.shipments_used || 0;
  const shipmentsTotal = (subscription?.shipments_limit || 1) + (subscription?.shipments_rollover || 0);
  const shipmentsLeft = Math.max(0, shipmentsTotal - shipmentsUsed);
  const usagePct = shipmentsTotal > 0 ? Math.min(100, Math.round((shipmentsUsed / shipmentsTotal) * 100)) : 0;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
        Subscription
      </div>

      {/* Plan + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
            {subscription?.plan || 'Starter'} Plan
          </div>
          {subscription?.billing_cycle && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2, textTransform: 'capitalize' }}>
              {subscription.billing_cycle} billing
            </div>
          )}
        </div>
        <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontSize: '0.72rem', fontWeight: 700, padding: '3px 12px', borderRadius: 20, textTransform: 'capitalize' }}>
          {subscription?.status || 'active'}
        </span>
      </div>

      {/* Shipment usage */}
      {subscription?.plan !== 'enterprise' && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Shipments used this period</span>
            <span style={{ fontWeight: 700, color: shipmentsLeft === 0 ? 'var(--danger)' : 'var(--text)' }}>
              {shipmentsUsed} / {shipmentsTotal}
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3 }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${usagePct}%`,
              background: usagePct >= 90 ? 'var(--danger)' : usagePct >= 70 ? 'var(--warning)' : 'var(--success)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          {subscription?.shipments_rollover > 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--info)', marginTop: 4 }}>
              Includes {subscription.shipments_rollover} rolled over from last period
            </div>
          )}
        </div>
      )}

      {/* Expiry */}
      {subscription?.current_period_end && subscription?.plan !== 'starter' && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {subscription.status === 'grace'
            ? `⚠️ Grace period ends ${new Date(subscription.grace_ends_at).toLocaleDateString()}`
            : `Renews ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
          }
        </div>
      )}

      {/* Pending payment notice */}
      {pendingPayment && (
        <div style={{ background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--warning)' }}>
          ⏳ Your payment for the {pendingPayment.plan} plan is under review. Admin will activate it shortly.
        </div>
      )}

      {/* Upgrade CTA */}
      {subscription?.plan === 'starter' && !pendingPayment && !showUpgrade && (
        <div>
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            You're on the <strong style={{ color: 'var(--text)' }}>Starter plan</strong> — 1 shipment total. Upgrade to Pro for 10 shipments/month with rollover.
          </div>
          <button onClick={() => setShowUpgrade(true)} style={{
            width: '100%', padding: '11px', borderRadius: 10,
            background: 'var(--brand)', border: 'none', color: '#0D0E0F',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          }}>
            Upgrade to Pro →
          </button>
        </div>
      )}

      {(subscription?.status === 'expired' || subscription?.status === 'grace') && !pendingPayment && !showUpgrade && (
        <button onClick={() => setShowUpgrade(true)} style={{
          width: '100%', padding: '11px', borderRadius: 10,
          background: 'var(--brand)', border: 'none', color: '#0D0E0F',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
        }}>
          Renew Subscription →
        </button>
      )}

      {/* Upgrade form */}
      {showUpgrade && (
        <form onSubmit={submitPayment} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Upgrade to Pro</h4>

          {/* Billing cycle */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>Billing Cycle</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['monthly', `$${monthlyPrice}/month`], ['yearly', `$${yearlyPrice}/year (10% off)`]].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setBillingCycle(val)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 9, fontSize: '0.8rem',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
                    background: billingCycle === val ? 'rgba(232,160,32,0.15)' : 'var(--surface3)',
                    color: billingCycle === val ? 'var(--brand)' : 'var(--text-muted)',
                    border: `1px solid ${billingCycle === val ? 'rgba(232,160,32,0.4)' : 'var(--border2)'}`,
                  }}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Crypto */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>Pay With</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['BTC', 'ETH'].map(c => (
                <button key={c} type="button" onClick={() => setCrypto(c)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 9, fontSize: '0.85rem',
                    fontFamily: 'var(--font-sans)', fontWeight: 700, cursor: 'pointer',
                    background: crypto === c ? (c === 'BTC' ? 'rgba(247,147,26,0.15)' : 'rgba(98,126,234,0.15)') : 'var(--surface3)',
                    color: crypto === c ? (c === 'BTC' ? '#F7931A' : '#627EEA') : 'var(--text-muted)',
                    border: `1px solid ${crypto === c ? (c === 'BTC' ? 'rgba(247,147,26,0.4)' : 'rgba(98,126,234,0.4)') : 'var(--border2)'}`,
                  }}
                >{c === 'BTC' ? '₿ BTC' : '⬡ ETH'}</button>
              ))}
            </div>
          </div>

          {/* Payment address */}
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Send {amount} in {crypto} to:
              </span>
              <button type="button" onClick={() => copyAddress(cryptoAddress)} style={{ fontSize: '0.72rem', color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                Copy
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: crypto === 'BTC' ? '#F7931A' : '#627EEA', wordBreak: 'break-all' }}>
              {cryptoAddress || 'Contact admin for payment address'}
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
              Message to admin (optional)
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
              placeholder="e.g. Payment sent. Transaction ID: abc123"
              style={{
                width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
                fontFamily: 'var(--font-sans)', fontSize: '0.85rem', outline: 'none', resize: 'vertical',
              }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowUpgrade(false)} style={{
              flex: 1, padding: '11px', borderRadius: 10, background: 'transparent',
              border: '1px solid var(--border2)', color: 'var(--text-muted)',
              fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{
              flex: 2, padding: '11px', borderRadius: 10, background: 'var(--brand)',
              border: 'none', color: '#0D0E0F', fontFamily: 'var(--font-sans)',
              fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Submitting…' : "I've Paid — Submit →"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}