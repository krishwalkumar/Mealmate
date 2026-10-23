const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Helper to generate signed JWT
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'mealmate_default_dev_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

// User Registration (Admin or Student)
async function register(req, res, next) {
  try {
    const { name, email, password, role, room_no, phone, plan_id } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const userRole = role === 'admin' ? 'admin' : 'student';

    // 1. Check if email is already registered using parameterized query
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'An account with this email address already exists',
          statusCode: 409
        }
      });
    }

    // 2. Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Insert user record into MySQL
    const [insertResult] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, room_no, phone, status, plan_id)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        cleanName,
        cleanEmail,
        passwordHash,
        userRole,
        room_no || null,
        phone || null,
        plan_id ? Number(plan_id) : null
      ]
    );

    const newUserId = insertResult.insertId;

    // 4. Generate JWT token
    const token = generateToken({
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      role: userRole
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: newUserId,
          name: cleanName,
          email: cleanEmail,
          role: userRole,
          room_no: room_no || null,
          phone: phone || null,
          plan_id: plan_id ? Number(plan_id) : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// User Login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Fetch user by email using parameterized query
    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash, role, status, room_no, phone, plan_id
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          statusCode: 401
        }
      });
    }

    const user = rows[0];

    // 2. Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Your account is inactive. Please contact the mess manager.',
          statusCode: 403
        }
      });
    }

    // 3. Verify password hash with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          statusCode: 401
        }
      });
    }

    // 4. Issue JWT
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          room_no: user.room_no,
          phone: user.phone,
          plan_id: user.plan_id
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get current authenticated user profile
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.room_no, u.phone, u.status, u.plan_id,
              p.plan_name, p.per_meal_rate, p.fixed_monthly_charge, u.created_at
       FROM users u
       LEFT JOIN mess_plans p ON u.plan_id = p.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User profile not found',
          statusCode: 404
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile
};

