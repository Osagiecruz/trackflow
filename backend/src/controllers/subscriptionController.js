const db = require('../config/database');
const emailService = require('../services/notifications/emailService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Middleware: admin only
exports.adminOnly = (req, res, next) => {
  if (req.agency.email !== process.env.ADMIN_EMAIL) {
    throw new AppError('Admin access required', 403);
  }
  next();
};

// Public: get plans with current crypto addresses
exports.getPlans = async (req, res) => {
  const plans = await db('subscription_plans')
    .where({ is_active: true })
    .whereIn('name', ['starter', 'pro'])
    .orderBy('monthly_price', 'asc');

  res.json({ plans });
};

// Agency: get own subscription status
exports.getMy = async (req, res) => {
  let subscription = await db('subscriptions')
    .where({ agency_id: req.agency.id })
    .orderBy('created_at', 'desc')
    .first();

  if (!subscription) {
    // Auto-create starter subscription for existing agencies
    [subscription] = await db('subscriptions').insert({
      agency_id: req.agency.id,
      plan: 'starter',
      status: 'active',
      shipments_used: 0,
      shipments_limit: 1,
      shipments_rollover: 0,
    }).returning('*');
  }

  const pendingPayment = await db('subscription_payments')
    .where({ agency_id: req.agency.id, status: 'pending' })
    .orderBy('created_at', 'desc')
    .first();

  res.json({ subscription, pendingPayment: pendingPayment || null });
};

// Agency: submit payment for pro plan
exports.submitPayment = async (req, res) => {
  const { plan, billing_cycle, crypto_currency, message } = req.body;

  // Check no pending payment already
  const existing = await db('subscription_payments')
    .where({ agency_id: req.agency.id, status: 'pending' })
    .first();
  if (existing) throw new AppError('You already have a pending payment under review.', 409);

  const planData = await db('subscription_plans').where({ name: plan }).first();
  if (!planData) throw new AppError('Plan not found', 404);

  const amount = billing_cycle === 'yearly' ? planData.yearly_price : planData.monthly_price;

  const [payment] = await db('subscription_payments').insert({
    agency_id: req.agency.id,
    plan,
    billing_cycle,
    crypto_currency,
    message: message || null,
    status: 'pending',
  }).returning('*');

  // Notify admin
  try {
    const cryptoAddress = crypto_currency === 'BTC' ? planData.btc_address : planData.eth_address;
    await emailService.sendAdminNotification({
      subject: `New subscription payment — ${req.agency.name}`,
      message: `Agency: ${req.agency.name} (${req.agency.email})\nPlan: ${plan} / ${billing_cycle}\nAmount: $${(amount / 100).toFixed(2)}\nCrypto: ${crypto_currency}\nAddress used: ${cryptoAddress}\n\nMessage from agency:\n${message || 'None'}\n\nLogin to admin panel to confirm.`,
    });
  } catch (err) {
    logger.warn('Admin notification failed:', err.message);
  }

  res.status(201).json({
    message: 'Payment submission received. Admin will verify and activate your plan.',
    payment,
  });
};

// Admin: list all subscription payments
exports.listPayments = async (req, res) => {
  const { status } = req.query;
  let query = db('subscription_payments')
    .join('agencies', 'subscription_payments.agency_id', 'agencies.id')
    .select(
      'subscription_payments.*',
      'agencies.name as agency_name',
      'agencies.email as agency_email',
    )
    .orderBy('subscription_payments.created_at', 'desc');

  if (status) query = query.where('subscription_payments.status', status);

  const payments = await query;
  res.json({ payments });
};

// Admin: confirm subscription payment → activate plan
exports.confirmPayment = async (req, res) => {
  const payment = await db('subscription_payments').where({ id: req.params.id }).first();
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.status !== 'pending') throw new AppError('Payment already reviewed', 400);

  const planData = await db('subscription_plans').where({ name: payment.plan }).first();

  // Calculate period dates
  const now = new Date();
  const periodEnd = new Date(now);
  if (payment.billing_cycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }
  const graceEndsAt = new Date(periodEnd);
  graceEndsAt.setDate(graceEndsAt.getDate() + 3);

  // Get existing subscription to handle rollover
  const existingSub = await db('subscriptions')
    .where({ agency_id: payment.agency_id })
    .first();

  let rollover = 0;
  if (existingSub && planData.can_rollover) {
    const unused = Math.max(0, (existingSub.shipments_limit + existingSub.shipments_rollover) - existingSub.shipments_used);
    rollover = Math.min(unused, planData.max_rollover);
  }

  if (existingSub) {
    await db('subscriptions').where({ id: existingSub.id }).update({
      plan: payment.plan,
      billing_cycle: payment.billing_cycle,
      status: 'active',
      shipments_used: 0,
      shipments_limit: planData.shipments_per_month,
      shipments_rollover: rollover,
      current_period_start: now,
      current_period_end: periodEnd,
      grace_ends_at: graceEndsAt,
      updated_at: new Date(),
    });
  } else {
    await db('subscriptions').insert({
      agency_id: payment.agency_id,
      plan: payment.plan,
      billing_cycle: payment.billing_cycle,
      status: 'active',
      shipments_used: 0,
      shipments_limit: planData.shipments_per_month,
      shipments_rollover: rollover,
      current_period_start: now,
      current_period_end: periodEnd,
      grace_ends_at: graceEndsAt,
    });
  }

  // Mark payment confirmed
  await db('subscription_payments').where({ id: payment.id }).update({
    status: 'confirmed',
    confirmed_at: new Date(),
    confirmed_by: req.agency.email,
  });

  // Also update agency plan field
  await db('agencies').where({ id: payment.agency_id }).update({ plan: payment.plan });

  // Email agency
  try {
    const agency = await db('agencies').where({ id: payment.agency_id }).first();
    await emailService.sendSubscriptionActivated({
      to: agency.email,
      name: agency.name,
      plan: payment.plan,
      billingCycle: payment.billing_cycle,
      periodEnd,
      shipmentsPerMonth: planData.shipments_per_month,
    });
  } catch (err) {
    logger.warn('Subscription activation email failed:', err.message);
  }

  res.json({ message: 'Subscription activated successfully.' });
};

