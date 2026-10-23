const jwt = require('jsonwebtoken');

// Verify JWT Bearer token in request header
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication token is required (Format: Bearer <token>)',
        statusCode: 401
      }
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'mealmate_default_dev_secret_key_2026';

  try {
    const decoded = jwt.verify(token, secret);
    // Attach decoded user info { id, name, email, role } to the request
    req.user = decoded;
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' 
      ? 'Authentication token has expired. Please log in again.' 
      : 'Invalid authentication token.';

    return res.status(401).json({
      success: false,
      error: {
        message,
        statusCode: 401
      }
    });
  }
}

// Role-based authorization guard (e.g. requireRole('admin') or requireRole('admin', 'student'))
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User authentication required',
          statusCode: 401
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`,
          statusCode: 403
        }
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole
};
