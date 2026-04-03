const request = require('supertest');
const app = require('../src/index');
const db = require('../src/config/database');

let accessToken;
let shipmentId;
let trackingId;

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

// ─── Auth ──────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('creates a new agency account', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Agency',
      email: 'test@example.com',
      password: 'TestPass1!',
      country: 'US',
    });
    expect(res.status).toBe(201);
    expect(res.body.agency.email).toBe('test@example.com');
    expect(res.body.tokens.access).toBeDefined();
    accessToken = res.body.tokens.access;
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Agency 2',
      email: 'test@example.com',
      password: 'TestPass1!',
    });
    expect(res.status).toBe(409);
  });

  it('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Agency',
      email: 'weak@example.com',
      password: 'weak',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'TestPass1!',
    });
    expect(res.status).toBe(200);
    expect(res.body.tokens.access).toBeDefined();
    accessToken = res.body.tokens.access;
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'WrongPass1!',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns agency profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.agency.email).toBe('test@example.com');
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ─── Shipments ─────────────────────────────────────────
describe('POST /api/shipments', () => {
  it('creates a shipment', async () => {
    const res = await request(app)
      .post('/api/shipments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        carrier: 'dhl',
        service: 'express',
        origin_country: 'DE',
        origin_city: 'Berlin',
        destination_country: 'US',
        destination_city: 'Chicago',
        sender: { name: 'Test Sender', email: 'sender@test.de' },
        recipient: { name: 'Test Recipient', email: 'recipient@test.com', phone: '+1 555 1234567' },
        package: { weight: 1.5, description: 'Test package', value: 100 },
        estimated_delivery: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.shipment.tracking_id).toMatch(/^TF-DE-US-/);
    expect(res.body.shipment.status).toBe('pending');
    shipmentId = res.body.shipment.id;
    trackingId = res.body.shipment.tracking_id;
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/shipments').send({});
    expect(res.status).toBe(401);
  });
});

describe('GET /api/shipments', () => {
  it('returns list of shipments', async () => {
    const res = await request(app)
      .get('/api/shipments')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.shipments).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
  });
});

describe('POST /api/shipments/:id/events', () => {
  it('adds a tracking event', async () => {
    const res = await request(app)
      .post(`/api/shipments/${shipmentId}/events`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'in_transit',
        description: 'Package arrived at hub',
        location: 'Berlin Hub, DE',
        facility: 'DHL Berlin Hub',
      });
    expect(res.status).toBe(201);
    expect(res.body.event.status).toBe('in_transit');
  });
});

// ─── Public Tracking ────────────────────────────────────
describe('GET /api/track/:trackingId', () => {
  it('returns shipment and events publicly', async () => {
    const res = await request(app).get(`/api/track/${trackingId}`);
    expect(res.status).toBe(200);
    expect(res.body.shipment.tracking_id).toBe(trackingId);
    expect(res.body.events).toBeInstanceOf(Array);
    expect(res.body.events.length).toBeGreaterThan(0);
  });

  it('returns 404 for unknown tracking ID', async () => {
    const res = await request(app).get('/api/track/TF-XX-XX-99999999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/track/:trackingId/subscribe', () => {
  it('subscribes an email to notifications', async () => {
    const res = await request(app)
      .post(`/api/track/${trackingId}/subscribe`)
      .send({ email: 'subscriber@example.com' });
    expect(res.status).toBe(200);
  });

  it('requires at least email or phone', async () => {
    const res = await request(app)
      .post(`/api/track/${trackingId}/subscribe`)
      .send({});
    expect(res.status).toBe(400);
  });
});

// ─── Health ────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
