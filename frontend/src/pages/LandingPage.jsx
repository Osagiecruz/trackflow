import { useState, useEffect, useRef } from 'react';

// ─── Animated counter hook ────────────────────────────
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(numeric)) { setCount(target); return; }
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numeric));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(numeric);
    };
    requestAnimationFrame(step);
  }, [start, target]);
  return count;
}

// ─── Intersection observer hook ──────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ─── Fade-in section wrapper ──────────────────────────
function FadeIn({ children, delay = 0, direction = 'up' }) {
  const [ref, inView] = useInView();
  const transforms = { up: 'translateY(32px)', left: 'translateX(-32px)', right: 'translateX(32px)', none: 'none' };
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : transforms[direction],
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Animated stat number ─────────────────────────────
function AnimatedStat({ value, label }) {
  const [ref, inView] = useInView();
  const isSpecial = value.includes('<') || value.includes('/') || value.includes('%') || value.includes('M') || value.includes('+');
  const count = useCountUp(value, 1800, inView);
  const suffix = value.replace(/[0-9.]/g, '').replace('2.4', '').trim();
  const prefix = value.startsWith('<') ? '<' : '';

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
      <div style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--brand)' }}>
        {isSpecial ? value : `${prefix}${count}${suffix}`}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

// ─── Live counter badge ────────────────────────────────
function LiveCounter() {
  const [count, setCount] = useState(2400000);
  useEffect(() => {
    const iv = setInterval(() => setCount(c => c + Math.floor(Math.random() * 3 + 1)), 1800);
    return () => clearInterval(iv);
  }, []);
  return <span>{(count / 1000000).toFixed(1)}M</span>;
}

// ─── Carrier ticker ────────────────────────────────────
const CARRIERS = ['DHL Express', 'FedEx International', 'UPS Worldwide', 'Royal Mail', 'La Poste', 'Deutsche Post', 'China Post', 'USPS', 'Australia Post', 'Aramex', 'TNT', 'SF Express', 'Japan Post', 'Canada Post', 'PostNL'];

function CarrierTicker() {
  const items = [...CARRIERS, ...CARRIERS];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '14px 0' }}>
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .ticker-inner { display: flex; gap: 3rem; white-space: nowrap; animation: ticker 28s linear infinite; width: max-content; }
        .ticker-inner:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-inner">
        {items.map((c, i) => (
          <span key={i} style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block', opacity: 0.6 }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [shipCount] = useState(() => Math.floor(Math.random() * 500 + 2100));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', overflowX: 'hidden' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(232,160,32,0.15); }
        .hover-glow:hover { border-color: rgba(232,160,32,0.4) !important; }
        .btn-primary { transition: opacity 0.2s, transform 0.15s; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64, borderBottom: '1px solid var(--border)',
        background: 'rgba(13,14,15,0.96)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          <div style={{ width: 30, height: 30, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
          TrackFlow
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {[['/about','About'],['/services','Services'],['/reviews','Reviews'],['/faq','FAQ'],['/contact','Contact']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{label}</a>
          ))}
          <a href="/client/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Track Package</a>
          <a href="/login" className="btn-primary" style={{ background: 'var(--brand)', color: '#0D0E0F', padding: '7px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>Agency Login</a>
        </div>
      </nav>

      {/* ── Live bar ── */}
      <div style={{ background: 'rgba(232,160,32,0.08)', borderBottom: '1px solid rgba(232,160,32,0.15)', padding: '9px 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--brand)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
        Live tracking active — <LiveCounter /> shipments tracked today across 198 countries
      </div>

      {/* ── Hero with background image ── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.18)',
        }} />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,14,15,0.3) 0%, rgba(13,14,15,0.7) 60%, rgba(13,14,15,1) 100%)' }} />
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        {/* Amber glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(232,160,32,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: 'clamp(4rem,8vw,6rem) 2rem', textAlign: 'center', width: '100%' }}>
          <FadeIn>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.3)', color: 'var(--brand)', fontSize: '0.75rem', fontWeight: 700, padding: '6px 16px', borderRadius: 20, marginBottom: '2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              🌍 Trusted by 500+ shipping agencies worldwide
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 style={{ fontSize: 'clamp(2.8rem,7vw,5.5rem)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.0, marginBottom: '1.5rem' }}>
              Ship with confidence.<br />
              <span style={{ color: 'var(--brand)' }}>Track in real time.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p style={{ color: 'rgba(242,239,232,0.7)', fontSize: 'clamp(1rem,2vw,1.15rem)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.85 }}>
              TrackFlow connects shipping agencies and their clients with live parcel tracking, instant notifications, and a secure personal portal — across 198 countries and 42 carriers.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <a href="/client/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--brand)', color: '#0D0E0F', padding: '15px 30px', borderRadius: 12, fontWeight: 700, fontSize: '0.98rem', textDecoration: 'none' }}>
                Track Your Package →
              </a>
              <a href="/agency/apply" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', color: 'var(--text)', padding: '15px 30px', borderRadius: 12, fontWeight: 600, fontSize: '0.98rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                Apply as Agency
              </a>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Already an agency? <a href="/login" style={{ color: 'var(--brand)' }}>Sign in to your dashboard →</a>
            </p>
          </FadeIn>

          {/* Floating stat pills */}
          <FadeIn delay={500}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '3rem' }}>
              {[['198', 'Countries'], ['42', 'Carriers'], ['99.4%', 'Accuracy'], ['<2s', 'Updates']].map(([n, l]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand)' }}>{n}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── Carrier ticker ── */}
      <CarrierTicker />

      {/* ── Stats bar (animated) ── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {[['2.4M+','Shipments daily'],['198','Countries'],['42','Carrier integrations'],['99.4%','Accuracy'],['<2s','Update speed']].map(([n, l]) => (
            <AnimatedStat key={l} value={n} label={l} />
          ))}
        </div>
      </div>

      {/* ── How it works with image ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 2rem' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: '0.75rem' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>From dispatch to doorstep</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Three simple steps connect agencies with their clients in a secure, real-time tracking experience.
            </p>
          </div>
        </FadeIn>

        {/* Step 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center', marginBottom: '4rem' }}>
          <FadeIn direction="left">
            <div style={{ borderRadius: 20, overflow: 'hidden', height: 280 }}>
              <img src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Agency creating shipment" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
            </div>
          </FadeIn>
          <FadeIn direction="right">
            <div style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--brand)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.1em' }}>STEP 01</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Agency creates shipment</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                A verified shipping agency creates a shipment in TrackFlow. They enter the recipient's details, package information, assign a carrier, and set a quotation for payment.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Carrier assignment (DHL, FedEx, UPS)', 'Itemized quotation with crypto payment', 'Auto-generated client credentials'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--brand)', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center', marginBottom: '4rem' }}>
          <FadeIn direction="left">
            <div style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--info)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.1em' }}>STEP 02</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Client receives credentials</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                The recipient is automatically emailed a unique username and password the moment the shipment is created. They use these to securely log in — no one else can access their tracking page.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Instant credential email delivery', 'Private secure tracking portal', 'Quotation & crypto payment built in'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--info)', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn direction="right">
            <div style={{ borderRadius: 20, overflow: 'hidden', height: 280 }}>
              <img src="https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Client receiving email" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
            </div>
          </FadeIn>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <FadeIn direction="left">
            <div style={{ borderRadius: 20, overflow: 'hidden', height: 280 }}>
              <img src="https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Package in transit" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
            </div>
          </FadeIn>
          <FadeIn direction="right">
            <div style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.1em' }}>STEP 03</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Real-time updates flow</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                As the package moves, TrackFlow syncs with the carrier every 5 minutes. The client sees live status updates, a route map, and receives email alerts at every key milestone.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Live map with geocoded waypoints', 'Email alerts on every status change', 'Delivery progress tracker'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── Features grid ── */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: '0.75rem' }}>Features</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.04em' }}>Everything your clients deserve</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🗺️', title: 'Live route map', desc: 'Interactive world map showing the exact path of every shipment with animated waypoints.', color: 'rgba(74,158,232,0.1)' },
              { icon: '🔔', title: 'Instant alerts', desc: 'Automatic email and SMS notifications at every status change — customs, delivery, exceptions.', color: 'rgba(232,160,32,0.1)' },
              { icon: '🔐', title: 'Secure portal', desc: 'Each recipient gets a personal login. No shared links, no random access.', color: 'rgba(139,92,246,0.1)' },
              { icon: '💰', title: 'Crypto payments', desc: 'Agencies send itemized quotations. Clients pay via Bitcoin or Ethereum directly.', color: 'rgba(247,147,26,0.1)' },
              { icon: '🚚', title: 'Multi-carrier', desc: 'DHL, FedEx, UPS and more — all under one unified tracking interface.', color: 'rgba(61,184,122,0.1)' },
              { icon: '⚡', title: 'Fast updates', desc: 'Carrier data refreshed every 5 minutes. Webhook events delivered in under 2 seconds.', color: 'rgba(232,160,32,0.1)' },
              { icon: '🌍', title: '198 countries', desc: 'Track shipments anywhere in the world, including remote and emerging markets.', color: 'rgba(74,158,232,0.1)' },
              { icon: '🛡️', title: 'Verified agencies', desc: 'Every agency is manually approved. Only legitimate businesses can create shipments.', color: 'rgba(61,184,122,0.1)' },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 60}>
                <div className="hover-lift hover-glow" style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', height: '100%', cursor: 'default' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '0.875rem' }}>{f.icon}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* ── Two portals with image backgrounds ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '6rem 2rem' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>Two portals, one platform</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontSize: '0.9rem' }}>
              TrackFlow serves both sides of every shipment — the agencies sending packages and the clients receiving them.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <FadeIn direction="left">
            <div className="hover-lift" style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 480 }}>
              <img src="https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Shipping agency" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(13,14,15,0.95) 100%)' }} />
              <div style={{ position: 'relative', padding: '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', marginBottom: '0.75rem' }}>For Shipping Agencies</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Run your operations from one dashboard</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(242,239,232,0.7)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Create shipments, manage clients, track analytics, and let TrackFlow handle all communication automatically.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.75rem' }}>
                  {['Create & manage shipments', 'Auto-notify clients', 'DHL/FedEx/UPS live sync', 'Crypto payment quotations'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'rgba(242,239,232,0.65)', marginBottom: 6 }}>
                      <span style={{ color: 'var(--brand)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/agency/apply" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', alignSelf: 'flex-start' }}>
                  Apply for Agency Access →
                </a>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div className="hover-lift" style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 480 }}>
              <img src="https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Package recipient" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(13,14,15,0.95) 100%)' }} />
              <div style={{ position: 'relative', padding: '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--info)', marginBottom: '0.75rem' }}>For Package Recipients</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Know exactly where your package is</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(242,239,232,0.7)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Receive a secure login by email. Track your shipment in real time, see the route map, and pay your invoice — all in one place.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.75rem' }}>
                  {['Secure personal login', 'Live map & timeline', 'Email alerts on every update', 'Crypto payment portal'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'rgba(242,239,232,0.65)', marginBottom: 6 }}>
                      <span style={{ color: 'var(--info)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/client/login" style={{ display: 'inline-block', background: 'var(--info)', color: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', alignSelf: 'flex-start' }}>
                  Track My Package →
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: 'var(--brand)', fontSize: 22 }}>★</span>)}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>4.9 / 5</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>From 500+ agency reviews worldwide</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { text: 'TrackFlow completely transformed how we communicate with clients. No more "where is my package" calls.', name: 'Kester Wimmers', role: 'Operations Manager, SwiftCargo', avatar: 'KW' },
              { text: 'The client portal is what sets TrackFlow apart. Each recipient gets their own secure login — it feels premium.', name: "James O'Brien", role: 'CEO, Dublin Freight Services', avatar: 'JO' },
              { text: 'Setup took less than an hour and the DHL integration worked perfectly. My clients love the tracking portal.', name: 'Marcus Weber', role: 'Founder, EuroShip GmbH', avatar: 'MW' },
            ].map((r, i) => (
              <FadeIn key={r.name} delay={i * 100}>
                <div className="hover-lift" style={{ background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem', cursor: 'default' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, j) => <span key={j} style={{ color: 'var(--brand)', fontSize: 14 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.78, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{r.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand)', flexShrink: 0 }}>
                      {r.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{r.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <a href="/reviews" style={{ fontSize: '0.88rem', color: 'var(--brand)', fontWeight: 600 }}>Read all reviews →</a>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── CTA with background ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1920)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.12)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(232,160,32,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
          <FadeIn>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
              Ready to transform your<br />
              <span style={{ color: 'var(--brand)' }}>shipping experience?</span>
            </h2>
            <p style={{ color: 'rgba(242,239,232,0.65)', fontSize: '0.98rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              Join hundreds of shipping agencies already using TrackFlow to deliver a world-class tracking experience to their clients.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/agency/apply" className="btn-primary" style={{ display: 'inline-block', background: 'var(--brand)', color: '#0D0E0F', padding: '15px 34px', borderRadius: 12, fontWeight: 700, fontSize: '0.98rem', textDecoration: 'none' }}>
                Apply for Agency Access →
              </a>
              <a href="/contact" className="btn-primary" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', color: 'var(--text)', padding: '15px 34px', borderRadius: 12, fontWeight: 600, fontSize: '0.98rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                Contact Us
              </a>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '3.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.875rem' }}>
                <div style={{ width: 26, height: 26, background: 'var(--brand)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#0D0E0F' }}>TF</div>
                TrackFlow
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.75 }}>Real-time parcel tracking across 198 countries and 42 carriers.</p>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.875rem' }}>Company</div>
              {[['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], ['/reviews', 'Reviews'], ['/faq', 'FAQ']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 7, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--brand)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.875rem' }}>Platform</div>
              {[['/client/login', 'Track Package'], ['/agency/apply', 'Apply as Agency'], ['/login', 'Agency Login'], ['/contact', 'Support']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 7, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--brand)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.875rem' }}>Contact</div>
              <a href="mailto:trackflow.eu@gmail.com" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--brand)', marginBottom: 7 }}>trackflow.eu@gmail.com</a>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>Response within 1–2 business days</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>© 2025 TrackFlow. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <span key={l} style={{ fontSize: '0.72rem', color: 'var(--text-dim)', cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-muted)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
                >{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}