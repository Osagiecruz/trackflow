const router = require('express').Router();
const crypto = require('crypto');
const db = require('../config/database');
const { syncFromCarrier } = require('../services/carriers/carrierService');
const logger = require('../utils/logger');

// DHL webhook
router.post('/dhl', async (req, res) => {
  // DHL sends event notifications; trigger a sync
  const { shipmentTrackingNumber } = req.body;
  if (shipmentTrackingNumber) {
    const shipment = await db('shipments')
      .where({ carrier_tracking_id: shipmentTrackingNumber, carrier: 'dhl' })
      .first();
    if (shipment) {
      syncFromCarrier(shipment).catch(err => logger.warn('DHL webhook sync failed:', err.message));
    }
  }
  res.status(200).send('OK');
});

// FedEx webhook
router.post('/fedex', async (req, res) => {
  const trackingNumber = req.body?.trackingNumber;
  if (trackingNumber) {
    const shipment = await db('shipments')
      .where({ carrier_tracking_id: trackingNumber, carrier: 'fedex' })
      .first();
    if (shipment) {
      syncFromCarrier(shipment).catch(err => logger.warn('FedEx webhook sync failed:', err.message));
    }
  }
  res.status(200).send('OK');
});

module.exports = router;
