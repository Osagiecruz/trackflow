/**
 * Migration: 002_clients_and_agency_requests
 */
exports.up = async function (knex) {
  // Clients table — one per shipment recipient
  await knex.schema.createTable('clients', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('shipment_id').references('id').inTable('shipments').onDelete('CASCADE');
    t.uuid('agency_id').references('id').inTable('agencies').onDelete('CASCADE');
    t.string('username').notNullable().unique(); // e.g. TRK-29183746
    t.string('password_hash').notNullable();
    t.string('full_name').notNullable();
    t.string('email').notNullable();
    t.string('phone');
    t.boolean('is_active').defaultTo(true);
    t.boolean('credentials_sent').defaultTo(false);
    t.timestamp('last_login');
    t.timestamps(true, true);
    t.index(['username']);
    t.index(['shipment_id']);
    t.index(['email']);
  });

  // Agency requests table — pending admin approval
  await knex.schema.createTable('agency_requests', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('agency_name').notNullable();
    t.string('email').notNullable().unique();
    t.string('country', 2);
    t.string('phone');
    t.string('website');
    t.text('description'); // why they want to use TrackFlow
    t.string('status').defaultTo('pending'); // pending | approved | rejected
    t.text('admin_note'); // reason for rejection etc
    t.timestamp('reviewed_at');
    t.string('reviewed_by');
    t.timestamps(true, true);
    t.index(['status']);
    t.index(['email']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('clients');
  await knex.schema.dropTableIfExists('agency_requests');
};