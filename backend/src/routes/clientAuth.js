const router = require('express').Router();
const { body } = require('express-validator');
const clientAuthController = require('../controllers/clientAuthController');
const validate = require('../middleware/validate');

// Client login
router.post('/login',
  [
    body('username').trim().notEmpty(),
    body('password').notEmpty(),
  ],
  validate,
  clientAuthController.login
);

// Get client's own shipment info (requires client token)
router.get('/me', clientAuthController.authenticateClient, clientAuthController.me);

// Get client's shipment tracking details
router.get('/tracking', clientAuthController.authenticateClient, clientAuthController.tracking);

module.exports = router;