import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,160,32,0.08) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', marginBottom: '2rem' }}>
            <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
            TrackFlow
          </a>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>{title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{subtitle}</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '2rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
          borderRadius: 10, padding: '12px 14px', color: 'var(--text)',
          fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--brand)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'}
      />
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your agency account">
      <form onSubmit={handleSubmit}>
        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@agency.com" required />
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--brand)' }}>Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: 10,
          background: 'var(--brand)', border: 'none', color: '#0D0E0F',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        No account? <Link to="/agency/apply" style={{ color: 'var(--brand)', fontWeight: 700 }}>Apply for agency access</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
export { LoginPage };

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '' });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
      toast.success('Welcome to TrackFlow!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create agency account" subtitle="Start tracking shipments in minutes">
      <form onSubmit={handleSubmit}>
        <Field label="Agency name" value={form.name} onChange={set('name')} placeholder="Acme Shipping Co." required />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@agency.com" required />
        <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
        <Field label="Country (2-letter code)" value={form.country} onChange={set('country')} placeholder="US, GB, DE, NG…" />
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: 10, marginTop: '0.5rem',
          background: 'var(--brand)', border: 'none', color: '#0D0E0F',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 700 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
