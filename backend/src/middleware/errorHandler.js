const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (status >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
