const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const emailService = require('../notifications/emailService');
const logger = require('../../utils/logger');

/**
 * Generate a unique client username from tracking ID
 * e.g. TF-DE-US-29183746 → TRK-29183746
 */
function generateUsername(trackingId) {
  const parts = trackingId.split('-');
  const number = parts[parts.length - 1];
  return `TRK-${number}`;
}

/**
 * Generate a random readable password
 */
function generatePassword() {
  const words = ['Track', 'Ship', 'Pack', 'Move', 'Fast', 'Safe', 'Swift', 'Cargo'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const specials = ['!', '@', '#', '$', '%'];
  const special = specials[Math.floor(Math.random() * specials.length)];
  return `${word}${num}${special}`;
}

/**
 * Create client credentials for a shipment recipient and send them via email.
 * Called automatically when a shipment is created.
 */
async function createClientCredentials(shipment, agencyId) {
  try {
    const recipient = typeof shipment.recipient === 'string'
      ? JSON.parse(shipment.recipient)
      : shipment.recipient;

    if (!recipient || !recipient.email) {
      logger.info(`No recipient email for shipment ${shipment.tracking_id}, skipping client creation`);
      return;
    }

    // Check if client already exists for this shipment
    const existing = await db('clients').where({ shipment_id: shipment.id }).first();
    if (existing) return;

    const username = generateUsername(shipment.tracking_id);
    const rawPassword = generatePassword();
    const password_hash = await bcrypt.hash(rawPassword, 12);

    await db('clients').insert({
      shipment_id: shipment.id,
      agency_id: agencyId,
      username,
      password_hash,
      full_name: recipient.name || 'Valued Customer',
      email: recipient.email,
      phone: recipient.phone || null,
      credentials_sent: true,
    });

    // Send credentials email
    await emailService.sendClientCredentials({
      name: recipient.name || 'Valued Customer',
      email: recipient.email,
      username,
      password: rawPassword,
      trackingId: shipment.tracking_id,
      origin: `${shipment.origin_city}, ${shipment.origin_country}`,
      destination: `${shipment.destination_city}, ${shipment.destination_country}`,
      estimatedDelivery: shipment.estimated_delivery,
    });

    logger.info(`Client credentials created and sent to ${recipient.email} for ${shipment.tracking_id}`);
  } catch (err) {
    logger.error('Failed to create client credentials:', err.message);
  }
}

module.exports = { createClientCredentials };