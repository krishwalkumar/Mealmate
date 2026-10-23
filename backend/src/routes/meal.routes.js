const express = require('express');
const router = express.Router();
const { toggleMeal, getMyAttendance, getTodayStatus, getDailyAttendance } = require('../controllers/meal.controller');
const { validateMealToggle } = require('../middleware/validation.middleware');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// All meal routes require authentication
router.use(verifyToken);

// Student & Admin accessible endpoints
router.post('/toggle', validateMealToggle, toggleMeal);
router.get('/today', getTodayStatus);
router.get('/my-attendance', getMyAttendance);

// Admin-only endpoint: daily attendance summary across all students
router.get('/daily', requireRole('admin'), getDailyAttendance);

module.exports = router;

