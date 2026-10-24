const express = require('express');
const router = express.Router();
const { getStats, getStudents, updateStudent } = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(verifyToken, requireRole('admin'));

router.get('/stats', getStats);
router.get('/students', getStudents);
router.put('/students/:id', updateStudent);

module.exports = router;

