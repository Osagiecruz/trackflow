import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { shipmentsApi } from '../utils/api';
import toast from 'react-hot-toast';

function Field({ label, name, value, onChange, type = 'text', placeholder, required, half }) {
  return (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
          borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
          fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--brand)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.14)'}
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options, required, half }) {
  return (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      <select
        name={name} value={value} onChange={onChange} required={required}
        style={{
          width: '100%', background: 'var(--surface3)', border: '1px solid var(--border2)',
          borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
          fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1rem' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        {children}
      </div>
    </div>
  );
}

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    carrier: 'dhl', service: 'express',
    origin_country: '', origin_city: '', origin_address: '',
    destination_country: '', destination_city: '', destination_address: '', destination_postal_code: '',
    sender_name: '', sender_email: '', sender_phone: '',
    recipient_name: '', recipient_email: '', recipient_phone: '',
    weight: '', description: '', value: '', currency: 'USD',
    carrier_tracking_id: '', estimated_delivery: '',
  });

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        carrier: form.carrier,
        service: form.service,
        origin_country: form.origin_country.toUpperCase(),
        origin_city: form.origin_city,
        origin_address: form.origin_address,
        destination_country: form.destination_country.toUpperCase(),
        destination_city: form.destination_city,
        destination_address: form.destination_address,
        destination_postal_code: form.destination_postal_code,
        carrier_tracking_id: form.carrier_tracking_id || undefined,
        estimated_delivery: form.estimated_delivery || undefined,
        sender: { name: form.sender_name, email: form.sender_email, phone: form.sender_phone },
        recipient: { name: form.recipient_name, email: form.recipient_email, phone: form.recipient_phone },
        package: { weight: parseFloat(form.weight) || 0, description: form.description, value: parseFloat(form.value) || 0, currency: form.currency },
      };

      const { data } = await shipmentsApi.create(payload);
      toast.success(`Shipment created! ID: ${data.shipment.tracking_id}`);
      navigate(`/dashboard/shipments/${data.shipment.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/dashboard/shipments" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Shipments</Link>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Create Shipment</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Section title="Carrier">
          <Select label="Carrier" name="carrier" value={form.carrier} onChange={set} required half options={[
            { value: 'dhl', label: 'DHL Express' },
            { value: 'fedex', label: 'FedEx International' },
            { value: 'ups', label: 'UPS Worldwide' },
            { value: 'custom', label: 'Custom / Manual' },
          ]} />
          <Select label="Service" name="service" value={form.service} onChange={set} half options={[
            { value: 'express', label: 'Express (1-3 days)' },
            { value: 'standard', label: 'Standard (5-10 days)' },
            { value: 'economy', label: 'Economy (10-20 days)' },
          ]} />
          <Field label="Carrier Tracking ID (optional)" name="carrier_tracking_id" value={form.carrier_tracking_id} onChange={set} placeholder="e.g. 1Z12345E0205271688" half />
          <Field label="Estimated Delivery" name="estimated_delivery" value={form.estimated_delivery} onChange={set} type="date" half />
        </Section>

        <Section title="Origin">
          <Field label="Country (2-letter)" name="origin_country" value={form.origin_country} onChange={set} placeholder="DE" required half />
          <Field label="City" name="origin_city" value={form.origin_city} onChange={set} placeholder="Hamburg" required half />
          <Field label="Address" name="origin_address" value={form.origin_address} onChange={set} placeholder="123 Main St" />
        </Section>

        <Section title="Destination">
          <Field label="Country (2-letter)" name="destination_country" value={form.destination_country} onChange={set} placeholder="US" required half />
          <Field label="City" name="destination_city" value={form.destination_city} onChange={set} placeholder="New York" required half />
          <Field label="Address" name="destination_address" value={form.destination_address} onChange={set} placeholder="456 Park Ave" half />
          <Field label="Postal Code" name="destination_postal_code" value={form.destination_postal_code} onChange={set} placeholder="10001" half />
        </Section>

        <Section title="Sender">
          <Field label="Name" name="sender_name" value={form.sender_name} onChange={set} placeholder="Jane Smith" required half />
          <Field label="Phone" name="sender_phone" value={form.sender_phone} onChange={set} placeholder="+49 123 456789" half />
          <Field label="Email" name="sender_email" value={form.sender_email} onChange={set} type="email" placeholder="sender@example.com" />
        </Section>

        <Section title="Recipient">
          <Field label="Name" name="recipient_name" value={form.recipient_name} onChange={set} placeholder="John Doe" required half />
          <Field label="Phone (for SMS alerts)" name="recipient_phone" value={form.recipient_phone} onChange={set} placeholder="+1 234 567 8900" half />
          <Field label="Email (for email alerts)" name="recipient_email" value={form.recipient_email} onChange={set} type="email" placeholder="recipient@example.com" />
        </Section>

        <Section title="Package">
          <Field label="Weight (kg)" name="weight" value={form.weight} onChange={set} type="number" placeholder="2.5" required half />
          <Field label="Declared Value" name="value" value={form.value} onChange={set} type="number" placeholder="500" half />
          <Field label="Description" name="description" value={form.description} onChange={set} placeholder="Electronics, clothing, documents…" />
        </Section>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Link to="/dashboard/shipments" style={{
            padding: '12px 24px', borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--border2)',
            color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem',
          }}>Cancel</Link>
          <button type="submit" disabled={loading} style={{
            padding: '12px 28px', borderRadius: 10,
            background: 'var(--brand)', border: 'none', color: '#0D0E0F',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating…' : 'Create Shipment →'}
          </button>
        </div>
      </form>
    </div>
  );
}
