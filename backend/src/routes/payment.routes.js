const express = require('express');
const router = express.Router();
const {
  getMyPayments,
  getAllPayments,
  recordPayment,
  updatePaymentStatus
} = require('../controllers/payment.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// All payment routes require authentication
router.use(verifyToken);

// Student route: view own payments
router.get('/my-payments', getMyPayments);

// Admin-only management routes
router.get('/', requireRole('admin'), getAllPayments);
router.post('/', requireRole('admin'), recordPayment);
router.put('/:id/status', requireRole('admin'), updatePaymentStatus);

module.exports = router;

