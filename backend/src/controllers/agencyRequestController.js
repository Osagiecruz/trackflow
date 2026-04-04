const bcrypt = require('bcryptjs');
const db = require('../config/database');
const emailService = require('../services/notifications/emailService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Middleware: only the admin email can access these routes
exports.adminOnly = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new AppError('Admin not configured', 500);
  if (req.agency.email !== adminEmail) throw new AppError('Admin access required', 403);
  next();
};

// Public: submit an agency request
exports.submit = async (req, res) => {
  const { agency_name, email, country, phone, website, description } = req.body;

  const existing = await db('agency_requests').where({ email }).first();
  if (existing) {
    if (existing.status === 'pending') {
      throw new AppError('A request with this email is already pending review.', 409);
    }
    if (existing.status === 'approved') {
      throw new AppError('This email is already registered. Please login.', 409);
    }
  }

  const existingAgency = await db('agencies').where({ email }).first();
  if (existingAgency) throw new AppError('This email is already registered as an agency.', 409);

  await db('agency_requests').insert({
    agency_name, email, country, phone, website, description,
  });

  // Notify admin
  try {
    await emailService.sendAdminNotification({
      subject: `New Agency Request — ${agency_name}`,
      message: `A new agency has requested access:\n\nName: ${agency_name}\nEmail: ${email}\nCountry: ${country || 'N/A'}\nWebsite: ${website || 'N/A'}\n\nDescription: ${description || 'N/A'}\n\nLogin to your admin panel to approve or reject.`,
    });
  } catch (err) {
    logger.warn('Admin notification email failed:', err.message);
  }

  res.status(201).json({
    message: 'Your request has been submitted. You will receive an email once reviewed.',
  });
};

// Admin: list all requests
exports.list = async (req, res) => {
  const { status } = req.query;
  let query = db('agency_requests').orderBy('created_at', 'desc');
  if (status) query = query.where({ status });
  const requests = await query;
  res.json({ requests });
};

// Admin: approve a request — creates agency account and emails credentials
exports.approve = async (req, res) => {
  const request = await db('agency_requests').where({ id: req.params.id }).first();
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request already reviewed', 400);

  // Generate a random password
  const rawPassword = generatePassword();
  const password_hash = await bcrypt.hash(rawPassword, 12);

  // Create the agency account
  const [agency] = await db('agencies').insert({
    name: request.agency_name,
    email: request.email,
    password_hash,
    phone: request.phone,
    country: request.country,
    plan: 'starter',
    is_active: true,
    email_verified: true,
  }).returning(['id', 'name', 'email']);

  // Mark request as approved
  await db('agency_requests').where({ id: request.id }).update({
    status: 'approved',
    reviewed_at: new Date(),
    reviewed_by: req.agency.email,
  });

  // Email credentials to the new agency
  try {
    await emailService.sendAgencyApproved({
      name: request.agency_name,
      email: request.email,
      password: rawPassword,
    });
  } catch (err) {
    logger.error('Failed to send approval email:', err.message);
  }

  res.json({ message: `Agency approved. Credentials sent to ${request.email}.`, agency });
};

// Admin: reject a request
exports.reject = async (req, res) => {
  const request = await db('agency_requests').where({ id: req.params.id }).first();
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request already reviewed', 400);

  await db('agency_requests').where({ id: request.id }).update({
    status: 'rejected',
    admin_note: req.body.note || '',
    reviewed_at: new Date(),
    reviewed_by: req.agency.email,
  });

  // Email rejection notice
  try {
    await emailService.sendAgencyRejected({
      name: request.agency_name,
      email: request.email,
      note: req.body.note,
    });
  } catch (err) {
    logger.warn('Rejection email failed:', err.message);
  }

  res.json({ message: 'Request rejected.' });
};

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '!@#$%';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  password += specials[Math.floor(Math.random() * specials.length)];
  password += Math.floor(Math.random() * 90 + 10);
  return password;
}