const db = require('../../config/database');
const { cacheDel } = require('../../config/redis');
const dhl = require('./dhlAdapter');
const fedex = require('./fedexAdapter');
const ups = require('./upsAdapter');
const notificationService = require('../notifications/notificationService');
const logger = require('../../utils/logger');

const ADAPTERS = { dhl, fedex, ups };

/**
 * Sync a shipment from its carrier API.
 * Compares new events to existing ones and inserts only new ones.
 * Updates shipment status and triggers notifications on change.
 */
async function syncFromCarrier(shipment) {
  const adapter = ADAPTERS[shipment.carrier];
  if (!adapter || !shipment.carrier_tracking_id) return;

  const result = await adapter.track(shipment.carrier_tracking_id);

  // Get existing event timestamps to avoid duplicates
  const existing = await db('tracking_events')
    .where({ shipment_id: shipment.id })
    .select('occurred_at', 'source');

  const existingTimes = new Set(
    existing.filter(e => e.source === shipment.carrier)
      .map(e => new Date(e.occurred_at).toISOString())
  );

  const newEvents = result.events.filter(
    e => !existingTimes.has(new Date(e.occurred_at).toISOString())
  );

  if (newEvents.length > 0) {
    await db('tracking_events').insert(
      newEvents.map(e => ({ shipment_id: shipment.id, ...e }))
    );

    const prevStatus = shipment.status;
    const newStatus = result.status;

    if (prevStatus !== newStatus) {
      await db('shipments').where({ id: shipment.id }).update({
        status: newStatus,
        updated_at: new Date(),
        ...(newStatus === 'delivered' ? { actual_delivery: new Date() } : {}),
        ...(result.estimated_delivery ? { estimated_delivery: result.estimated_delivery } : {}),
      });

      const updatedShipment = await db('shipments').where({ id: shipment.id }).first();
      const latestEvent = newEvents[newEvents.length - 1];

      try {
        await notificationService.notifyStatusChange(updatedShipment, latestEvent);
      } catch (err) {
        logger.warn(`Notification failed for ${shipment.tracking_id}:`, err.message);
      }
    }

    await cacheDel(`track:${shipment.tracking_id}`);
    logger.info(`Synced ${newEvents.length} new events for ${shipment.tracking_id}`);
  }

  return result;
}

module.exports = { syncFromCarrier };
