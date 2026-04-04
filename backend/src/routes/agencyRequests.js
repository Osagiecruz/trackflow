const router = require('express').Router();
const { body } = require('express-validator');
const agencyRequestController = require('../controllers/agencyRequestController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public: submit agency request
router.post('/',
  [
    body('agency_name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('country').optional().isISO31661Alpha2(),
    body('phone').optional().isString(),
    body('website').optional().isURL(),
    body('description').optional().isLength({ max: 1000 }),
  ],
  validate,
  agencyRequestController.submit
);

// Admin only: list all requests
router.get('/', authenticate, agencyRequestController.adminOnly, agencyRequestController.list);

// Admin only: approve a request
router.post('/:id/approve', authenticate, agencyRequestController.adminOnly, agencyRequestController.approve);

// Admin only: reject a request
router.post('/:id/reject', authenticate, agencyRequestController.adminOnly,
  [body('note').optional().isString()],
  validate,
  agencyRequestController.reject
);

module.exports = router;