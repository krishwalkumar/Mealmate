require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const mealRoutes = require('./routes/meal.routes');
const planRoutes = require('./routes/plan.routes');
const paymentRoutes = require('./routes/payment.routes');
const expenseRoutes = require('./routes/expense.routes');
const adminRoutes = require('./routes/admin.routes');
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
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: '/api/auth (register, login, me)',
      meals: '/api/meals (toggle, today, my-attendance, daily)',
      plans: '/api/plans (get, create, update, delete)',
      payments: '/api/payments (my-payments, all, record, status)',
      expenses: '/api/expenses (all, create, delete, summary)',
      admin: '/api/admin (stats, students, update)'
    }
  });
});

// Mount Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);

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

