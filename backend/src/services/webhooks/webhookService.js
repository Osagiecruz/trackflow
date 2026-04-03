const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Deliver a webhook event to all registered agency webhooks.
 * Signs payload with HMAC-SHA256 using the webhook secret.
 */
async function deliver(shipment, event, data = {}) {
  const webhooks = await db('webhooks')
    .where({ agency_id: shipment.agency_id, is_active: true })
    .whereRaw('? = ANY(events)', [event]);

  if (!webhooks.length) return;

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    shipment: {
      id: shipment.id,
      tracking_id: shipment.tracking_id,
      status: shipment.status,
      origin: `${shipment.origin_city}, ${shipment.origin_country}`,
      destination: `${shipment.destination_city}, ${shipment.destination_country}`,
    },
    data,
  };

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    webhooks.map(webhook => deliverOne(webhook, body, event, shipment.id))
  );
}

async function deliverOne(webhook, body, event, shipmentId) {
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  const start = Date.now();
  let statusCode, responseBody, success = false;

  try {
    const res = await axios.post(webhook.url, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-TrackFlow-Signature': `sha256=${signature}`,
        'X-TrackFlow-Event': event,
      },
      timeout: 10000,
    });
    statusCode = res.status;
    responseBody = typeof res.data === 'string' ? res.data.slice(0, 500) : JSON.stringify(res.data).slice(0, 500);
    success = statusCode >= 200 && statusCode < 300;
  } catch (err) {
    statusCode = err.response?.status || 0;
    responseBody = err.message;
    logger.warn(`Webhook delivery failed for ${webhook.url}:`, err.message);

    // Disable webhook after 10 consecutive failures
    await db('webhooks').where({ id: webhook.id }).increment('failure_count', 1);
    const updated = await db('webhooks').where({ id: webhook.id }).first();
    if (updated.failure_count >= 10) {
      await db('webhooks').where({ id: webhook.id }).update({ is_active: false });
      logger.warn(`Webhook ${webhook.id} disabled after 10 failures`);
    }
  }

  if (success) {
    await db('webhooks').where({ id: webhook.id }).update({
      failure_count: 0,
      last_triggered_at: new Date(),
    });
  }

  await db('webhook_deliveries').insert({
    webhook_id: webhook.id,
    shipment_id: shipmentId,
    event,
    status_code: statusCode,
    response_body: responseBody,
    duration_ms: Date.now() - start,
    success,
  });
}

module.exports = { deliver };
