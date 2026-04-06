const router = require('express').Router();
const { body } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public: get available plans + crypto addresses
router.get('/plans', subscriptionController.getPlans);

// Agency: get own subscription
router.get('/my', authenticate, subscriptionController.getMy);

// Agency: submit subscription payment
router.post('/pay',
  authenticate,
  [
    body('plan').isIn(['pro']),
    body('billing_cycle').isIn(['monthly', 'yearly']),
    body('crypto_currency').isIn(['BTC', 'ETH']),
    body('message').optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  subscriptionController.submitPayment
);

// Admin: list all subscription payments
router.get('/payments', authenticate, subscriptionController.adminOnly, subscriptionController.listPayments);

// Admin: confirm a subscription payment
router.post('/payments/:id/confirm', authenticate, subscriptionController.adminOnly, subscriptionController.confirmPayment);

// Admin: reject a subscription payment
router.post('/payments/:id/reject', authenticate, subscriptionController.adminOnly, subscriptionController.rejectPayment);

// Admin: update plan crypto addresses
router.put('/plans/:plan/addresses',
  authenticate,
  subscriptionController.adminOnly,
  [
    body('btc_address').optional().isString(),
    body('eth_address').optional().isString(),
  ],
  validate,
  subscriptionController.updatePlanAddresses
);

// Admin: manually set agency plan
router.post('/admin/set',
  authenticate,
  subscriptionController.adminOnly,
  [
    body('agency_id').isUUID(),
    body('plan').isIn(['starter', 'pro', 'enterprise']),
    body('billing_cycle').optional().isIn(['monthly', 'yearly']),
  ],
  validate,
  subscriptionController.adminSetPlan
);

module.exports = router;