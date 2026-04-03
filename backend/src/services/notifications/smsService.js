const twilio = require('twilio');
const logger = require('../../utils/logger');

let client;

function getClient() {
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

const STATUS_MESSAGES = {
  pending: '📦 Your shipment #{trackingId} has been created and is awaiting pickup.',
  in_transit: '🚚 Your shipment #{trackingId} is in transit. {description} — {location}',
  customs_cleared: '✅ Your shipment #{trackingId} has cleared customs at {location}.',
  out_for_delivery: '🛵 Great news! #{trackingId} is out for delivery today.',
  delivered: '🎉 Your shipment #{trackingId} has been delivered. Thank you for using TrackFlow!',
  exception: '⚠️ There is an issue with shipment #{trackingId}: {description}. We are working to resolve this.',
};

function buildMessage({ trackingId, status, description, location }) {
  const template = STATUS_MESSAGES[status] || `📦 Update for shipment #{trackingId}: {description}`;
  return template
    .replace('{trackingId}', trackingId)
    .replace('{description}', description || '')
    .replace('{location}', location || '');
}

async function sendStatusUpdate({ to, trackingId, status, description, location }) {
  if (process.env.NODE_ENV === 'test') {
    logger.info(`[TEST] SMS to ${to}: ${buildMessage({ trackingId, status, description, location })}`);
    return 'test_message_id';
  }

  const message = await getClient().messages.create({
    body: buildMessage({ trackingId, status, description, location }),
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });

  logger.info(`SMS sent to ${to}: ${message.sid}`);
  return message.sid;
}

async function sendRaw(to, body) {
  if (process.env.NODE_ENV === 'test') {
    logger.info(`[TEST] SMS to ${to}: ${body}`);
    return 'test_message_id';
  }

  const message = await getClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });

  return message.sid;
}

module.exports = { sendStatusUpdate, sendRaw };
