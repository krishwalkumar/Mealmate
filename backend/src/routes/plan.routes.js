const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan, deletePlan } = require('../controllers/plan.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Public or student viewing of plans
router.get('/', getPlans);

// Admin-only management routes
router.post('/', verifyToken, requireRole('admin'), createPlan);
router.put('/:id', verifyToken, requireRole('admin'), updatePlan);
router.delete('/:id', verifyToken, requireRole('admin'), deletePlan);

module.exports = router;

