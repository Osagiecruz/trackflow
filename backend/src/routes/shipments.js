const router = require('express').Router();
const { body, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const shipmentController = require('../controllers/shipmentController');
const validate = require('../middleware/validate');

router.use(authenticate);

// List shipments
router.get('/', [
  query('status').optional().isIn(['pending','in_transit','out_for_delivery','delivered','exception','returned']),
  query('carrier').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
], validate, shipmentController.list);

// Create shipment
router.post('/', [
  body('carrier').isIn(['dhl', 'fedex', 'ups', 'custom']),
  body('service').optional().isString(),
  body('origin_country').isISO31661Alpha2(),
  body('origin_city').isString().notEmpty(),
  body('origin_address').optional().isString(),
  body('destination_country').isISO31661Alpha2(),
  body('destination_city').isString().notEmpty(),
  body('destination_address').optional().isString(),
  body('destination_postal_code').optional().isString(),
  body('sender').isObject(),
  body('sender.name').isString().notEmpty(),
  body('sender.email').optional().isEmail(),
  body('sender.phone').optional().isString(),
  body('recipient').isObject(),
  body('recipient.name').isString().notEmpty(),
  body('recipient.email').optional().isEmail(),
  body('recipient.phone').optional().isString(),
  body('package').isObject(),
  body('package.weight').isNumeric(),
  body('package.description').optional().isString(),
  body('package.value').optional().isNumeric(),
  body('estimated_delivery').optional().isISO8601(),
  body('carrier_tracking_id').optional().isString(),
], validate, shipmentController.create);

// Get single shipment
router.get('/:id', shipmentController.getById);

// Update shipment
router.put('/:id', shipmentController.update);

// Delete shipment
router.delete('/:id', shipmentController.remove);

// Add tracking event manually
router.post('/:id/events', [
  body('status').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('location').optional().isString(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('occurred_at').optional().isISO8601(),
  body('facility').optional().isString(),
], validate, shipmentController.addEvent);

// Trigger notification
router.post('/:id/notify', shipmentController.sendNotification);

// Subscribe recipient to notifications
router.post('/:id/subscribe', [
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
], validate, shipmentController.subscribe);

// Bulk import
router.post('/bulk', shipmentController.bulkCreate);

module.exports = router;
