import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import styled from './Layout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', exact: true, icon: '◈' },
  { to: '/dashboard/shipments', label: 'Shipments', icon: '📦' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export default function Layout() {
  const { agency, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, background: 'var(--brand)',
              borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#0D0E0F',
            }}>TF</div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>TrackFlow</span>
          </a>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                background: isActive ? 'rgba(232,160,32,0.1)' : 'transparent',
                marginBottom: 2,
                transition: 'all 0.15s',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Agency info + logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 2 }}>{agency?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{agency?.email}</div>
            <div style={{
              display: 'inline-block', marginTop: 4,
              background: 'rgba(232,160,32,0.15)', color: 'var(--brand)',
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{agency?.plan || 'starter'}</div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', padding: '8px', borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border2)',
              color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--surface2)'; e.target.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-muted)'; }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--dark)' }}>
        <Outlet />
      </main>
    </div>
  );
}
