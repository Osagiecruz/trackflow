const router = require('express').Router();
const trackController = require('../controllers/trackController');

// Public: track by ID
router.get('/:trackingId', trackController.track);

// Public: get all events for a shipment
router.get('/:trackingId/events', trackController.events);

// Public: subscribe to notifications
router.post('/:trackingId/subscribe', trackController.subscribe);

module.exports = router;
