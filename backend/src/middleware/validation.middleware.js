// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Date regex pattern (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Middleware to validate user registration payload
function validateRegister(req, res, next) {
  const { name, email, password, role, room_no, phone, plan_id } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }

  if (role && !['admin', 'student'].includes(role)) {
    errors.push('Role must be either "student" or "admin"');
  }

  if (room_no && typeof room_no !== 'string') {
    errors.push('room_no must be a string');
  }

  if (phone && typeof phone !== 'string') {
    errors.push('phone must be a string');
  }

  if (plan_id !== undefined && plan_id !== null && isNaN(Number(plan_id))) {
    errors.push('plan_id must be a valid numeric ID');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Registration validation failed',
        details: errors
      }
    });
  }

  next();
}

// Middleware to validate user login payload
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Login validation failed',
        details: errors
      }
    });
  }

  next();
}

// Middleware to validate meal attendance toggle payload
function validateMealToggle(req, res, next) {
  const { meal_date, meal_type, status, user_id, remarks } = req.body;
  const errors = [];

  if (!meal_date || !DATE_REGEX.test(meal_date)) {
    errors.push('meal_date is required in YYYY-MM-DD format');
  }

  const allowedMeals = ['breakfast', 'lunch', 'dinner'];
  if (!meal_type || !allowedMeals.includes(meal_type.toLowerCase())) {
    errors.push(`meal_type must be one of: ${allowedMeals.join(', ')}`);
  }

  if (status === undefined || status === null) {
    errors.push('status is required (1/true for ON, 0/false for OFF)');
  } else if (![0, 1, true, false].includes(status)) {
    errors.push('status must be 0, 1, true, or false');
  }

  if (user_id !== undefined && isNaN(Number(user_id))) {
    errors.push('user_id must be a numeric ID');
  }

  if (remarks && typeof remarks !== 'string') {
    errors.push('remarks must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Meal toggle validation failed',
        details: errors
      }
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateMealToggle
};

