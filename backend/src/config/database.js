const knex = require('knex');
const logger = require('../utils/logger');

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 600000,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
});

// Test connection on startup
db.raw('SELECT 1')
  .then(() => logger.info('Database connected'))
  .catch((err) => {
    logger.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = db;
