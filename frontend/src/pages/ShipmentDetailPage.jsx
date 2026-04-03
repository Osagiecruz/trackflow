import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shipmentsApi } from '../utils/api';
import { StatusBadge } from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import MapView from '../components/MapView';
import { formatDate } from '../utils/dates';
import toast from 'react-hot-toast';

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingEvent, setAddingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ status: 'in_transit', description: '', location: '', facility: '' });
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    shipmentsApi.getById(id)
      .then(({ data }) => {
        setShipment(data.shipment);
        setEvents(data.events);
      })
      .catch(() => toast.error('Failed to load shipment'))
      .finally(() => setLoading(false));
  }, [id]);

  async function addEvent(e) {
    e.preventDefault();
    setAddingEvent(true);
    try {
      const { data } = await shipmentsApi.addEvent(id, { ...eventForm, occurred_at: new Date().toISOString() });
      setEvents(prev => [...prev, data.event]);
      setShipment(prev => ({ ...prev, status: eventForm.status }));
      toast.success('Event added and notifications sent');
      setShowEventForm(false);
      setEventForm({ status: 'in_transit', description: '', location: '', facility: '' });
    } catch {
      toast.error('Failed to add event');
    } finally {
      setAddingEvent(false);
    }
  }

  const copyTrackLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/track/${shipment.tracking_id}`);
    toast.success('Tracking link copied!');
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;
  if (!shipment) return <div style={{ padding: '2rem' }}>Shipment not found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/dashboard/shipments" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'block', marginBottom: 8 }}>← Back to Shipments</Link>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{shipment.tracking_id}</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {shipment.package?.description || 'Shipment'} · {shipment.origin_city} → {shipment.destination_city}
          </h1>
          <StatusBadge status={shipment.status} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={copyTrackLink} style={{
            padding: '9px 16px', borderRadius: 9, background: 'var(--surface)',
            border: '1px solid var(--border2)', color: 'var(--text)',
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
          }}>Copy tracking link</button>
          <button onClick={() => setShowEventForm(true)} style={{
            padding: '9px 16px', borderRadius: 9, background: 'var(--brand)',
            border: 'none', color: '#0D0E0F',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
          }}>+ Add event</button>
        </div>
      </div>

      {/* Meta */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14,
        padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', gap: '2rem', flexWrap: 'wrap',
      }}>
        {[
          ['Carrier', shipment.carrier?.toUpperCase()],
          ['Service', shipment.service || '—'],
          ['Est. Delivery', shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : '—'],
          ['Shipped', shipment.shipped_at ? formatDate(shipment.shipped_at) : '—'],
          ['Weight', shipment.package?.weight ? `${shipment.package.weight} kg` : '—'],
          ['Recipient', shipment.recipient?.name || '—'],
        ].map(([lbl, val]) => (
          <div key={lbl}>
            <div style={{ fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 3 }}>{lbl}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.5rem 0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>Live Map</div>
        <MapView events={events} shipment={shipment} />
      </div>

      {/* Timeline */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>Timeline</div>
        <Timeline events={events} />
      </div>

      {/* Add Event Modal */}
      {showEventForm && (
        <div onClick={() => setShowEventForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, padding: '2rem', maxWidth: 480, width: '100%' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Add Tracking Event</h2>
            <form onSubmit={addEvent}>
              {[
                { label: 'Status', field: 'status', type: 'select', options: ['pending','in_transit','customs_cleared','out_for_delivery','delivered','exception','returned'] },
                { label: 'Description', field: 'description', placeholder: 'e.g. Package arrived at Frankfurt hub', required: true },
                { label: 'Location', field: 'location', placeholder: 'e.g. Frankfurt, DE' },
                { label: 'Facility', field: 'facility', placeholder: 'e.g. DHL Hub Frankfurt' },
              ].map(f => (
                <div key={f.field} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={eventForm[f.field]} onChange={e => setEventForm(p => ({ ...p, [f.field]: e.target.value }))}
                      style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none' }}>
                      {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </select>
                  ) : (
                    <input value={eventForm[f.field]} onChange={e => setEventForm(p => ({ ...p, [f.field]: e.target.value }))}
                      placeholder={f.placeholder} required={f.required}
                      style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none' }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowEventForm(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={addingEvent} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'var(--brand)', border: 'none', color: '#0D0E0F', fontFamily: 'var(--font-sans)', fontWeight: 700, cursor: 'pointer', opacity: addingEvent ? 0.7 : 1 }}>
                  {addingEvent ? 'Adding…' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
