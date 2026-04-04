exports.up = async function (knex) {
  await knex.schema.alterTable('notification_subscriptions', (t) => {
    t.boolean('notify_on_transit').defaultTo(true).alter();
  });

  // Update all existing subscriptions
  await knex('notification_subscriptions').update({
    notify_on_transit: true,
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('notification_subscriptions', (t) => {
    t.boolean('notify_on_transit').defaultTo(false).alter();
  });
};