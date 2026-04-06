import { useState, useEffect, useRef } from 'react';

// ─── Shared animation hooks ───────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, direction = 'up' }) {
  const [ref, inView] = useInView();
  const transforms = { up: 'translateY(28px)', left: 'translateX(-28px)', right: 'translateX(28px)', none: 'none' };
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : transforms[direction], transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Shared Nav ────────────────────────────────────────
function PublicNav() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: 64, borderBottom: '1px solid var(--border)', background: 'rgba(13,14,15,0.96)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', textDecoration: 'none', color: 'var(--text)' }}>
        <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
        TrackFlow
      </a>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/reviews', 'Reviews'], ['/faq', 'FAQ'], ['/contact', 'Contact']].map(([href, label]) => (
          <a key={href} href={href} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >{label}</a>
        ))}
        <a href="/client/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Track Package</a>
        <a href="/login" style={{ background: 'var(--brand)', color: '#0D0E0F', padding: '7px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>Agency Login</a>
      </div>
    </nav>
  );
}

function PublicFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '2.5rem 2rem', background: 'var(--surface)' }}>
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

// ─── Page hero with bg image ───────────────────────────
function PageHero({ badge, title, subtitle, image, height = '52vh' }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: height, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.2)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,14,15,0.2) 0%, rgba(13,14,15,0.85) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(circle, rgba(232,160,32,0.1) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', padding: '5rem 2rem', textAlign: 'center', width: '100%' }}>
        {badge && (
          <div style={{ display: 'inline-block', background: 'rgba(232,160,32,0.12)', border: '1px solid rgba(232,160,32,0.3)', color: 'var(--brand)', fontSize: '0.72rem', fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: '1.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {badge}
          </div>
        )}
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem' }}>{title}</h1>
        {subtitle && <p style={{ color: 'rgba(242,239,232,0.65)', fontSize: '1rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── About Page ────────────────────────────────────────
export function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <style>{`.hover-card{transition:transform 0.25s ease,box-shadow 0.25s ease}.hover-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(232,160,32,0.12)}`}</style>
      <PublicNav />

      <PageHero
        badge="Our Story"
        title={<>Built for the future<br />of <span style={{ color: 'var(--brand)' }}>global shipping</span></>}
        subtitle="TrackFlow was founded with one mission: make parcel tracking transparent, reliable, and accessible for everyone — whether you're a global logistics agency or someone waiting for a package from across the world."
        image="https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />

      {/* Mission split layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
          <FadeIn direction="left">
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '1rem' }}>Our Mission</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                Eliminating the anxiety of waiting for packages
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, fontSize: '0.92rem', marginBottom: '1.25rem' }}>
                To give every recipient real-time visibility into their shipment — from the moment it leaves the sender to the moment it arrives at their door.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, fontSize: '0.92rem', marginBottom: '2rem' }}>
                We support shipping across 198 countries and integrate with 42 major carriers worldwide, including DHL, FedEx, and UPS — with more being added regularly.
              </p>
              {[['🎯', 'Transparent tracking for every shipment'], ['🔒', 'Every agency manually verified'], ['⚡', 'Updates in under 2 seconds']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span> {text}
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn direction="right">
            <div style={{ borderRadius: 20, overflow: 'hidden', height: 380 }}>
              <img src="https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Logistics operation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </FadeIn>
        </div>

        {/* Value cards */}
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '5rem' }}>
            {[
              { icon: '🎯', title: 'Our Mission', text: 'Eliminate parcel anxiety. Every recipient deserves real-time visibility from dispatch to delivery.', color: 'rgba(232,160,32,0.1)', border: 'rgba(232,160,32,0.2)' },
              { icon: '🌍', title: 'Global Reach', text: 'We support 198 countries and 42 major carriers including DHL, FedEx, and UPS.', color: 'rgba(74,158,232,0.1)', border: 'rgba(74,158,232,0.2)' },
              { icon: '🔒', title: 'Trust & Security', text: 'Every agency is manually verified. Every client gets unique secure credentials.', color: 'rgba(61,184,122,0.1)', border: 'rgba(61,184,122,0.2)' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
                <div className="hover-card" style={{ background: 'var(--surface)', border: `1px solid ${item.border}`, borderRadius: 16, padding: '2rem', cursor: 'default' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>{item.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.72 }}>{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, overflow: 'hidden', marginBottom: '5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {[['2.4M+','Shipments/day'],['198','Countries'],['42','Carriers'],['99.4%','Accuracy'],['<2s','Update time'],['24/7','Uptime']].map(([n, l], i) => (
                <div key={l} style={{ textAlign: 'center', padding: '2.5rem 1rem', borderRight: i < 5 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)', marginBottom: 6 }}>{n}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Values */}
        <FadeIn>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>What we stand for</h2>
        </FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            ['Transparency', 'Every shipment update is logged and visible. No black boxes, no guesswork.'],
            ['Reliability', 'Our infrastructure is built for 99.9% uptime. When your package moves, you know instantly.'],
            ['Simplicity', 'Complex logistics made simple. One tracking ID is all a recipient needs.'],
            ['Integrity', 'We manually verify every shipping agency on our platform to protect our users.'],
          ].map(([title, desc], i) => (
            <FadeIn key={title} delay={i * 80}>
              <div className="hover-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'default' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', marginTop: 8, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.92rem' }}>{title}</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</div>
                </div>
              </div>
            </FadeIn>
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
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:trackflow.eu@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${body}`);
    setSent(true);
  }

  const inputStyle = { width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.2s' };
  const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <PublicNav />
      <PageHero
        badge="Get in Touch"
        title={<>We'd love to <span style={{ color: 'var(--brand)' }}>hear from you</span></>}
        subtitle="Have a question, partnership inquiry, or need support? Our team responds within 1–2 business days."
        image="https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=1920"
        height="44vh"
      />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
          {/* Contact info */}
          <FadeIn direction="left">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Contact Information</h3>
              {[
                { icon: '✉️', label: 'Email', value: 'trackflow.eu@gmail.com', link: 'mailto:trackflow.eu@gmail.com' },
                { icon: '⏰', label: 'Response time', value: 'Within 1–2 business days' },
                { icon: '🛡️', label: 'Agency applications', value: '1–2 business days review' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 3 }}>{item.label}</div>
                    {item.link ? <a href={item.link} style={{ fontSize: '0.88rem', color: 'var(--brand)', fontWeight: 600 }}>{item.value}</a> : <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{item.value}</div>}
                  </div>
                </div>
              ))}

              <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 14, padding: '1.25rem', marginTop: '2rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>Are you a shipping agency?</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '0.75rem' }}>Apply for a verified agency account to start creating and managing shipments.</div>
                <a href="/agency/apply" style={{ color: 'var(--brand)', fontSize: '0.82rem', fontWeight: 700 }}>Apply now →</a>
              </div>

              {/* Response times */}
              <div style={{ marginTop: '2rem' }}>
                {[['General inquiries', '1–2 business days'], ['Technical support', 'Same business day'], ['Agency applications', '1–2 business days'], ['Partnership requests', '2–3 business days']].map(([type, time]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{type}</span>
                    <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--success)' }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn direction="right">
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '2rem' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Opening your email client…</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Your message was pre-filled. Hit send in your email app to complete.</p>
                  <button onClick={() => setSent(false)} style={{ padding: '9px 20px', borderRadius: 9, background: 'var(--surface3)', border: '1px solid var(--border2)', color: 'var(--text)', fontFamily: 'var(--font-sans)', cursor: 'pointer', fontSize: '0.85rem' }}>Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send a message</h3>
                  {[['name', 'Your Name', 'text', 'John Smith'], ['email', 'Email Address', 'email', 'you@example.com'], ['subject', 'Subject', 'text', 'How can we help?']].map(([name, label, type, ph]) => (
                    <div key={name} style={{ marginBottom: '1rem' }}>
                      <label style={labelStyle}>{label}</label>
                      <input name={name} type={type} value={form[name]} onChange={set} required placeholder={ph} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                    </div>
                  ))}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Message</label>
                    <textarea name="message" value={form.message} onChange={set} required rows={4} placeholder="Tell us more about your inquiry…"
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: 10, background: 'var(--brand)', border: 'none', color: '#0D0E0F', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}>
                    Send Message →
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
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
      <style>{`.hover-card{transition:transform 0.25s ease,border-color 0.25s ease}.hover-card:hover{transform:translateY(-4px)}`}</style>
      <PublicNav />
      <PageHero
        badge="Products & Services"
        title={<>Everything you need to<br /><span style={{ color: 'var(--brand)' }}>deliver with confidence</span></>}
        subtitle="Comprehensive shipping tools for agencies and a premium tracking experience for their clients."
        image="https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        {/* Main services with image */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {[
            { img: 'https://images.pexels.com/photos/7252972/pexels-photo-7252972.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Real-Time Parcel Tracking', desc: 'Live status from 42 global carriers, refreshed every 5 minutes. Interactive route map, full timeline, and estimated delivery.' },
            { img: 'https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Secure Client Portal', desc: 'Each recipient gets a unique login emailed automatically. Private, secure, no random access. Built-in quotation and crypto payment.' },
            { img: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Agency Dashboard', desc: 'Full-featured operations portal. Create shipments, manage clients, track analytics, and get webhook integrations.' },
          ].map((s, i) => (
            <FadeIn key={s.title} delay={i * 100}>
              <div className="hover-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', cursor: 'default' }}>
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Feature grid */}
        <FadeIn>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem', textAlign: 'center' }}>All Features</h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '5rem' }}>
          {[
            { icon: '📦', title: 'Real-Time Tracking', features: ['Live status every 5 mins', 'Interactive route map', 'Full event timeline', 'ETA tracking'], color: 'rgba(232,160,32,0.1)' },
            { icon: '🔔', title: 'Notifications', features: ['Email via SendGrid', 'SMS via Twilio', 'Customizable triggers', 'Notification log'], color: 'rgba(74,158,232,0.1)' },
            { icon: '💰', title: 'Crypto Payments', features: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Itemized quotations', 'Agency confirmation'], color: 'rgba(247,147,26,0.1)' },
            { icon: '🏢', title: 'Agency Dashboard', features: ['Shipment management', 'Analytics & reports', 'Bulk import (500)', 'Webhook integrations'], color: 'rgba(61,184,122,0.1)' },
            { icon: '🔐', title: 'Client Portal', features: ['Auto-generated login', 'Private tracking view', 'Progress tracker', 'JWT authentication'], color: 'rgba(139,92,246,0.1)' },
            { icon: '🛰️', title: 'Carrier Integrations', features: ['DHL Express', 'FedEx International', 'UPS Worldwide', 'Custom/manual'], color: 'rgba(226,75,74,0.1)' },
          ].map((s, i) => (
            <FadeIn key={s.title} delay={i * 80}>
              <div className="hover-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', cursor: 'default' }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '1rem' }}>{s.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.875rem' }}>{s.title}</h3>
                {s.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span style={{ color: 'var(--success)', fontSize: '0.7rem' }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Pricing */}
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Simple, transparent pricing</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start free. Scale when you're ready.</p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Starter', price: 'Free', period: 'forever', desc: 'Perfect for getting started', features: ['1 shipment total', 'Email notifications', 'Client tracking portal', 'Manual event updates', 'Basic analytics'], cta: 'Apply for access', href: '/agency/apply', featured: false },
            { name: 'Pro', price: '$50', period: 'per month', desc: 'For growing agencies', features: ['10 shipments/month + rollover', 'Email + SMS notifications', 'Live carrier sync', 'Webhook integrations', 'Advanced analytics', 'Priority support'], cta: 'Apply for access', href: '/agency/apply', featured: true },
            { name: 'Enterprise', price: 'Custom', period: 'contact us', desc: 'For large scale operations', features: ['Unlimited shipments', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'White-label options'], cta: 'Contact us', href: '/contact', featured: false },
          ].map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 100}>
              <div className="hover-card" style={{ background: 'var(--surface)', borderRadius: 18, padding: '2rem', border: plan.featured ? '2px solid var(--brand)' : '1px solid var(--border2)', position: 'relative', cursor: 'default' }}>
                {plan.featured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: '#0D0E0F', fontSize: '0.7rem', fontWeight: 700, padding: '3px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>Most Popular</div>}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', color: plan.featured ? 'var(--brand)' : 'var(--text)' }}>{plan.price}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{plan.period}</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 8 }}>{plan.desc}</div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                  {plan.features.map(f => <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}><span style={{ color: 'var(--success)' }}>✓</span> {f}</li>)}
                </ul>
                <a href={plan.href} style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', background: plan.featured ? 'var(--brand)' : 'transparent', color: plan.featured ? '#0D0E0F' : 'var(--text)', border: plan.featured ? 'none' : '1px solid var(--border2)', textDecoration: 'none' }}>
                  {plan.cta} →
                </a>
              </div>
            </FadeIn>
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
    { name: 'Aisha Bello', role: 'Operations Manager, SwiftCargo Nigeria', rating: 5, avatar: 'AB', text: 'TrackFlow completely transformed how we communicate with our clients. Instead of fielding dozens of "where is my package" calls daily, clients now track in real time. The email notifications are professional and our customer satisfaction score jumped significantly.' },
    { name: 'Marcus Weber', role: 'Founder, EuroShip GmbH', rating: 5, avatar: 'MW', text: 'The agency approval process gave me confidence that I was joining a serious platform. Setup took less than an hour and the DHL integration worked perfectly out of the box. My clients love the tracking portal.' },
    { name: 'Priya Sharma', role: 'Logistics Director, IndiaExpress', rating: 5, avatar: 'PS', text: 'We process thousands of shipments monthly. TrackFlow handles the volume without breaking a sweat. The analytics dashboard helps us identify bottlenecks before they become problems. Highly recommend.' },
    { name: "James O'Brien", role: 'CEO, Dublin Freight Services', rating: 5, avatar: 'JO', text: 'What sets TrackFlow apart is the client portal. Each recipient gets their own secure login — no more sharing public tracking links that anyone can see. It feels premium and our enterprise clients noticed.' },
    { name: 'Fatima Al-Rashid', role: 'E-commerce Manager, Riyadh Retail', rating: 5, avatar: 'FA', text: "The setup was surprisingly straightforward. The documentation is clear, the support team responded within hours, and the platform hasn't had a single outage since we onboarded three months ago." },
    { name: 'Chen Wei', role: 'Supply Chain Head, ShenTrade Co.', rating: 4, avatar: 'CW', text: "Solid platform with great carrier coverage. The FedEx and UPS integrations work well for our cross-border shipments. Would love to see more Asian carriers added but the team said they're working on it." },
  ];

  const avatarColors = ['rgba(232,160,32,0.15)', 'rgba(74,158,232,0.15)', 'rgba(61,184,122,0.15)', 'rgba(139,92,246,0.15)', 'rgba(226,75,74,0.15)', 'rgba(247,147,26,0.15)'];
  const textColors = ['var(--brand)', 'var(--info)', 'var(--success)', 'var(--purple)', 'var(--danger)', '#F7931A'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <style>{`.hover-card{transition:transform 0.25s ease,box-shadow 0.25s ease}.hover-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.3)}`}</style>
      <PublicNav />
      <PageHero
        badge="Customer Reviews"
        title={<>Trusted by agencies <span style={{ color: 'var(--brand)' }}>worldwide</span></>}
        subtitle="Hear from shipping agencies and logistics teams who rely on TrackFlow every day."
        image="https://images.pexels.com/photos/7252972/pexels-photo-7252972.jpeg?auto=compress&cs=tinysrgb&w=1920"
        height="44vh"
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        {/* Summary bar */}
        <FadeIn>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '2.5rem', marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
            {[['4.9/5', 'Average rating'], ['500+', 'Agency reviews'], ['98%', 'Would recommend'], ['42', 'Carriers supported']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)', marginBottom: 4 }}>{n}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Reviews grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 80}>
              <div className="hover-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.75rem', cursor: 'default', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: '1rem' }}>
                  {[...Array(r.rating)].map((_, j) => <span key={j} style={{ color: 'var(--brand)', fontSize: 16 }}>★</span>)}
                  {[...Array(5 - r.rating)].map((_, j) => <span key={j} style={{ color: 'var(--surface3)', fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.78, marginBottom: '1.5rem', fontStyle: 'italic', flex: 1 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: textColors[i % textColors.length], flexShrink: 0 }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>{r.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* CTA */}
        <FadeIn>
          <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 20, padding: '3rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Ready to join them?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Apply for agency access today — reviewed within 1–2 business days.</p>
            <a href="/agency/apply" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '13px 30px', borderRadius: 10, fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none' }}>
              Apply for Access →
            </a>
          </div>
        </FadeIn>
      </div>
      <PublicFooter />
    </div>
  );
}

// ─── FAQ Page ──────────────────────────────────────────
export function FAQPage() {
  const [open, setOpen] = useState(null);

  const faqs = [
    { category: 'For Recipients', items: [
      { q: 'How do I track my package?', a: 'Click "Track Package" at the top of the page and log in with the username and password emailed to you when your shipment was created. You\'ll see your package\'s full journey, current location, all past events, and estimated delivery date.' },
      { q: 'I didn\'t receive my login credentials. What do I do?', a: 'Check your spam/junk folder for an email from TrackFlow. The subject line will say "Your package is on its way". If you still can\'t find it, contact the shipping agency that sent your package.' },
      { q: 'How often is my tracking information updated?', a: 'For shipments using major carriers (DHL, FedEx, UPS), tracking data is refreshed every 5 minutes. You\'ll also receive an email notification automatically whenever your shipment status changes.' },
      { q: 'How do I pay the shipping invoice?', a: 'Once the agency creates a quotation, you\'ll see a Payment card on your tracking page showing itemized costs and crypto wallet addresses. You pay via Bitcoin or Ethereum, then click "I\'ve paid" to notify the agency. The agency confirms once they verify the transaction.' },
      { q: 'What does each status mean?', a: '"Awaiting Pickup" — package is ready but not yet collected. "In Transit" — moving through the carrier network. "Customs Cleared" — passed border inspection. "Out for Delivery" — on the final delivery vehicle. "Delivered" — arrived.' },
    ]},
    { category: 'For Agencies', items: [
      { q: 'How do I get an agency account?', a: 'Click "Apply for Access" and fill in your agency details and preferred subscription plan. Our team manually reviews all applications within 1–2 business days. You\'ll receive an email with your login credentials once approved.' },
      { q: 'What subscription plans are available?', a: 'Starter (free) allows 1 shipment. Pro ($50/month or $540/year — 10% off) gives 10 shipments per month with rollover. Both plans require payment verification for Pro via Bitcoin or Ethereum.' },
      { q: 'How do shipment rollover credits work?', a: 'On the Pro plan, unused shipments carry over to the next month. For example, if you use 6 of 10 in January, you\'ll have 14 available in February (4 rolled over + 10 new).' },
      { q: 'How do I create a quotation for a client?', a: 'Open any shipment in your dashboard, scroll to the Quotation & Payment section, and click "+ Create Quotation". Add your line items (shipping fee, customs, handling etc.), enter your BTC/ETH wallet addresses, and save. The client is emailed immediately.' },
      { q: 'Which carriers do you integrate with?', a: 'We currently support DHL Express, FedEx International, and UPS Worldwide for live automatic tracking. You can also add tracking events manually for any carrier.' },
    ]},
    { category: 'Technical & Security', items: [
      { q: 'How is my data protected?', a: 'All data is encrypted in transit (HTTPS/TLS) and at rest. Passwords are hashed using bcrypt with 12 salt rounds — we never store plain text passwords. Tokens expire and rotate automatically.' },
      { q: 'Do you sell or share my data?', a: 'Never. We do not sell, share, or rent any personal data to third parties. Data is used solely to provide the tracking service.' },
      { q: 'Do you have an API?', a: 'Yes. Agency accounts have full API access via JWT authentication. You can create shipments, add events, manage subscriptions, and receive webhook notifications. Contact us for API documentation.' },
    ]},
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <PublicNav />
      <PageHero
        badge="FAQ"
        title={<>Frequently Asked <span style={{ color: 'var(--brand)' }}>Questions</span></>}
        subtitle="Everything you need to know about TrackFlow. Can't find an answer? Contact us."
        image="https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=1920"
        height="40vh"
      />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '5rem 2rem' }}>
        {faqs.map(section => (
          <FadeIn key={section.category}>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '1.25rem' }}>
                {section.category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = open === key;
                  return (
                    <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${isOpen ? 'rgba(232,160,32,0.35)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                      <button onClick={() => setOpen(isOpen ? null : key)} style={{ width: '100%', padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isOpen ? 'var(--brand)' : 'var(--text)', flex: 1, paddingRight: '1rem', transition: 'color 0.2s' }}>{item.q}</span>
                        <span style={{ color: isOpen ? 'var(--brand)' : 'var(--text-dim)', fontSize: '1.1rem', fontWeight: 300, flexShrink: 0, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s, color 0.2s' }}>+</span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 1.25rem 1.25rem' }}>
                          <div style={{ height: 1, background: 'var(--border)', marginBottom: '1rem' }} />
                          <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: 1.78, margin: 0 }}>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        ))}

        <FadeIn>
          <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 18, padding: '2.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Still have questions?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', marginBottom: '1.25rem' }}>Our team is happy to help with anything not covered here.</p>
            <a href="/contact" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '12px 26px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              Contact Support →
            </a>
          </div>
        </FadeIn>
      </div>
      <PublicFooter />
    </div>
  );
}