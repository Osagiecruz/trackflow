import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/client/login`, {
        username: form.username.trim().toUpperCase(),
        password: form.password,
      });
      localStorage.setItem('client_token', data.token);
      localStorage.setItem('client_info', JSON.stringify(data.client));
      navigate('/client/tracking');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--dark)',
      display: 'flex', flexDirection: 'column',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,160,32,0.08) 0%, transparent 70%)',
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,14,15,0.95)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
          TrackFlow
        </a>
        <a href="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Agency Login</a>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)',
              color: 'var(--brand)', fontSize: '0.72rem', fontWeight: 700,
              padding: '5px 12px', borderRadius: 20, marginBottom: '1rem',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              📦 Package Tracking Portal
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Track your package
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Use the username and password sent to your email when your shipment was created.
            </p>
          </div>

          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 20, padding: '2rem',
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
                  Username
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={set}
                  placeholder="e.g. TRK-29183746"
                  required
                  style={{
                    width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
                    borderRadius: 10, padding: '12px 14px', color: 'var(--text)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', outline: 'none',
                    letterSpacing: '0.04em',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={set}
                  placeholder="••••••••••"
                  required
                  style={{
                    width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
                    borderRadius: 10, padding: '12px 14px', color: 'var(--text)',
                    fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 10,
                  background: 'var(--brand)', border: 'none', color: '#0D0E0F',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Signing in…' : 'Track My Package →'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface2)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>Don't have credentials?</strong> Your username and password were sent to your email when your shipment was created. Check your inbox and spam folder for an email from TrackFlow.
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        TrackFlow © 2025 · <a href="/contact" style={{ color: 'var(--text-dim)' }}>Need help? Contact us</a>
      </footer>
    </div>
  );
}