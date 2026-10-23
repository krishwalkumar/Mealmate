const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');
const { verifyToken } = require('../middleware/auth.middleware');

// Public Auth Endpoints
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected Auth Endpoints
router.get('/me', verifyToken, getProfile);

module.exports = router;
