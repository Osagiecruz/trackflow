import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function AgencyRequestPage() {
  const [form, setForm] = useState({
    agency_name: '', email: '', country: '',
    phone: '', website: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/agency-requests`, form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
    borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.7rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-dim)', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64, borderBottom: '1px solid var(--border)',
        background: 'rgba(13,14,15,0.95)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
          TrackFlow
        </a>
        <a href="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agency Login</a>
      </nav>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {submitted ? (
          <div style={{
            background: 'var(--surface)', border: '1px solid rgba(61,184,122,0.3)',
            borderRadius: 20, padding: '3rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Request submitted!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Thank you for your interest in TrackFlow. Our team will review your request and get back to you within 1–2 business days. You'll receive an email with your login credentials once approved.
            </p>
            <a href="/" style={{
              display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F',
              padding: '11px 24px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
            }}>Back to Home</a>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
                Apply for Agency Access
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                Fill in your details below. Our team reviews all applications manually to ensure platform integrity. You'll receive login credentials via email once approved.
              </p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '2rem' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Agency / Company Name *</label>
                    <input name="agency_name" value={form.agency_name} onChange={set} required placeholder="Acme Logistics Ltd." style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Business Email *</label>
                    <input name="email" type="email" value={form.email} onChange={set} required placeholder="contact@youragency.com" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Country (2-letter code) *</label>
                    <input name="country" value={form.country} onChange={set} required placeholder="NG, US, GB…" maxLength={2} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input name="phone" value={form.phone} onChange={set} placeholder="+234 800 000 0000" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Website</label>
                    <input name="website" type="url" value={form.website} onChange={set} placeholder="https://youragency.com" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Tell us about your business</label>
                    <textarea name="description" value={form.description} onChange={set}
                      placeholder="Briefly describe your shipping operations and how you plan to use TrackFlow…"
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '13px', borderRadius: 10,
                  background: 'var(--brand)', border: 'none', color: '#0D0E0F',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Submitting…' : 'Submit Application →'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Already approved? <a href="/login" style={{ color: 'var(--brand)' }}>Login here</a>
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}