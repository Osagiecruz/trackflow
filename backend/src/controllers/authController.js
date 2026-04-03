const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { cacheDel } = require('../config/redis');
const logger = require('../utils/logger');
const emailService = require('../services/notifications/emailService');
const AppError = require('../utils/AppError');

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days in seconds

function signAccessToken(agencyId) {
  return jwt.sign({ sub: agencyId, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function signRefreshToken() {
  return uuidv4() + uuidv4(); // opaque token stored in DB
}

exports.register = async (req, res) => {
  const { name, email, password, phone, country } = req.body;

  const existing = await db('agencies').where({ email }).first();
  if (existing) throw new AppError('Email already registered', 409);

  const password_hash = await bcrypt.hash(password, 12);
  const [agency] = await db('agencies').insert({
    name, email, password_hash, phone, country,
  }).returning(['id', 'name', 'email', 'plan', 'created_at']);

  // Send welcome email
  try {
    await emailService.sendWelcome({ name: agency.name, email: agency.email });
  } catch (err) {
    logger.warn('Welcome email failed:', err.message);
  }

  const accessToken = signAccessToken(agency.id);
  const refreshToken = signRefreshToken();

  await db('refresh_tokens').insert({
    agency_id: agency.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });

  res.status(201).json({
    agency,
    tokens: { access: accessToken, refresh: refreshToken },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const agency = await db('agencies').where({ email }).first();
  if (!agency) throw new AppError('Invalid credentials', 401);
  if (!agency.is_active) throw new AppError('Account suspended', 403);

  const valid = await bcrypt.compare(password, agency.password_hash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = signAccessToken(agency.id);
  const refreshToken = signRefreshToken();

  await db('refresh_tokens').insert({
    agency_id: agency.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });

  const { password_hash, ...safeAgency } = agency;
  res.json({ agency: safeAgency, tokens: { access: accessToken, refresh: refreshToken } });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  const stored = await db('refresh_tokens')
    .where({ token: refreshToken })
    .where('expires_at', '>', new Date())
    .first();

  if (!stored) throw new AppError('Invalid or expired refresh token', 401);

  const agency = await db('agencies').where({ id: stored.agency_id }).first();
  if (!agency || !agency.is_active) throw new AppError('Account not found', 401);

  // Rotate refresh token
  await db('refresh_tokens').where({ id: stored.id }).delete();
  const newRefreshToken = signRefreshToken();
  await db('refresh_tokens').insert({
    agency_id: agency.id,
    token: newRefreshToken,
    expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });

  res.json({
    tokens: {
      access: signAccessToken(agency.id),
      refresh: newRefreshToken,
    },
  });
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await db('refresh_tokens').where({ token: refreshToken }).delete();
  }
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  const { password_hash, ...agency } = req.agency;
  res.json({ agency });
};

exports.updateProfile = async (req, res) => {
  const { name, phone, country, settings } = req.body;
  const [updated] = await db('agencies')
    .where({ id: req.agency.id })
    .update({ name, phone, country, settings, updated_at: new Date() })
    .returning(['id', 'name', 'email', 'phone', 'country', 'plan', 'settings']);
  res.json({ agency: updated });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const valid = await bcrypt.compare(currentPassword, req.agency.password_hash);
  if (!valid) throw new AppError('Current password is incorrect', 400);

  const password_hash = await bcrypt.hash(newPassword, 12);
  await db('agencies').where({ id: req.agency.id }).update({ password_hash });

  // Invalidate all refresh tokens
  await db('refresh_tokens').where({ agency_id: req.agency.id }).delete();
  res.json({ message: 'Password changed. Please log in again.' });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const agency = await db('agencies').where({ email }).first();

  // Always return 200 to prevent email enumeration
  if (agency) {
    const token = uuidv4();
    await db('agencies').where({ id: agency.id }).update({
      password_reset_token: token,
      password_reset_expires: new Date(Date.now() + 3600000), // 1 hour
    });
    try {
      await emailService.sendPasswordReset({ name: agency.name, email, token });
    } catch (err) {
      logger.error('Password reset email failed:', err);
    }
  }

  res.json({ message: 'If this email exists, a reset link has been sent.' });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const agency = await db('agencies')
    .where({ password_reset_token: token })
    .where('password_reset_expires', '>', new Date())
    .first();

  if (!agency) throw new AppError('Invalid or expired reset token', 400);

  const password_hash = await bcrypt.hash(password, 12);
  await db('agencies').where({ id: agency.id }).update({
    password_hash,
    password_reset_token: null,
    password_reset_expires: null,
  });
  await db('refresh_tokens').where({ agency_id: agency.id }).delete();

  res.json({ message: 'Password reset successful. Please log in.' });
};
