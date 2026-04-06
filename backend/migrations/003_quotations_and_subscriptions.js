/**
 * Migration: 003_quotations_and_subscriptions
 */
exports.up = async function (knex) {

  // ─── Subscription Plans (admin-managed) ──────────────────
  await knex.schema.createTable('subscription_plans', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable(); // starter | pro | enterprise
    t.integer('monthly_price').defaultTo(0); // in USD cents
    t.integer('yearly_price').defaultTo(0);  // in USD cents (after discount)
    t.integer('shipments_per_month').defaultTo(1); // -1 = unlimited
    t.boolean('can_rollover').defaultTo(false);
    t.integer('max_rollover').defaultTo(0); // max rolled over shipments
    t.boolean('requires_payment').defaultTo(false);
    t.string('btc_address').nullable();
    t.string('eth_address').nullable();
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });

  // ─── Agency Subscriptions ─────────────────────────────────
  await knex.schema.createTable('subscriptions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('agency_id').references('id').inTable('agencies').onDelete('CASCADE');
    t.string('plan').notNullable().defaultTo('starter'); // starter | pro | enterprise
    t.string('billing_cycle').nullable(); // monthly | yearly
    t.string('status').defaultTo('active'); // active | expired | grace | cancelled
    t.integer('shipments_used').defaultTo(0);
    t.integer('shipments_limit').defaultTo(1);
    t.integer('shipments_rollover').defaultTo(0); // carried over from last period
    t.timestamp('current_period_start').nullable();
    t.timestamp('current_period_end').nullable();
    t.timestamp('grace_ends_at').nullable();
    t.timestamps(true, true);
    t.index(['agency_id']);
    t.index(['status']);
  });

  // ─── Subscription Payment Submissions ────────────────────
  await knex.schema.createTable('subscription_payments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('agency_id').references('id').inTable('agencies').onDelete('CASCADE');
    t.uuid('subscription_id').references('id').inTable('subscriptions').onDelete('SET NULL').nullable();
    t.string('plan').notNullable();
    t.string('billing_cycle').notNullable();
    t.string('crypto_currency').notNullable(); // BTC | ETH
    t.string('message').nullable(); // payment message from agency
    t.string('status').defaultTo('pending'); // pending | confirmed | rejected
    t.timestamp('confirmed_at').nullable();
    t.string('confirmed_by').nullable();
    t.timestamps(true, true);
    t.index(['agency_id']);
    t.index(['status']);
  });

  // ─── Quotations ───────────────────────────────────────────
  await knex.schema.createTable('quotations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('shipment_id').references('id').inTable('shipments').onDelete('CASCADE').unique();
    t.uuid('agency_id').references('id').inTable('agencies').onDelete('CASCADE');
    t.string('currency').defaultTo('USD');
    t.decimal('total', 12, 2).defaultTo(0);
    t.string('btc_address').nullable();
    t.string('eth_address').nullable();
    t.string('status').defaultTo('unpaid'); // unpaid | pending_confirmation | paid
    t.text('notes').nullable();
    t.timestamp('paid_at').nullable();
    t.timestamps(true, true);
    t.index(['shipment_id']);
    t.index(['agency_id']);
  });

  // ─── Quotation Line Items ─────────────────────────────────
  await knex.schema.createTable('quotation_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('quotation_id').references('id').inTable('quotations').onDelete('CASCADE');
    t.string('description').notNullable();
    t.decimal('amount', 12, 2).notNullable();
    t.integer('sort_order').defaultTo(0);
    t.timestamps(true, true);
    t.index(['quotation_id']);
  });

  // ─── Payment Submissions (client → agency) ────────────────
  await knex.schema.createTable('payment_submissions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('quotation_id').references('id').inTable('quotations').onDelete('CASCADE');
    t.uuid('shipment_id').references('id').inTable('shipments').onDelete('CASCADE');
    t.string('crypto_currency').notNullable(); // BTC | ETH
    t.text('message').nullable();
    t.string('status').defaultTo('pending'); // pending | confirmed | rejected
    t.timestamp('confirmed_at').nullable();
    t.timestamps(true, true);
    t.index(['quotation_id']);
    t.index(['shipment_id']);
  });

  // ─── Seed starter plan ────────────────────────────────────
  await knex('subscription_plans').insert([
    {
      name: 'starter',
      monthly_price: 0,
      yearly_price: 0,
      shipments_per_month: 1,
      can_rollover: false,
      max_rollover: 0,
      requires_payment: false,
    },
    {
      name: 'pro',
      monthly_price: 5000,   // $50.00
      yearly_price: 54000,   // $540.00 (10% off $600)
      shipments_per_month: 10,
      can_rollover: true,
      max_rollover: 50,
      requires_payment: true,
    },
    {
      name: 'enterprise',
      monthly_price: 0,
      yearly_price: 0,
      shipments_per_month: -1,
      can_rollover: false,
      max_rollover: 0,
      requires_payment: false,
    },
  ]);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('payment_submissions');
  await knex.schema.dropTableIfExists('quotation_items');
  await knex.schema.dropTableIfExists('quotations');
  await knex.schema.dropTableIfExists('subscription_payments');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('subscription_plans');
};