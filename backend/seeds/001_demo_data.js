const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  // Clean existing data (dev only)
  await knex('tracking_events').del();
  await knex('notification_subscriptions').del();
  await knex('shipments').del();
  await knex('refresh_tokens').del();
  await knex('agencies').del();

  // ─── Demo Agency ──────────────────────────────────────
  const agencyId = uuidv4();
  await knex('agencies').insert({
    id: agencyId,
    name: 'Demo Shipping Co.',
    email: 'demo@trackflow.io',
    password_hash: await bcrypt.hash('Demo1234!', 12),
    phone: '+1 555 000 1234',
    country: 'US',
    plan: 'pro',
    is_active: true,
    email_verified: true,
  });

  console.log('✓ Demo agency created');
  console.log('  Email: demo@trackflow.io');
  console.log('  Password: Demo1234!');

  // ─── Demo Shipments ───────────────────────────────────
  const shipments = [
    {
      id: uuidv4(),
      agency_id: agencyId,
      tracking_id: 'TF-DE-US-29183746',
      carrier: 'dhl',
      service: 'express',
      status: 'in_transit',
      origin_country: 'DE',
      origin_city: 'Hamburg',
      origin_address: 'Speicherstadt 1, 20457 Hamburg',
      destination_country: 'US',
      destination_city: 'New York',
      destination_address: '350 5th Ave, New York, NY 10118',
      destination_postal_code: '10118',
      sender: JSON.stringify({ name: 'TechParts GmbH', email: 'dispatch@techparts.de', phone: '+49 40 123456' }),
      recipient: JSON.stringify({ name: 'J. Mitchell', email: 'j.mitchell@example.com', phone: '+1 212 555 0100' }),
      package: JSON.stringify({ weight: 2.4, dimensions: '32x22x14cm', description: 'Electronics components', value: 420, currency: 'USD' }),
      estimated_delivery: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      shipped_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    {
      id: uuidv4(),
      agency_id: agencyId,
      tracking_id: 'TF-CN-GB-88204517',
      carrier: 'fedex',
      service: 'standard',
      status: 'out_for_delivery',
      origin_country: 'CN',
      origin_city: 'Shenzhen',
      destination_country: 'GB',
      destination_city: 'London',
      destination_address: '221B Baker St, London NW1 6XE',
      destination_postal_code: 'NW1 6XE',
      sender: JSON.stringify({ name: 'SZ Fashions Ltd.', email: 'export@szfashions.cn', phone: '+86 755 8888 8888' }),
      recipient: JSON.stringify({ name: 'A. Harrington', email: 'a.harrington@example.co.uk', phone: '+44 7700 900456' }),
      package: JSON.stringify({ weight: 8.1, dimensions: '60x40x30cm', description: 'Textile goods', value: 1200, currency: 'GBP' }),
      estimated_delivery: new Date(Date.now() + 1 * 24 * 3600 * 1000),
      shipped_at: new Date(Date.now() - 8 * 24 * 3600 * 1000),
    },
    {
      id: uuidv4(),
      agency_id: agencyId,
      tracking_id: 'TF-JP-NG-77310028',
      carrier: 'ups',
      service: 'standard',
      status: 'delivered',
      origin_country: 'JP',
      origin_city: 'Tokyo',
      destination_country: 'NG',
      destination_city: 'Lagos',
      destination_address: '14 Broad Street, Lagos Island',
      destination_postal_code: '101001',
      sender: JSON.stringify({ name: 'Nippon Parts Co.', email: 'intl@nipponparts.jp', phone: '+81 3 5555 1234' }),
      recipient: JSON.stringify({ name: 'Aliko Enterprises Ltd.', email: 'logistics@aliko.ng', phone: '+234 802 555 0199' }),
      package: JSON.stringify({ weight: 15.6, dimensions: '80x50x40cm', description: 'Auto components', value: 2800, currency: 'USD' }),
      estimated_delivery: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      actual_delivery: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      shipped_at: new Date(Date.now() - 14 * 24 * 3600 * 1000),
    },
  ];

  const insertedShipments = await knex('shipments').insert(shipments).returning('*');
  console.log(`✓ ${shipments.length} demo shipments created`);

  // ─── Tracking Events ──────────────────────────────────
  const now = Date.now();

  const eventSets = [
    // TF-DE-US-29183746 (Hamburg → New York, in_transit)
    [
      { status: 'pending', description: 'Shipment collected from sender', location: 'Hamburg, DE', city: 'Hamburg', country: 'DE', latitude: 53.5511, longitude: 9.9937, facility: 'DHL Collection Point', occurred_at: new Date(now - 2 * 24 * 3600 * 1000), source: 'dhl' },
      { status: 'in_transit', description: 'Sorted and processed at DHL hub', location: 'Frankfurt, DE', city: 'Frankfurt', country: 'DE', latitude: 50.1109, longitude: 8.6821, facility: 'DHL Frankfurt Hub', occurred_at: new Date(now - 1.5 * 24 * 3600 * 1000), source: 'dhl' },
      { status: 'in_transit', description: 'Departed on cargo flight LH8742', location: 'Frankfurt Airport, DE', city: 'Frankfurt', country: 'DE', latitude: 50.0379, longitude: 8.5622, facility: 'Frankfurt Airport FRA', occurred_at: new Date(now - 1 * 24 * 3600 * 1000), source: 'dhl' },
      { status: 'in_transit', description: 'In transit over the Atlantic Ocean', location: 'Mid-Atlantic', latitude: 45.0, longitude: -30.0, occurred_at: new Date(now - 0.5 * 24 * 3600 * 1000), source: 'dhl' },
    ],
    // TF-CN-GB-88204517 (Shenzhen → London, out_for_delivery)
    [
      { status: 'pending', description: 'Shipment collected and verified', location: 'Shenzhen, CN', city: 'Shenzhen', country: 'CN', latitude: 22.5431, longitude: 114.0579, occurred_at: new Date(now - 8 * 24 * 3600 * 1000), source: 'fedex' },
      { status: 'in_transit', description: 'Export customs cleared', location: 'Hong Kong, HK', city: 'Hong Kong', country: 'HK', latitude: 22.3193, longitude: 114.1694, facility: 'FedEx Hong Kong Hub', occurred_at: new Date(now - 7 * 24 * 3600 * 1000), source: 'fedex' },
      { status: 'in_transit', description: 'Transit hub — brief layover', location: 'Dubai, AE', city: 'Dubai', country: 'AE', latitude: 25.2048, longitude: 55.2708, facility: 'FedEx Dubai Gateway', occurred_at: new Date(now - 5 * 24 * 3600 * 1000), source: 'fedex' },
      { status: 'customs_cleared', description: 'Arrived — UK Border Force inspection complete', location: 'Stansted, GB', city: 'Stansted', country: 'GB', latitude: 51.8860, longitude: 0.2389, facility: 'Stansted Airport STN', occurred_at: new Date(now - 3 * 24 * 3600 * 1000), source: 'fedex' },
      { status: 'in_transit', description: 'Sorted for final delivery zone', location: 'London, GB', city: 'London', country: 'GB', latitude: 51.5074, longitude: -0.1278, facility: 'FedEx London Depot', occurred_at: new Date(now - 0.3 * 24 * 3600 * 1000), source: 'fedex' },
      { status: 'out_for_delivery', description: 'Out for delivery — driver assigned', location: 'London, GB', city: 'London', country: 'GB', latitude: 51.5239, longitude: -0.1585, occurred_at: new Date(now - 0.1 * 24 * 3600 * 1000), source: 'fedex' },
    ],
    // TF-JP-NG-77310028 (Tokyo → Lagos, delivered)
    [
      { status: 'pending', description: 'Shipment dispatched from warehouse', location: 'Tokyo, JP', city: 'Tokyo', country: 'JP', latitude: 35.6762, longitude: 139.6503, occurred_at: new Date(now - 14 * 24 * 3600 * 1000), source: 'ups' },
      { status: 'in_transit', description: 'Loaded on ANA Cargo flight NH8504', location: 'Narita Airport, JP', city: 'Narita', country: 'JP', latitude: 35.7647, longitude: 140.3864, facility: 'Narita International NRT', occurred_at: new Date(now - 13 * 24 * 3600 * 1000), source: 'ups' },
      { status: 'in_transit', description: 'Transit and repackaging at UPS hub', location: 'Dubai, AE', city: 'Dubai', country: 'AE', latitude: 25.2048, longitude: 55.2708, facility: 'UPS Dubai Worldport', occurred_at: new Date(now - 11 * 24 * 3600 * 1000), source: 'ups' },
      { status: 'in_transit', description: 'Regional hub processing', location: 'Nairobi, KE', city: 'Nairobi', country: 'KE', latitude: -1.2921, longitude: 36.8219, facility: 'JKIA Cargo Terminal', occurred_at: new Date(now - 9 * 24 * 3600 * 1000), source: 'ups' },
      { status: 'customs_cleared', description: 'Customs cleared — NCS approved', location: 'Lagos Airport, NG', city: 'Lagos', country: 'NG', latitude: 6.5774, longitude: 3.3212, facility: 'Murtala Muhammed Airport LOS', occurred_at: new Date(now - 6 * 24 * 3600 * 1000), source: 'ups' },
      { status: 'out_for_delivery', description: 'Out for final delivery in Lagos Island', location: 'Lagos, NG', city: 'Lagos', country: 'NG', latitude: 6.4541, longitude: 3.3947, occurred_at: new Date(now - 4.1 * 24 * 3600 * 1000), source: 'ups' },
      { status: 'delivered', description: 'Delivered and signed for by recipient', location: 'Lagos, NG', city: 'Lagos', country: 'NG', latitude: 6.4510, longitude: 3.3980, occurred_at: new Date(now - 4 * 24 * 3600 * 1000), source: 'ups' },
    ],
  ];

  for (let i = 0; i < insertedShipments.length; i++) {
    const events = eventSets[i].map(e => ({ ...e, shipment_id: insertedShipments[i].id }));
    await knex('tracking_events').insert(events);
  }

  console.log('✓ Tracking events seeded');

  // ─── Notification subscriptions ───────────────────────
  for (const s of insertedShipments) {
    const recipient = JSON.parse(typeof s.recipient === 'string' ? s.recipient : JSON.stringify(s.recipient));
    if (recipient.email || recipient.phone) {
      await knex('notification_subscriptions').insert({
        shipment_id: s.id,
        email: recipient.email,
        phone: recipient.phone,
      });
    }
  }

  console.log('✓ Notification subscriptions created');
  console.log('\n🚀 Seed complete! Login at /login with demo@trackflow.io / Demo1234!');
};
