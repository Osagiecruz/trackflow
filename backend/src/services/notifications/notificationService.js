const db = require('../../config/database');
const smsService = require('./smsService');
const emailService = require('./emailService');
const logger = require('../../utils/logger');

const STATUS_TRIGGERS = {
  pending: 'notify_on_dispatch',
  in_transit: 'notify_on_transit',
  customs_cleared: 'notify_on_customs',
  out_for_delivery: 'notify_on_out_for_delivery',
  delivered: 'notify_on_delivered',
  exception: 'notify_on_exception',
};

/**
 * Notify subscribers when a shipment status changes.
 */
async function notifyStatusChange(shipment, event) {
  const triggerField = STATUS_TRIGGERS[event.status];
  if (!triggerField) return;

  const subscriptions = await db('notification_subscriptions')
    .where({ shipment_id: shipment.id })
    .where(triggerField, true);

  for (const sub of subscriptions) {
    const payload = {
      trackingId: shipment.tracking_id,
      status: event.status,
      description: event.description,
      location: event.location,
      estimatedDelivery: shipment.estimated_delivery,
      recipient: shipment.recipient,
    };

    const promises = [];

    if (sub.email) {
      promises.push(
        emailService.sendStatusUpdate({ ...payload, to: sub.email })
          .then(msgId => logNotification(shipment.id, sub.id, 'email', sub.email, 'sent', msgId))
          .catch(err => logNotification(shipment.id, sub.id, 'email', sub.email, 'failed', null, err.message))
      );
    }

    if (sub.phone) {
      promises.push(
        smsService.sendStatusUpdate({ ...payload, to: sub.phone })
          .then(msgId => logNotification(shipment.id, sub.id, 'sms', sub.phone, 'sent', msgId))
          .catch(err => logNotification(shipment.id, sub.id, 'sms', sub.phone, 'failed', null, err.message))
      );
    }

    await Promise.allSettled(promises);
  }
}

/**
 * Send notification when a new shipment is created (dispatch).
 */
async function notifyShipmentCreated(shipment) {
  const recipient = shipment.recipient;
  if (!recipient) return;

  const payload = {
    trackingId: shipment.tracking_id,
    status: 'pending',
    description: 'Your shipment has been created and is awaiting pickup.',
    estimatedDelivery: shipment.estimated_delivery,
    recipient,
  };

  if (recipient.email) {
    await emailService.sendStatusUpdate({ ...payload, to: recipient.email })
      .catch(err => logger.warn('Dispatch email failed:', err.message));
  }

  if (recipient.phone) {
    await smsService.sendStatusUpdate({ ...payload, to: recipient.phone })
      .catch(err => logger.warn('Dispatch SMS failed:', err.message));
  }
}

async function sendCustom(shipment, channel, message) {
  const sub = await db('notification_subscriptions')
    .where({ shipment_id: shipment.id })
    .first();

  if (!sub) throw new Error('No subscription found');

  if (channel === 'sms' && sub.phone) {
    await smsService.sendRaw(sub.phone, message);
  } else if (channel === 'email' && sub.email) {
    await emailService.sendRaw(sub.email, 'Shipment Update', message);
  }
}

async function logNotification(shipmentId, subId, channel, recipient, status, messageId, error) {
  try {
    await db('notification_log').insert({
      shipment_id: shipmentId,
      subscription_id: subId,
      channel,
      recipient,
      status,
      message_id: messageId,
      error_message: error,
    });
  } catch (err) {
    logger.error('Failed to log notification:', err);
  }
}

module.exports = { notifyStatusChange, notifyShipmentCreated, sendCustom };
