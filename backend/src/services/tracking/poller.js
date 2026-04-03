const cron = require('node-cron');
const db = require('../../config/database');
const { syncFromCarrier } = require('../carriers/carrierService');
const logger = require('../../utils/logger');

/**
 * Polls all active non-custom shipments with a carrier_tracking_id
 * every 5 minutes in production.
 */
function startPollingJob() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Starting carrier sync poll...');

    const shipments = await db('shipments')
      .whereIn('status', ['pending', 'in_transit', 'out_for_delivery'])
      .whereNot('carrier', 'custom')
      .whereNotNull('carrier_tracking_id')
      .limit(200); // process max 200 per run

    logger.info(`Polling ${shipments.length} active shipments`);

    let synced = 0;
    let errors = 0;

    // Process in batches of 10 to avoid overwhelming carrier APIs
    for (let i = 0; i < shipments.length; i += 10) {
      const batch = shipments.slice(i, i + 10);
      await Promise.allSettled(
        batch.map(async (shipment) => {
          try {
            await syncFromCarrier(shipment);
            synced++;
          } catch (err) {
            errors++;
            logger.warn(`Sync failed for ${shipment.tracking_id}:`, err.message);
          }
        })
      );
      // Small delay between batches
      if (i + 10 < shipments.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    logger.info(`Poll complete: ${synced} synced, ${errors} errors`);
  });

  // Also clean up old refresh tokens daily at 3am
  cron.schedule('0 3 * * *', async () => {
    const deleted = await db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .delete();
    logger.info(`Cleaned up ${deleted} expired refresh tokens`);
  });
}

module.exports = { startPollingJob };