// Admin: reject subscription payment
exports.rejectPayment = async (req, res) => {
  const payment = await db('subscription_payments').where({ id: req.params.id }).first();
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.status !== 'pending') throw new AppError('Payment already reviewed', 400);

  await db('subscription_payments').where({ id: payment.id }).update({
    status: 'rejected',
    confirmed_by: req.agency.email,
    confirmed_at: new Date(),
  });

  try {
    const agency = await db('agencies').where({ id: payment.agency_id }).first();
    await emailService.sendSubscriptionRejected({
      to: agency.email,
      name: agency.name,
      plan: payment.plan,
      note: req.body.note,
    });
  } catch (err) {
    logger.warn('Rejection email failed:', err.message);
  }

  res.json({ message: 'Payment rejected.' });
};

// Admin: update crypto addresses for a plan
exports.updatePlanAddresses = async (req, res) => {
  const { plan } = req.params;
  const { btc_address, eth_address } = req.body;

  await db('subscription_plans').where({ name: plan }).update({
    btc_address: btc_address || null,
    eth_address: eth_address || null,
    updated_at: new Date(),
  });

  res.json({ message: `${plan} plan addresses updated.` });
};

// Admin: manually set agency plan (for enterprise etc)
exports.adminSetPlan = async (req, res) => {
  const { agency_id, plan, billing_cycle } = req.body;

  const planData = await db('subscription_plans').where({ name: plan }).first();
  if (!planData) throw new AppError('Plan not found', 404);

  const existing = await db('subscriptions').where({ agency_id }).first();

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 100); // "unlimited" for enterprise/manual

  if (existing) {
    await db('subscriptions').where({ id: existing.id }).update({
      plan,
      billing_cycle: billing_cycle || null,
      status: 'active',
      shipments_used: 0,
      shipments_limit: planData.shipments_per_month,
      shipments_rollover: 0,
      current_period_start: now,
      current_period_end: periodEnd,
      updated_at: new Date(),
    });
  } else {
    await db('subscriptions').insert({
      agency_id,
      plan,
      billing_cycle: billing_cycle || null,
      status: 'active',
      shipments_used: 0,
      shipments_limit: planData.shipments_per_month,
      current_period_start: now,
      current_period_end: periodEnd,
    });
  }

  await db('agencies').where({ id: agency_id }).update({ plan });

  res.json({ message: `Agency plan set to ${plan}.` });
};

