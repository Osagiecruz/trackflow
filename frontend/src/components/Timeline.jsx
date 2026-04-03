import { formatDate } from '../utils/dates';

const STATUS_COLORS = {
  pending: '#4A9EE8',
  in_transit: '#E8A020',
  out_for_delivery: '#F59E0B',
  customs_cleared: '#8B5CF6',
  delivered: '#3DB87A',
  exception: '#E24B4A',
  returned: '#8B5CF6',
};

export default function Timeline({ events = [] }) {
  if (!events.length) {
    return <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', padding: '1rem 0' }}>No events yet.</div>;
  }

  const sorted = [...events].sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sorted.map((event, i) => {
        const isFirst = i === 0;
        const isLast = i === sorted.length - 1;
        const color = STATUS_COLORS[event.status] || 'var(--text-dim)';

        return (
          <div key={event.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
            {/* Left: dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 12, height: 12,
                borderRadius: '50%',
                background: isFirst ? color : 'var(--surface3)',
                border: `2px solid ${isFirst ? color : 'var(--border2)'}`,
                boxShadow: isFirst ? `0 0 0 3px ${color}33` : 'none',
                marginTop: 4, flexShrink: 0,
                transition: 'all 0.3s',
              }} />
              {!isLast && (
                <div style={{
                  width: 2,
                  flex: 1,
                  minHeight: 24,
                  background: isFirst ? `linear-gradient(to bottom, ${color}, var(--border2))` : 'var(--border2)',
                  margin: '2px 0',
                }} />
              )}
            </div>

            {/* Right: content */}
            <div style={{ paddingBottom: isLast ? 0 : '1.25rem', flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: 3 }}>
                {formatDate(event.occurred_at)}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 2 }}>
                {event.facility || event.location || event.city || 'Unknown location'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {event.description}
              </div>
              {isFirst && (
                <span style={{
                  display: 'inline-block', marginTop: 5,
                  background: `${color}22`, color,
                  fontSize: '0.65rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 4,
                  border: `1px solid ${color}44`,
                }}>
                  Current location
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
