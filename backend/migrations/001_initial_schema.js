/**
 * Migration: 001_initial_schema
 * Creates all core tables for TrackFlow
 */
exports.up = async function (knex) {
  // Agencies (shipping companies that use the platform)
  await knex.schema.createTable('agencies', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('phone');
    t.string('country', 2);
    t.string('logo_url');
    t.string('plan').defaultTo('starter'); // starter | pro | enterprise
    t.boolean('is_active').defaultTo(true);
    t.boolean('email_verified').defaultTo(false);
    t.string('email_verify_token');
    t.string('password_reset_token');
    t.timestamp('password_reset_expires');
    t.jsonb('settings').defaultTo('{}'); // notification prefs, webhook urls, etc.
    t.timestamps(true, true);
  });

  // Refresh tokens
  await knex.schema.createTable('refresh_tokens', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('agency_id').references('id').inTable('agencies').onDelete('CASCADE');
    t.string('token').notNullable().unique();
    t.timestamp('expires_at').notNullable();
    t.string('ip_address');
    t.string('user_agent');
    t.timestamps(true, true);
  });

  // Shipments
  await knex.schema.createTable('shipments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('agency_id').references('id').inTable('agencies').onDelete('CASCADE');
    t.string('tracking_id').notNullable().unique();  // e.g. TF-DE-US-29183746
    t.string('carrier_tracking_id');                  // carrier's own tracking number
    t.string('carrier').notNullable();               // dhl | fedex | ups | custom
    t.string('service');                              // express | standard | economy
    t.string('status').defaultTo('pending');         // pending | in_transit | out_for_delivery | delivered | exception | returned
    t.string('origin_country', 2).notNullable();
    t.string('origin_city').notNullable();
    t.string('origin_address');
    t.string('destination_country', 2).notNullable();
    t.string('destination_city').notNullable();
    t.string('destination_address');
    t.string('destination_postal_code');
    t.jsonb('sender').defaultTo('{}');               // { name, email, phone }
    t.jsonb('recipient').defaultTo('{}');            // { name, email, phone }
    t.jsonb('package').defaultTo('{}');              // { weight, dimensions, description, value, currency }
    t.timestamp('estimated_delivery');
    t.timestamp('actual_delivery');
    t.timestamp('shipped_at');
    t.boolean('signature_required').defaultTo(false);
    t.string('special_instructions');
    t.jsonb('metadata').defaultTo('{}');             // arbitrary agency data
    t.timestamps(true, true);
    t.index(['tracking_id']);
    t.index(['agency_id']);
    t.index(['status']);
    t.index(['carrier_tracking_id']);
  });

  // Tracking events (the timeline)
  await knex.schema.createTable('tracking_events', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('shipment_id').references('id').inTable('shipments').onDelete('CASCADE');
    t.string('status').notNullable();                // e.g. 'in_transit', 'customs_cleared'
    t.string('description').notNullable();
    t.string('location');
    t.decimal('latitude', 10, 7);
    t.decimal('longitude', 10, 7);
    t.string('country', 2);
    t.string('city');
    t.string('facility');                            // e.g. 'Frankfurt Hub'
    t.timestamp('occurred_at').notNullable();
    t.string('source').defaultTo('manual');          // manual | dhl | fedex | ups
    t.jsonb('raw_data').defaultTo('{}');             // original carrier response
    t.timestamps(true, true);
    t.index(['shipment_id']);
    t.index(['occurred_at']);
  });

  // Notification subscriptions
  await knex.schema.createTable('notification_subscriptions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('shipment_id').references('id').inTable('shipments').onDelete('CASCADE');
    t.string('email');
    t.string('phone');
    t.boolean('notify_on_dispatch').defaultTo(true);
    t.boolean('notify_on_transit').defaultTo(false);
    t.boolean('notify_on_customs').defaultTo(true);
    t.boolean('notify_on_out_for_delivery').defaultTo(true);
    t.boolean('notify_on_delivered').defaultTo(true);
    t.boolean('notify_on_exception').defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['shipment_id']);
  });

  // Notification log
  await knex.schema.createTable('notification_log', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('shipment_id').references('id').inTable('shipments').onDelete('CASCADE');
    t.uuid('subscription_id').references('id').inTable('notification_subscriptions').onDelete('SET NULL').nullable();
    t.string('channel').notNullable();               // sms | email
    t.string('recipient').notNullable();
    t.string('status').notNullable();                // sent | failed | bounced
    t.string('message_id');                          // Twilio/SendGrid message ID
    t.text('error_message');
    t.timestamp('sent_at').defaultTo(knex.fn.now());
  });

  // Webhooks (agency outbound webhooks)
  await knex.schema.createTable('webhooks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('agency_id').references('id').inTable('agencies').onDelete('CASCADE');
    t.string('url').notNullable();
    t.string('secret').notNullable();               // HMAC signing secret
    t.specificType('events', 'text[]').defaultTo('{}'); // events to subscribe to
    t.boolean('is_active').defaultTo(true);
    t.integer('failure_count').defaultTo(0);
    t.timestamp('last_triggered_at');
    t.timestamps(true, true);
  });

  // Webhook delivery log
  await knex.schema.createTable('webhook_deliveries', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('webhook_id').references('id').inTable('webhooks').onDelete('CASCADE');
    t.uuid('shipment_id').references('id').inTable('shipments').onDelete('CASCADE');
    t.string('event').notNullable();
    t.integer('status_code');
    t.text('response_body');
    t.integer('duration_ms');
    t.boolean('success').defaultTo(false);
    t.timestamp('attempted_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('webhook_deliveries');
  await knex.schema.dropTableIfExists('webhooks');
  await knex.schema.dropTableIfExists('notification_log');
  await knex.schema.dropTableIfExists('notification_subscriptions');
  await knex.schema.dropTableIfExists('tracking_events');
  await knex.schema.dropTableIfExists('shipments');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('agencies');
};
