const router = require('express').Router();
const { body, param } = require('express-validator');
const quotationController = require('../controllers/quotationController');
const { authenticate } = require('../middleware/auth');
const clientAuth = require('../controllers/clientAuthController');
const validate = require('../middleware/validate');

// ─── Agency routes (authenticated) ───────────────────────
router.post('/',
  authenticate,
  [
    body('shipment_id').isUUID(),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'NGN']),
    body('btc_address').optional().isString(),
    body('eth_address').optional().isString(),
    body('notes').optional().isString(),
    body('items').isArray({ min: 1 }),
    body('items.*.description').isString().notEmpty(),
    body('items.*.amount').isNumeric(),
  ],
  validate,
  quotationController.create
);

router.get('/shipment/:shipmentId', authenticate, quotationController.getByShipment);

router.put('/:id',
  authenticate,
  [
    body('items').optional().isArray(),
    body('btc_address').optional().isString(),
    body('eth_address').optional().isString(),
    body('notes').optional().isString(),
  ],
  validate,
  quotationController.update
);

// Confirm payment (agency marks as paid)
router.post('/:id/confirm', authenticate, quotationController.confirmPayment);

// ─── Client routes ────────────────────────────────────────
// Client views their quotation
router.get('/my', clientAuth.authenticateClient, quotationController.getForClient);

// Client submits payment notification
router.post('/:id/pay',
  clientAuth.authenticateClient,
  [
    body('crypto_currency').isIn(['BTC', 'ETH']),
    body('message').optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  quotationController.submitPayment
);

module.exports = router;