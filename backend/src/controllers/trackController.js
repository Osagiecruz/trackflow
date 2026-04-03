const db = require('../config/database');
const { cacheGetOrSet, cacheSet } = require('../config/redis');
const carrierService = require('../services/carriers/carrierService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

exports.track = async (req, res) => {
  const { trackingId } = req.params;
  const cacheKey = `track:${trackingId}`;

  const result = await cacheGetOrSet(cacheKey, async () => {
    const shipment = await db('shipments')
      .where({ tracking_id: trackingId })
      .first();

    if (!shipment) return null;

    const events = await db('tracking_events')
      .where({ shipment_id: shipment.id })
      .orderBy('occurred_at', 'asc');

    // If carrier tracking ID exists and shipment is active, try live update
    if (shipment.carrier_tracking_id && !['delivered', 'returned'].includes(shipment.status)) {
      try {
        await carrierService.syncFromCarrier(shipment);
      } catch (err) {
        logger.warn(`Carrier sync failed for ${trackingId}:`, err.message);
      }
    }

    return { shipment, events };
  }, 30); // cache for 30 seconds

  if (!result) throw new AppError('Tracking ID not found', 404);

  res.json(result);
};

exports.events = async (req, res) => {
  const { trackingId } = req.params;

  const shipment = await db('shipments').where({ tracking_id: trackingId }).first();
  if (!shipment) throw new AppError('Tracking ID not found', 404);

  const events = await db('tracking_events')
    .where({ shipment_id: shipment.id })
    .orderBy('occurred_at', 'asc');

  res.json({ events });
};

exports.subscribe = async (req, res) => {
  const { trackingId } = req.params;
  const { email, phone } = req.body;

  if (!email && !phone) throw new AppError('Email or phone required', 400);

  const shipment = await db('shipments').where({ tracking_id: trackingId }).first();
  if (!shipment) throw new AppError('Tracking ID not found', 404);

  const existing = await db('notification_subscriptions')
    .where({ shipment_id: shipment.id })
    .where(function () {
      if (email) this.orWhere({ email });
      if (phone) this.orWhere({ phone });
    })
    .first();

  if (!existing) {
    await db('notification_subscriptions').insert({
      shipment_id: shipment.id,
      email: email || null,
      phone: phone || null,
    });
  }

  res.json({ message: 'You will receive updates for this shipment.' });
};
