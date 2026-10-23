const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to handle multiple queries efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mealmate_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test DB connectivity safely
async function checkDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 AS alive');
    connection.release();
    return { connected: true, message: 'Database connection successful' };
  } catch (error) {
    return {
      connected: false,
      message: error.message || 'Database connection failed'
    };
  }
}

module.exports = {
  pool,
  checkDbConnection
};
