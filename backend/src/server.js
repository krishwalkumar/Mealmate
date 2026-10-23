require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const healthRoutes = require('./routes/health.routes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'MealMate API Server is running',
    healthCheck: '/api/health'
  });
});

// Mount Routes
app.use('/api', healthRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`[MealMate Backend] Server listening on port ${PORT}`);
  console.log(`[MealMate Backend] Health endpoint: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[MealMate Backend] Shutting down gracefully...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('[MealMate Backend] MySQL connection pool closed.');
    } catch (err) {
      console.error('[MealMate Backend] Error closing pool:', err.message);
    }
    process.exit(0);
  });
});

module.exports = app;
