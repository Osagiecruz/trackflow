const rateLimit = require('express-rate-limit');

const makeOptions = (windowMs, max, message) => ({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: message },
  skip: (req) => process.env.NODE_ENV === 'test',
});

exports.public = rateLimit(makeOptions(
  60 * 1000,     // 1 minute
  60,            // 60 requests
  'Too many tracking requests. Please wait a minute.'
));

exports.auth = rateLimit(makeOptions(
  60 * 1000,
  10,
  'Too many auth attempts. Please wait a minute.'
));

exports.agency = rateLimit(makeOptions(
  60 * 1000,
  300,
  'Rate limit exceeded. Please slow down.'
));
