// 404 Not Found Middleware
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404
    }
  });
}

// Global Centralized Error Handling Middleware
function globalErrorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const response = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      statusCode
    }
  };

  // Only include stack trace if explicitly in development mode
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};

