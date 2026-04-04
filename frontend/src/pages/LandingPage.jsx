import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64, borderBottom: '1px solid var(--border)',
        background: 'rgba(13,14,15,0.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
          TrackFlow
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {[
            ['/about', 'About'],
            ['/services', 'Services'],
            ['/reviews', 'Reviews'],
            ['/faq', 'FAQ'],
            ['/contact', 'Contact'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', display: window.innerWidth < 768 ? 'none' : 'block' }}>{label}</a>
          ))}
          <a href="/client/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Track Package</a>
          <a href="/login" style={{ background: 'var(--brand)', color: '#0D0E0F', padding: '7px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>Agency Login</a>
        </div>
      </nav>

      {/* Notification bar */}
      <div style={{ background: 'rgba(232,160,32,0.1)', borderBottom: '1px solid rgba(232,160,32,0.2)', padding: '10px 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--brand)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
        Live tracking active — 2.4M shipments tracked today across 198 countries
      </div>

      {/* Hero Section */}
      <div style={{
        padding: 'clamp(4rem,10vw,7rem) 2rem clamp(3rem,6vw,5rem)',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(232,160,32,0.12) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
      }}>
        {/* Decorative grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.3)',
            color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 700,
            padding: '6px 14px', borderRadius: 20, marginBottom: '1.75rem',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            🌍 Trusted by 500+ shipping agencies worldwide
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem,7vw,5rem)', fontWeight: 800,
            letterSpacing: '-0.05em', lineHeight: 1.0, marginBottom: '1.5rem',
            maxWidth: 800, margin: '0 auto 1.5rem',
          }}>
            Ship with confidence.<br />
            <span style={{ color: 'var(--brand)' }}>Track in real time.</span>
          </h1>

          <p style={{
            color: 'var(--text-muted)', fontSize: 'clamp(0.9rem,2vw,1.1rem)',
            maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.8,
          }}>
            TrackFlow connects shipping agencies and their clients with live parcel tracking, instant notifications, and a secure personal tracking portal — across 198 countries and 42 carriers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <a href="/client/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--brand)', color: '#0D0E0F',
              padding: '14px 28px', borderRadius: 12,
              fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            }}>
              Track Your Package →
            </a>
            <a href="/agency/apply" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: 'var(--text)',
              padding: '14px 28px', borderRadius: 12,
              fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
              border: '1px solid var(--border2)',
            }}>
              Apply as Agency
            </a>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Already an agency? <a href="/login" style={{ color: 'var(--brand)' }}>Sign in to your dashboard →</a>
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 0 }}>
          {[
            ['2.4M+', 'Shipments tracked daily'],
            ['198', 'Countries'],
            ['42', 'Carrier integrations'],
            ['99.4%', 'Accuracy rate'],
            ['<2s', 'Update speed'],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--brand)' }}>{num}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>How It Works</div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
            From dispatch to doorstep
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Three simple steps connect agencies with their clients in a secure, real-time tracking experience.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              step: '01', icon: '📋', title: 'Agency creates shipment',
              desc: 'A verified shipping agency creates a shipment in TrackFlow. They enter the recipient\'s details, package information, and assign a carrier.',
              color: 'rgba(232,160,32,0.1)', border: 'rgba(232,160,32,0.2)',
            },
            {
              step: '02', icon: '📧', title: 'Client receives credentials',
              desc: 'The recipient is automatically emailed a unique username and password. They use these to securely log in and track their specific package — no one else can see it.',
              color: 'rgba(74,158,232,0.1)', border: 'rgba(74,158,232,0.2)',
            },
            {
              step: '03', icon: '🛰️', title: 'Real-time updates flow',
              desc: 'As the package moves, TrackFlow syncs with the carrier every 5 minutes. The client sees live updates, a route map, and receives email alerts at every key milestone.',
              color: 'rgba(61,184,122,0.1)', border: 'rgba(61,184,122,0.2)',
            },
          ].map(s => (
            <div key={s.step} style={{ background: 'var(--surface)', border: `1px solid ${s.border}`, borderRadius: 18, padding: '2rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>{s.step}</div>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: '1.25rem' }}>{s.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Features</div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.04em' }}>
              Everything your clients deserve
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🗺️', title: 'Live route map', desc: 'Interactive world map showing the exact path of every shipment with animated waypoints.' },
              { icon: '🔔', title: 'Instant alerts', desc: 'Automatic email and SMS notifications at every status change — customs, delivery, exceptions.' },
              { icon: '🔐', title: 'Secure portal', desc: 'Each recipient gets a personal login. No shared links, no random access.' },
              { icon: '📊', title: 'Agency analytics', desc: 'Track delivery rates, shipment volumes, carrier performance and on-time stats.' },
              { icon: '🚚', title: 'Multi-carrier', desc: 'DHL, FedEx, UPS and more — all under one unified tracking interface.' },
              { icon: '⚡', title: 'Fast updates', desc: 'Carrier data refreshed every 5 minutes. Webhook events delivered in under 2 seconds.' },
              { icon: '🌍', title: '198 countries', desc: 'Track shipments anywhere in the world, including remote and emerging markets.' },
              { icon: '🛡️', title: 'Verified agencies', desc: 'Every agency is manually approved. Only legitimate businesses can create shipments.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two portals section */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
            Two portals, one platform
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontSize: '0.9rem' }}>
            TrackFlow serves both sides of every shipment — the agencies sending packages and the clients receiving them.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* For agencies */}
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(232,160,32,0.25)', borderRadius: 20, padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle, rgba(232,160,32,0.15) 0%, transparent 70%)', borderRadius: '0 20px 0 0' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '1rem' }}>For Shipping Agencies</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Run your operations from one dashboard</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Create shipments, manage clients, track performance analytics, and let TrackFlow handle all the communication automatically.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              {['Create & manage shipments', 'Auto-notify clients at every update', 'Analytics & delivery reporting', 'DHL/FedEx/UPS live sync', 'Webhook API integrations'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  <span style={{ color: 'var(--brand)', fontSize: '0.7rem' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <a href="/agency/apply" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              Apply for Agency Access →
            </a>
          </div>

          {/* For clients */}
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(74,158,232,0.25)', borderRadius: 20, padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle, rgba(74,158,232,0.15) 0%, transparent 70%)', borderRadius: '0 20px 0 0' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--info)', marginBottom: '1rem' }}>For Package Recipients</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Know exactly where your package is</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              When your package is on its way, you'll receive an email with your personal login. Use it to see your shipment in real time from anywhere.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              {['Secure personal login', 'Live map with route visualization', 'Full event timeline', 'Email alerts on every status change', 'Delivery progress tracker'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  <span style={{ color: 'var(--info)', fontSize: '0.7rem' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <a href="/client/login" style={{ display: 'inline-block', background: 'var(--info)', color: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              Track My Package →
            </a>
          </div>
        </div>
      </div>

      {/* Testimonials snippet */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: '0.75rem' }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: 'var(--brand)', fontSize: 20 }}>★</span>)}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>4.9/5 from 500+ agency reviews</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { text: 'TrackFlow completely transformed how we communicate with clients. No more "where is my package" calls.', name: 'Aisha Bello', role: 'Operations Manager, SwiftCargo Nigeria' },
              { text: 'The client portal is what sets TrackFlow apart. Each recipient gets their own secure login — it feels premium.', name: "James O'Brien", role: 'CEO, Dublin Freight Services' },
              { text: "Setup took less than an hour and the DHL integration worked perfectly. My clients love the tracking portal.", name: 'Marcus Weber', role: 'Founder, EuroShip GmbH' },
            ].map(r => (
              <div key={r.name} style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1rem', fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>{r.role}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/reviews" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600 }}>Read all reviews →</a>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
          Ready to transform your<br />
          <span style={{ color: 'var(--brand)' }}>shipping experience?</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
          Join hundreds of shipping agencies already using TrackFlow to deliver a world-class tracking experience to their clients.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/agency/apply" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
            Apply for Agency Access →
          </a>
          <a href="/contact" style={{ display: 'inline-block', background: 'transparent', color: 'var(--text)', padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', border: '1px solid var(--border2)' }}>
            Contact Us
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 24, height: 24, background: 'var(--brand)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
                TrackFlow
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
                Real-time parcel tracking across 198 countries and 42 carriers.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Company</div>
              {[['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], ['/reviews', 'Reviews'], ['/faq', 'FAQ']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Platform</div>
              {[['/client/login', 'Track Package'], ['/agency/apply', 'Apply as Agency'], ['/login', 'Agency Login'], ['/contact', 'Support']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Contact</div>
              <a href="mailto:trackflow.eu@gmail.com" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--brand)', marginBottom: 6 }}>trackflow.eu@gmail.com</a>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>Response within 1–2 business days</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>© 2025 TrackFlow. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <span key={l} style={{ fontSize: '0.72rem', color: 'var(--text-dim)', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
