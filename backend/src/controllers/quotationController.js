const db = require('../config/database');
const emailService = require('../services/notifications/emailService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Agency creates quotation for a shipment
exports.create = async (req, res) => {
  const { shipment_id, currency, btc_address, eth_address, notes, items } = req.body;

  // Verify shipment belongs to this agency
  const shipment = await db('shipments')
    .where({ id: shipment_id, agency_id: req.agency.id })
    .first();
  if (!shipment) throw new AppError('Shipment not found', 404);

  // Check quotation doesn't already exist
  const existing = await db('quotations').where({ shipment_id }).first();
  if (existing) throw new AppError('Quotation already exists for this shipment. Use PUT to update.', 409);

  const total = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const [quotation] = await db('quotations').insert({
    shipment_id,
    agency_id: req.agency.id,
    currency: currency || 'USD',
    total,
    btc_address: btc_address || null,
    eth_address: eth_address || null,
    notes: notes || null,
    status: 'unpaid',
  }).returning('*');

  // Insert line items
  const quotationItems = items.map((item, i) => ({
    quotation_id: quotation.id,
    description: item.description,
    amount: parseFloat(item.amount),
    sort_order: i,
  }));

  await db('quotation_items').insert(quotationItems);

  // Notify client via email
  try {
    const recipient = typeof shipment.recipient === 'string'
      ? JSON.parse(shipment.recipient)
      : shipment.recipient;

    if (recipient?.email) {
      await emailService.sendQuotationReady({
        to: recipient.email,
        recipientName: recipient.name,
        trackingId: shipment.tracking_id,
        total,
        currency: currency || 'USD',
        items,
        btcAddress: btc_address,
        ethAddress: eth_address,
        notes,
      });
    }
  } catch (err) {
    logger.warn('Quotation email failed:', err.message);
  }

  const fullItems = await db('quotation_items')
    .where({ quotation_id: quotation.id })
    .orderBy('sort_order');

  res.status(201).json({ quotation: { ...quotation, items: fullItems } });
};

// Agency gets quotation for a shipment
exports.getByShipment = async (req, res) => {
  const shipment = await db('shipments')
    .where({ id: req.params.shipmentId, agency_id: req.agency.id })
    .first();
  if (!shipment) throw new AppError('Shipment not found', 404);

  const quotation = await db('quotations').where({ shipment_id: shipment.id }).first();
  if (!quotation) throw new AppError('No quotation found for this shipment', 404);

  const items = await db('quotation_items')
    .where({ quotation_id: quotation.id })
    .orderBy('sort_order');

  const submissions = await db('payment_submissions')
    .where({ quotation_id: quotation.id })
    .orderBy('created_at', 'desc');

  res.json({ quotation: { ...quotation, items, submissions } });
};

// Agency updates quotation
exports.update = async (req, res) => {
  const quotation = await db('quotations')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .first();
  if (!quotation) throw new AppError('Quotation not found', 404);
  if (quotation.status === 'paid') throw new AppError('Cannot edit a paid quotation', 400);

  const { items, btc_address, eth_address, notes, currency } = req.body;

  let total = quotation.total;

  if (items && items.length > 0) {
    total = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    await db('quotation_items').where({ quotation_id: quotation.id }).delete();
    await db('quotation_items').insert(
      items.map((item, i) => ({
        quotation_id: quotation.id,
        description: item.description,
        amount: parseFloat(item.amount),
        sort_order: i,
      }))
    );
  }

  const [updated] = await db('quotations')
    .where({ id: quotation.id })
    .update({
      total,
      btc_address: btc_address !== undefined ? btc_address : quotation.btc_address,
      eth_address: eth_address !== undefined ? eth_address : quotation.eth_address,
      notes: notes !== undefined ? notes : quotation.notes,
      currency: currency || quotation.currency,
      updated_at: new Date(),
    })
    .returning('*');

  const updatedItems = await db('quotation_items')
    .where({ quotation_id: quotation.id })
    .orderBy('sort_order');

  res.json({ quotation: { ...updated, items: updatedItems } });
};

// Agency confirms payment received
exports.confirmPayment = async (req, res) => {
  const quotation = await db('quotations')
    .where({ id: req.params.id, agency_id: req.agency.id })
    .first();
  if (!quotation) throw new AppError('Quotation not found', 404);

  await db('quotations').where({ id: quotation.id }).update({
    status: 'paid',
    paid_at: new Date(),
    updated_at: new Date(),
  });

  // Update latest payment submission to confirmed
  await db('payment_submissions')
    .where({ quotation_id: quotation.id, status: 'pending' })
    .update({ status: 'confirmed', confirmed_at: new Date() });

  // Notify client
  try {
    const shipment = await db('shipments').where({ id: quotation.shipment_id }).first();
    const recipient = typeof shipment.recipient === 'string'
      ? JSON.parse(shipment.recipient)
      : shipment.recipient;

    if (recipient?.email) {
      await emailService.sendPaymentConfirmed({
        to: recipient.email,
        recipientName: recipient.name,
        trackingId: shipment.tracking_id,
        total: quotation.total,
        currency: quotation.currency,
      });
    }
  } catch (err) {
    logger.warn('Payment confirmation email failed:', err.message);
  }

  res.json({ message: 'Payment confirmed' });
};

// Client views their quotation
exports.getForClient = async (req, res) => {
  const quotation = await db('quotations')
    .where({ shipment_id: req.client.shipment_id })
    .first();

  if (!quotation) throw new AppError('No quotation found', 404);

  const items = await db('quotation_items')
    .where({ quotation_id: quotation.id })
    .orderBy('sort_order');

  const submissions = await db('payment_submissions')
    .where({ quotation_id: quotation.id })
    .orderBy('created_at', 'desc');

  res.json({ quotation: { ...quotation, items, submissions } });
};

// Client submits payment notification
exports.submitPayment = async (req, res) => {
  const quotation = await db('quotations')
    .where({ id: req.params.id, shipment_id: req.client.shipment_id })
    .first();
  if (!quotation) throw new AppError('Quotation not found', 404);
  if (quotation.status === 'paid') throw new AppError('This quotation is already paid', 400);

  const { crypto_currency, message } = req.body;

  await db('payment_submissions').insert({
    quotation_id: quotation.id,
    shipment_id: quotation.shipment_id,
    crypto_currency,
    message: message || null,
    status: 'pending',
  });

  await db('quotations').where({ id: quotation.id }).update({
    status: 'pending_confirmation',
    updated_at: new Date(),
  });

  // Email agency
  try {
    const shipment = await db('shipments').where({ id: quotation.shipment_id }).first();
    const agency = await db('agencies').where({ id: quotation.agency_id }).first();

    await emailService.sendPaymentNotification({
      to: agency.email,
      agencyName: agency.name,
      trackingId: shipment.tracking_id,
      cryptoCurrency: crypto_currency,
      message,
      total: quotation.total,
      currency: quotation.currency,
    });
  } catch (err) {
    logger.warn('Payment notification email failed:', err.message);
  }

  res.json({ message: 'Payment notification sent to agency. Awaiting confirmation.' });
};