const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

function signClientToken(clientId, shipmentId) {
  return jwt.sign(
    { sub: clientId, shipmentId, role: 'client' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const client = await db('clients')
    .where({ username: username.toUpperCase() })
    .first();

  if (!client) throw new AppError('Invalid username or password', 401);
  if (!client.is_active) throw new AppError('Account suspended. Contact support.', 403);

  const valid = await bcrypt.compare(password, client.password_hash);
  if (!valid) throw new AppError('Invalid username or password', 401);

  // Update last login
  await db('clients').where({ id: client.id }).update({ last_login: new Date() });

  const token = signClientToken(client.id, client.shipment_id);

  res.json({
    token,
    client: {
      id: client.id,
      username: client.username,
      full_name: client.full_name,
      email: client.email,
      shipment_id: client.shipment_id,
    },
  });
};

exports.authenticateClient = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  if (payload.role !== 'client') throw new AppError('Access denied', 403);

  const client = await db('clients').where({ id: payload.sub, is_active: true }).first();
  if (!client) throw new AppError('Account not found', 401);

  req.client = client;
  next();
};

exports.me = async (req, res) => {
  const { password_hash, ...client } = req.client;
  res.json({ client });
};

exports.tracking = async (req, res) => {
  const shipment = await db('shipments')
    .where({ id: req.client.shipment_id })
    .first();

  if (!shipment) throw new AppError('Shipment not found', 404);

  const events = await db('tracking_events')
    .where({ shipment_id: shipment.id })
    .orderBy('occurred_at', 'asc');

  res.json({ shipment, events });
};