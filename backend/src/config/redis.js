const { createClient } = require('redis');
const logger = require('../utils/logger');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Redis max retries exceeded');
      return Math.min(retries * 100, 3000);
    },
  },
});

client.on('error', (err) => logger.error('Redis error:', err));
client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

async function connectRedis() {
  await client.connect();
}

// Cache helpers
async function cacheGet(key) {
  const val = await client.get(key);
  return val ? JSON.parse(val) : null;
}

async function cacheSet(key, value, ttlSeconds = 30) {
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
}

async function cacheDel(key) {
  await client.del(key);
}

async function cacheGetOrSet(key, fetchFn, ttlSeconds = 30) {
  const cached = await cacheGet(key);
  if (cached) return cached;
  const fresh = await fetchFn();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

module.exports = { client, connectRedis, cacheGet, cacheSet, cacheDel, cacheGetOrSet };
