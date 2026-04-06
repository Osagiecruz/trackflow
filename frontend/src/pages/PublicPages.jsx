import { useState } from 'react';

// ─── Shared Nav ────────────────────────────────────────
function PublicNav() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: 64, borderBottom: '1px solid var(--border)',
      background: 'rgba(13,14,15,0.95)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
        <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
        TrackFlow
      </a>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/contact', 'Contact']].map(([href, label]) => (
          <a key={href} href={href} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{label}</a>
        ))}
        <a href="/client/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track Package</a>
        <a href="/login" style={{ background: 'var(--brand)', color: '#0D0E0F', padding: '7px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700 }}>Agency Login</a>
      </div>
    </nav>
  );
}

function PublicFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-muted)' }}>TrackFlow © 2025</div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/reviews', 'Reviews'], ['/faq', 'FAQ'], ['/contact', 'Contact']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── About Page ────────────────────────────────────────
export function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <PublicNav />

      {/* Hero */}
      <div style={{
        padding: '5rem 2rem 4rem', textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,160,32,0.08) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'inline-block', background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)', color: 'var(--brand)', fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 20, marginBottom: '1.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Our Story
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Built for the future<br />of global shipping
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
          TrackFlow was founded with one mission: make parcel tracking transparent, reliable, and accessible for everyone — whether you're a global logistics agency or someone waiting for a package from across the world.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Mission */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {[
            { icon: '🎯', title: 'Our Mission', text: 'To eliminate the anxiety of waiting for packages by giving every recipient real-time visibility into their shipment — from the moment it leaves the sender to the moment it arrives at their door.' },
            { icon: '🌍', title: 'Global Reach', text: 'We support shipping across 198 countries and integrate with 42 major carriers worldwide, including DHL, FedEx, and UPS — with more being added regularly.' },
            { icon: '🔒', title: 'Trust & Security', text: 'Every piece of tracking data is encrypted, every agency is manually verified, and every client receives unique secure credentials. Your privacy is never an afterthought.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '3rem', marginBottom: '4rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2.5rem' }}>TrackFlow by the numbers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
            {[
              ['2.4M+', 'Shipments tracked daily'],
              ['198', 'Countries covered'],
              ['42', 'Carrier integrations'],
              ['99.4%', 'Tracking accuracy'],
              ['<2s', 'Average update time'],
              ['24/7', 'System uptime'],
            ].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)', marginBottom: 6 }}>{num}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>What we stand for</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            ['Transparency', 'Every shipment update is logged and visible. No black boxes, no guesswork.'],
            ['Reliability', 'Our infrastructure is built for 99.9% uptime. When your package moves, you know instantly.'],
            ['Simplicity', 'Complex logistics made simple. One tracking ID is all a recipient needs.'],
            ['Integrity', 'We manually verify every shipping agency on our platform to protect our users.'],
          ].map(([title, desc]) => (
            <div key={title} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '1.25rem 1.5rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', marginTop: 8, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>{title}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

// ─── Contact Page ──────────────────────────────────────
export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    // Opens default email client with pre-filled email
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:trackflow.eu@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${body}`);
    setSent(true);
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
    borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <PublicNav />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>Get in touch</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Have a question, partnership inquiry, or need support? We'd love to hear from you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Contact info */}
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Email us directly</h3>
              <a href="mailto:trackflow.eu@gmail.com" style={{ color: 'var(--brand)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                trackflow.eu@gmail.com
              </a>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Response times</h3>
              {[
                ['General inquiries', '1–2 business days'],
                ['Technical support', 'Same business day'],
                ['Agency applications', '1–2 business days'],
                ['Partnership requests', '2–3 business days'],
              ].map(([type, time]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{type}</span>
                  <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--success)' }}>{time}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>Are you a shipping agency?</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Apply for a verified agency account to start creating and managing shipments.
              </div>
              <a href="/agency/apply" style={{ color: 'var(--brand)', fontSize: '0.82rem', fontWeight: 700 }}>Apply now →</a>
            </div>
          </div>

          {/* Contact form */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.75rem' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Opening your email client…</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your message was pre-filled. Hit send in your email app to complete.</p>
                <button onClick={() => setSent(false)} style={{ marginTop: '1rem', padding: '9px 20px', borderRadius: 9, background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text)', fontFamily: 'var(--font-sans)', cursor: 'pointer', fontSize: '0.85rem' }}>Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Send a message</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Your Name</label>
                  <input name="name" value={form.name} onChange={set} required placeholder="John Smith" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input name="email" type="email" value={form.email} onChange={set} required placeholder="you@example.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Subject</label>
                  <input name="subject" value={form.subject} onChange={set} required placeholder="How can we help?" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Message</label>
                  <textarea name="message" value={form.message} onChange={set} required rows={4}
                    placeholder="Tell us more about your inquiry…"
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                </div>
                <button type="submit" style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: 'var(--brand)', border: 'none', color: '#0D0E0F',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}>
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

// ─── Services Page ─────────────────────────────────────
export function ServicesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <PublicNav />

      <div style={{ padding: '5rem 2rem 4rem', textAlign: 'center', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,160,32,0.08) 0%, transparent 70%)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.25rem' }}>
          Products & Services
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8, fontSize: '0.95rem' }}>
          Everything you need to deliver world-class shipping transparency to your customers.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Main products */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            {
              icon: '📦', title: 'Real-Time Parcel Tracking',
              desc: 'Give your clients a live view of their shipment at every stage — from collection to delivery. Our tracking engine polls carrier APIs every 5 minutes and pushes instant updates.',
              features: ['Live status updates', 'Interactive route map', 'Full event timeline', 'Estimated delivery tracking'],
              color: 'rgba(232,160,32,0.1)',
            },
            {
              icon: '🔔', title: 'Automated Notifications',
              desc: 'Keep recipients informed automatically. Email notifications fire the moment a shipment status changes — customs cleared, out for delivery, delivered.',
              features: ['Email notifications', 'SMS alerts', 'Customizable triggers', 'Notification log'],
              color: 'rgba(74,158,232,0.1)',
            },
            {
              icon: '🏢', title: 'Agency Dashboard',
              desc: 'A full-featured operations portal for shipping agencies. Create and manage shipments, track performance, view analytics, and manage client notifications.',
              features: ['Shipment management', 'Analytics & reporting', 'Bulk import', 'Webhook integrations'],
              color: 'rgba(61,184,122,0.1)',
            },
            {
              icon: '🔐', title: 'Secure Client Portal',
              desc: 'Each recipient gets a unique username and password emailed to them when their package is created. They log in to a private tracking view — no random access.',
              features: ['Auto-generated credentials', 'Private tracking view', 'Delivery progress bar', 'Secure JWT authentication'],
              color: 'rgba(139,92,246,0.1)',
            },
            {
              icon: '🛰️', title: 'Multi-Carrier Integration',
              desc: 'Connect to DHL, FedEx, and UPS with a single API key per carrier. Our adapter pattern makes adding new carriers simple.',
              features: ['DHL Express', 'FedEx International', 'UPS Worldwide', 'Custom/manual carriers'],
              color: 'rgba(245,158,11,0.1)',
            },
            {
              icon: '⚙️', title: 'Developer API',
              desc: 'Build on top of TrackFlow with our REST API. Create shipments, add events, manage subscriptions, and receive webhook notifications programmatically.',
              features: ['REST API', 'JWT authentication', 'Webhook delivery', 'Rate limiting'],
              color: 'rgba(226,75,74,0.1)',
            },
          ].map(s => (
            <div key={s.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: '1.25rem' }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{s.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {s.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span style={{ color: 'var(--success)', fontSize: '0.7rem' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pricing plans */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Simple, transparent pricing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start free. Scale when you're ready.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              name: 'Starter', price: 'Free', period: 'forever',
              desc: 'Perfect for getting started',
              features: ['Limited (1 shipment)', 'Email notifications', 'Client tracking portal', 'Manual event updates', 'Basic analytics'],
              cta: 'Apply for access', href: '/agency/apply', featured: false,
            },
            {
              name: 'Pro', price: '$50', period: 'per month',
              desc: 'For growing agencies',
              features: ['10 shipments/month', 'Email + SMS notifications', 'Live carrier sync (DHL, FedEx, UPS)', 'Webhook integrations', 'Advanced analytics', 'Priority support'],
              cta: 'Apply for access', href: '/agency/apply', featured: true,
            },
            {
              name: 'Enterprise', price: 'Custom', period: 'contact us',
              desc: 'For large scale operations',
              features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'White-label options', 'On-premise deployment'],
              cta: 'Contact us', href: '/contact', featured: false,
            },
          ].map(plan => (
            <div key={plan.name} style={{
              background: 'var(--surface)', borderRadius: 18, padding: '2rem',
              border: plan.featured ? '2px solid var(--brand)' : '1px solid var(--border2)',
              position: 'relative',
            }}>
              {plan.featured && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: '#0D0E0F', fontSize: '0.7rem', fontWeight: 700, padding: '3px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', color: plan.featured ? 'var(--brand)' : 'var(--text)' }}>{plan.price}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{plan.period}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 8 }}>{plan.desc}</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ color: 'var(--success)' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href={plan.href} style={{
                display: 'block', textAlign: 'center', padding: '11px',
                borderRadius: 10, fontWeight: 700, fontSize: '0.88rem',
                background: plan.featured ? 'var(--brand)' : 'transparent',
                color: plan.featured ? '#0D0E0F' : 'var(--text)',
                border: plan.featured ? 'none' : '1px solid var(--border2)',
                textDecoration: 'none',
              }}>
                {plan.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

// ─── Reviews Page ──────────────────────────────────────
export function ReviewsPage() {
  const reviews = [
    { name: 'Kester Wimmers', role: 'Operations Manager, SwiftCargo', rating: 5, text: 'TrackFlow completely transformed how we communicate with our clients. Instead of fielding dozens of "where is my package" calls daily, clients now track in real time. The email notifications are professional and our customer satisfaction score jumped significantly.' },
    { name: 'Marcus Weber', role: 'Founder, EuroShip GmbH', rating: 5, text: 'The agency approval process gave me confidence that I was joining a serious platform. Setup took less than an hour and the DHL integration worked perfectly out of the box. My clients love the tracking portal.' },
    { name: 'Priya Sharma', role: 'Logistics Director, IndiaExpress', rating: 5, text: 'We process thousands of shipments monthly. TrackFlow handles the volume without breaking a sweat. The analytics dashboard helps us identify bottlenecks before they become problems. Highly recommend.' },
    { name: 'James O\'Brien', role: 'CEO, Dublin Freight Services', rating: 5, text: 'What sets TrackFlow apart is the client portal. Each recipient gets their own secure login — no more sharing public tracking links that anyone can see. It feels premium and our enterprise clients noticed.' },
    { name: 'Fatima Al-Rashid', role: 'E-commerce Manager, Riyadh Retail', rating: 5, text: "The setup was surprisingly straightforward. The documentation is clear, the support team responded within hours, and the platform hasn't had a single outage since we onboarded three months ago." },
    { name: 'Chen Wei', role: 'Supply Chain Head, ShenTrade Co.', rating: 4, text: 'Solid platform with great carrier coverage. The FedEx and UPS integrations work well for our cross-border shipments. Would love to see more Asian carriers added but the team said they\'re working on it.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <PublicNav />

      <div style={{ padding: '5rem 2rem 4rem', textAlign: 'center', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,160,32,0.08) 0%, transparent 70%)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.25rem' }}>
          Trusted by agencies worldwide
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Hear from shipping agencies and logistics teams who rely on TrackFlow every day.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Summary stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
          {[['4.9/5', 'Average rating'], ['500+', 'Agency reviews'], ['98%', 'Would recommend']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)', marginBottom: 4 }}>{n}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Reviews grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {reviews.map(r => (
            <div key={r.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: '1rem' }}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <span key={i} style={{ color: 'var(--brand)', fontSize: 16 }}>★</span>
                ))}
                {Array.from({ length: 5 - r.rating }).map((_, i) => (
                  <span key={i} style={{ color: 'var(--surface3)', fontSize: 16 }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "{r.text}"
              </p>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{r.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ready to join them?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Apply for agency access today.</p>
          <a href="/agency/apply" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem' }}>
            Apply for Access →
          </a>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

// ─── FAQ Page ──────────────────────────────────────────
export function FAQPage() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      category: 'For Recipients',
      items: [
        { q: 'How do I track my package?', a: 'Click "Track Package" at the top of the page and log in with the username and password that were emailed to you when your shipment was created. You\'ll see your package\'s full journey including current location, all past events, and estimated delivery date.' },
        { q: 'I didn\'t receive my login credentials. What do I do?', a: 'Check your spam/junk folder for an email from TrackFlow. The subject line will say "Your package is on its way". If you still can\'t find it, contact the shipping agency that sent your package and ask them to resend your credentials.' },
        { q: 'How often is my tracking information updated?', a: 'For shipments using major carriers (DHL, FedEx, UPS), tracking data is refreshed every 5 minutes. You\'ll also receive an email notification automatically whenever your shipment status changes — no need to keep checking.' },
        { q: 'What does each status mean?', a: '"Awaiting Pickup" means your package is ready but the carrier hasn\'t collected it yet. "In Transit" means it\'s moving through the carrier network. "Customs Cleared" means it\'s passed border inspection. "Out for Delivery" means it\'s on the final delivery vehicle. "Delivered" means it has arrived.' },
        { q: 'Can I share my tracking link with someone else?', a: 'Your login credentials are personal and we recommend keeping them private. However, you can share your screen or show someone the tracking page while you\'re logged in.' },
      ],
    },
    {
      category: 'For Agencies',
      items: [
        { q: 'How do I get an agency account?', a: 'Click "Apply for Access" and fill in your agency details. Our team manually reviews all applications to verify legitimacy — this protects both agencies and clients on the platform. You\'ll receive an email with your credentials within 1–2 business days once approved.' },
        { q: 'Why do agency accounts require manual approval?', a: 'We manually verify every agency to ensure that only legitimate shipping businesses use the platform. This prevents misuse and maintains the trust of recipients who share their personal information with us.' },
        { q: 'How do I create a shipment and notify the recipient?', a: 'Log in to your agency dashboard, go to Shipments, and click "New Shipment". Fill in the recipient\'s name and email address. The moment you save the shipment, TrackFlow automatically generates a unique username and password for the recipient and emails it to them.' },
        { q: 'Which carriers do you integrate with?', a: 'We currently support DHL Express, FedEx International, and UPS Worldwide for live automatic tracking. You can also add tracking events manually for any carrier, making TrackFlow flexible for all shipping arrangements.' },
        { q: 'Can I add tracking events manually?', a: 'Yes. Go to your dashboard, open a shipment, and click "+ Add Event". You can enter the status, description, and location. The system will automatically look up GPS coordinates from the location name, and email notifications will fire to the recipient immediately.' },
        { q: 'Is there a limit on how many shipments I can create?', a: 'The Starter plan offers just one shipment after account registration, after which you can go Pro. The Pro plan offers up to 10 shipments/month. Contact us if you need a custom arrangement for very high volumes.' },
      ],
    },
    {
      category: 'Technical & Security',
      items: [
        { q: 'How is my data protected?', a: 'All data is encrypted in transit (HTTPS/TLS) and at rest. Passwords are hashed using bcrypt with 12 salt rounds — we never store plain text passwords. Tokens expire and rotate automatically. Our infrastructure runs on secure managed cloud platforms.' },
        { q: 'Do you sell or share my data?', a: 'Never. We do not sell, share, or rent any personal data to third parties. Data is used solely to provide the tracking service.' },
        { q: 'What happens if I forget my password?', a: 'Agency accounts have a "Forgot Password" link on the login page. For client/recipient accounts, contact the shipping agency that sent your package — they can ask us to resend your credentials.' },
        { q: 'Do you have an API?', a: 'Yes. Agency accounts have full API access via JWT authentication. You can create shipments, add events, manage subscriptions, and receive webhook notifications. Contact us for API documentation.' },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <PublicNav />

      <div style={{ padding: '5rem 2rem 4rem', textAlign: 'center', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,160,32,0.08) 0%, transparent 70%)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.25rem' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Everything you need to know about TrackFlow. Can't find an answer? <a href="/contact" style={{ color: 'var(--brand)' }}>Contact us</a>.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
        {faqs.map(section => (
          <div key={section.category} style={{ marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '1.25rem' }}>
              {section.category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = open === key;
                return (
                  <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${isOpen ? 'rgba(232,160,32,0.3)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      style={{
                        width: '100%', padding: '1.1rem 1.25rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', flex: 1, paddingRight: '1rem' }}>{item.q}</span>
                      <span style={{ color: 'var(--brand)', fontSize: '1.1rem', fontWeight: 300, flexShrink: 0, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 16, padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Still have questions?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Our team is happy to help with anything not covered here.</p>
          <a href="/contact" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '11px 24px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem' }}>
            Contact Support →
          </a>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}