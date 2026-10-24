const path = require('path');
const mysql = require('mysql2/promise');

// Load .env explicitly from backend root regardless of working directory
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Safe configuration check: reports only boolean presence, never the value
function isPasswordConfigured() {
  const pwd = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
  return Boolean(pwd && pwd.trim().length > 0 && pwd.trim() !== 'your_mysql_password_here');
}

// Create a connection pool to handle multiple queries efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT) || 3306,
  user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'mealmate_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test DB connectivity safely
async function checkDbConnection() {
  const passwordPresent = isPasswordConfigured();

  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 AS alive');
    connection.release();
    return {
      connected: true,
      message: 'Database connection successful',
      passwordConfigured: passwordPresent
    };
  } catch (error) {
    return {
      connected: false,
      message: error.message || 'Database connection failed',
      passwordConfigured: passwordPresent
    };
  }
}

module.exports = {
  pool,
  checkDbConnection,
  isPasswordConfigured
};