/**
 * Check if an agency can create a new shipment.
 * Called from shipmentController before creating.
 */
async function canCreateShipment(agencyId) {
  // Admin always can
  const agency = await db('agencies').where({ id: agencyId }).first();
  if (agency.email === process.env.ADMIN_EMAIL) return { allowed: true };

  const subscription = await db('subscriptions').where({ agency_id: agencyId }).first();

  // No subscription — auto-create starter
  if (!subscription) {
    await db('subscriptions').insert({
      agency_id: agencyId,
      plan: 'starter',
      status: 'active',
      shipments_used: 0,
      shipments_limit: 1,
    });
    return { allowed: true, remaining: 1 };
  }

  // Check if subscription is active or in grace
  const now = new Date();

  if (subscription.status === 'active' && subscription.current_period_end && new Date(subscription.current_period_end) < now) {
    // Period expired — move to grace
    const graceEndsAt = new Date();
    graceEndsAt.setDate(graceEndsAt.getDate() + 3);
    await db('subscriptions').where({ id: subscription.id }).update({
      status: 'grace',
      grace_ends_at: graceEndsAt,
    });
    subscription.status = 'grace';
    subscription.grace_ends_at = graceEndsAt;
  }

  if (subscription.status === 'grace' && new Date(subscription.grace_ends_at) < now) {
    await db('subscriptions').where({ id: subscription.id }).update({ status: 'expired' });
    return {
      allowed: false,
      reason: 'Your subscription has expired. Please renew to create new shipments.',
    };
  }

  if (subscription.status === 'expired' || subscription.status === 'cancelled') {
    return {
      allowed: false,
      reason: 'Your subscription has expired. Please renew to create new shipments.',
    };
  }

  // Enterprise = unlimited
  if (subscription.plan === 'enterprise' || subscription.shipments_limit === -1) {
    return { allowed: true };
  }

  // Check shipment count
  const totalAllowed = subscription.shipments_limit + subscription.shipments_rollover;
  const used = subscription.shipments_used;

  if (used >= totalAllowed) {
    if (subscription.plan === 'starter') {
      return {
        allowed: false,
        reason: 'Starter plan allows 1 shipment. Upgrade to Pro to create more shipments.',
        upgradeRequired: true,
      };
    }
    return {
      allowed: false,
      reason: `You have used all ${totalAllowed} shipments for this period. Please upgrade or wait for your next billing cycle.`,
    };
  }

  return {
    allowed: true,
    remaining: totalAllowed - used,
  };
}

/**
 * Increment shipment count after creation.
 */
async function incrementShipmentCount(agencyId) {
  await db('subscriptions')
    .where({ agency_id: agencyId })
    .increment('shipments_used', 1);
}

module.exports = {
  adminOnly: exports.adminOnly,
  getPlans: exports.getPlans,
  getMy: exports.getMy,
  submitPayment: exports.submitPayment,
  listPayments: exports.listPayments,
  confirmPayment: exports.confirmPayment,
  rejectPayment: exports.rejectPayment,
  updatePlanAddresses: exports.updatePlanAddresses,
  adminSetPlan: exports.adminSetPlan,
  canCreateShipment,
  incrementShipmentCount,
};