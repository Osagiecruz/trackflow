const db = require('../config/database');
const { cacheDel } = require('../config/redis');
const { generateTrackingId } = require('../utils/trackingId');
const notificationService = require('../services/notifications/notificationService');
const webhookService = require('../services/webhooks/webhookService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.list = async (req, res) => {
  const { status, carrier, page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  let query = db('shipments').where({ agency_id: req.agency.id });

  if (status) query = query.where({ status });
  if (carrier) query = query.where({ carrier });
  if (search) {
    query = query.where(function () {
      this.where('tracking_id', 'ilike', `%${search}%`)
        .orWhereRaw("recipient->>'name' ilike ?", [`%${search}%`])
        .orWhere('destination_city', 'ilike', `%${search}%`);
    });
  }

  const [{ count }] = await query.clone().count('* as count');
  const shipments = await query
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  res.json({
    shipments,
    pagination: {
      total: parseInt(count),
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
    },
  });
};

exports.create = async (req, res) => {
  const tracking_id = generateTrackingId(req.body.origin_country, req.body.destination_country);

  const [shipment] = await db('shipments').insert({
    agency_id: req.agency.id,
    tracking_id,
    carrier: req.body.carrier,
    service: req.body.service,
    carrier_tracking_id: req.body.carrier_tracking_id,
    origin_country: req.body.origin_country,
    origin_city: req.body.origin_city,
    origin_address: req.body.origin_address,
    destination_country: req.body.destination_country,
    destination_city: req.body.destination_city,
    destination_address: req.body.destination_address,
    destination_postal_code: req.body.destination_postal_code,
    sender: JSON.stringify(req.body.sender),
    recipient: JSON.stringify(req.body.recipient),
    package: JSON.stringify(req.body.package),
    estimated_delivery: req.body.estimated_delivery,
    status: 'pending',
    shipped_at: new Date(),
  }).returning('*');

  // Auto-add initial event
  await db('tracking_events').insert({
    shipment_id: shipment.id,
    status: 'pending',
    description: 'Shipment created and awaiting pickup',
    location: `${req.body.origin_city}, ${req.body.origin_country}`,
    occurred_at: new Date(),
    source: 'manual',
  });

  // Subscribe recipient if contact provided
  if (req.body.recipient.email || req.body.recipient.phone) {
    await db('notification_subscriptions').insert({
      shipment_id: shipment.id,
      email: req.body.recipient.email,
      phone: req.body.recipient.phone,
    });
  }

  // Send dispatch notification
  try {
    await notificationService.notifyShipmentCreated(shipment);
  } catch (err) {
    logger.warn('Dispatch notification failed:', err.message);
  }

  res.status(201).json({ shipment });
};

exports.getById = async (req, res) => {
  const shipment = await db('shipments')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .first();
  if (!shipment) throw new AppError('Shipment not found', 404);

  const events = await db('tracking_events')
    .where({ shipment_id: shipment.id })
    .orderBy('occurred_at', 'asc');

  res.json({ shipment, events });
};

exports.update = async (req, res) => {
  const shipment = await db('shipments')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .first();
  if (!shipment) throw new AppError('Shipment not found', 404);

  const [updated] = await db('shipments')
    .where({ id: req.params.id })
    .update({ ...req.body, updated_at: new Date() })
    .returning('*');

  await cacheDel(`track:${shipment.tracking_id}`);
  res.json({ shipment: updated });
};

exports.remove = async (req, res) => {
  const deleted = await db('shipments')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .delete();
  if (!deleted) throw new AppError('Shipment not found', 404);
  res.json({ message: 'Shipment deleted' });
};

exports.addEvent = async (req, res) => {
  const shipment = await db('shipments')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .first();
  if (!shipment) throw new AppError('Shipment not found', 404);

  const [event] = await db('tracking_events').insert({
    shipment_id: shipment.id,
    status: req.body.status,
    description: req.body.description,
    location: req.body.location,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    city: req.body.city,
    country: req.body.country,
    facility: req.body.facility,
    occurred_at: req.body.occurred_at || new Date(),
    source: 'manual',
  }).returning('*');

  // Update shipment status
  await db('shipments').where({ id: shipment.id }).update({
    status: req.body.status,
    updated_at: new Date(),
    ...(req.body.status === 'delivered' ? { actual_delivery: new Date() } : {}),
  });

  // Invalidate cache
  await cacheDel(`track:${shipment.tracking_id}`);

  // Trigger notifications and webhooks
  const updatedShipment = await db('shipments').where({ id: shipment.id }).first();
  try {
    await notificationService.notifyStatusChange(updatedShipment, event);
    await webhookService.deliver(updatedShipment, 'shipment.updated', event);
  } catch (err) {
    logger.warn('Notification/webhook failed:', err.message);
  }

  res.status(201).json({ event });
};

exports.sendNotification = async (req, res) => {
  const shipment = await db('shipments')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .first();
  if (!shipment) throw new AppError('Shipment not found', 404);

  const { channel, message } = req.body;
  await notificationService.sendCustom(shipment, channel, message);
  res.json({ message: 'Notification sent' });
};

exports.subscribe = async (req, res) => {
  const shipment = await db('shipments')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .first();
  if (!shipment) throw new AppError('Shipment not found', 404);

  const existing = await db('notification_subscriptions').where({ shipment_id: shipment.id }).first();
  if (existing) {
    await db('notification_subscriptions').where({ id: existing.id }).update(req.body);
  } else {
    await db('notification_subscriptions').insert({ shipment_id: shipment.id, ...req.body });
  }
  res.json({ message: 'Subscribed' });
};

exports.bulkCreate = async (req, res) => {
  const { shipments } = req.body;
  if (!Array.isArray(shipments) || shipments.length > 500) {
    throw new AppError('Provide 1–500 shipments', 400);
  }

  const created = [];
  for (const s of shipments) {
    const tracking_id = generateTrackingId(s.origin_country, s.destination_country);
    const [shipment] = await db('shipments').insert({
      agency_id: req.agency.id,
      tracking_id,
      ...s,
      sender: JSON.stringify(s.sender || {}),
      recipient: JSON.stringify(s.recipient || {}),
      package: JSON.stringify(s.package || {}),
      status: 'pending',
    }).returning('*');
    created.push(shipment);
  }

  res.status(201).json({ created: created.length, shipments: created });
};
