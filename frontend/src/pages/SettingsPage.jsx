import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../utils/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { agency, updateAgency } = useAuth();
  const [profile, setProfile] = useState({ name: agency?.name || '', phone: agency?.phone || '', country: agency?.country || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authApi.updateProfile(profile);
      updateAgency(data.agency);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed. Please log in again.');
      setTimeout(() => window.location.href = '/login', 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  }

  const fieldStyle = {
    width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
    borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 };
  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' };
  const btnStyle = { padding: '11px 22px', borderRadius: 10, background: 'var(--brand)', border: 'none', color: '#0D0E0F', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' };

  return (
    <div style={{ padding: '2rem', maxWidth: 680 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your agency account</p>
      </div>

      {/* Plan */}
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Current Plan</div>
          <div style={{ display: 'inline-block', background: 'rgba(232,160,32,0.15)', color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {agency?.plan || 'Starter'}
          </div>
        </div>
        <button style={{ ...btnStyle, background: 'var(--surface3)', color: 'var(--text)', border: '1px solid var(--border2)' }}>Upgrade plan</button>
      </div>

      {/* Profile */}
      <div style={cardStyle}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Agency Profile</div>
        <form onSubmit={saveProfile}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Agency Name</label>
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={fieldStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={fieldStyle} placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))} style={fieldStyle} placeholder="US" maxLength={2} />
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email</label>
            <input value={agency?.email || ''} disabled style={{ ...fieldStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button type="submit" disabled={savingProfile} style={btnStyle}>
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div style={cardStyle}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Change Password</div>
        <form onSubmit={changePassword}>
          {[
            { label: 'Current Password', field: 'currentPassword' },
            { label: 'New Password', field: 'newPassword' },
            { label: 'Confirm New Password', field: 'confirm' },
          ].map(f => (
            <div key={f.field} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{f.label}</label>
              <input type="password" value={passwords[f.field]} onChange={e => setPasswords(p => ({ ...p, [f.field]: e.target.value }))} style={fieldStyle} required />
            </div>
          ))}
          <button type="submit" disabled={savingPw} style={btnStyle}>
            {savingPw ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* API Info */}
      <div style={cardStyle}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>API Access</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
          Use the TrackFlow API to create shipments, add events, and manage subscriptions programmatically.
        </p>
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          POST https://api.trackflow.io/api/shipments<br />
          Authorization: Bearer YOUR_JWT_TOKEN
        </div>
        <a href="https://docs.trackflow.io" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)', fontSize: '0.85rem', fontWeight: 600 }}>View API documentation →</a>
      </div>
    </div>
  );
}
