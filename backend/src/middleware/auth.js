const jwt = require('jsonwebtoken');
const db = require('../config/database');
const AppError = require('../utils/AppError');

exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401);
  }

  const agency = await db('agencies').where({ id: payload.sub, is_active: true }).first();
  if (!agency) throw new AppError('Account not found', 401);

  req.agency = agency;
  next();
};

exports.optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const agency = await db('agencies').where({ id: payload.sub }).first();
    req.agency = agency;
  } catch (_) {
    // Ignore auth errors for optional auth
  }
  next();
};
