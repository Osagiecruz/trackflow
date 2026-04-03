require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Routes
const trackRoutes = require('./routes/track');
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhooks');

// Background jobs
const { startPollingJob } = require('./services/tracking/poller');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// ─── Rate limiting ────────────────────────────────────────
app.use('/api/track', rateLimiter.public);       // 60/min per IP
app.use('/api/auth', rateLimiter.auth);           // 10/min per IP
app.use('/api/', rateLimiter.agency);             // 300/min per token

// ─── Routes ───────────────────────────────────────────────
app.use('/api/track', trackRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// ─── Error handler (must be last) ────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────
async function start() {
  try {
    await connectRedis();
    logger.info('Redis connected');

    app.listen(PORT, () => {
      logger.info(`TrackFlow API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // Start background carrier polling every 5 minutes
    if (process.env.NODE_ENV === 'production') {
      startPollingJob();
      logger.info('Carrier polling job started');
    }
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app; // for testing
