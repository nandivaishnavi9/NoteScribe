const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool (better than a single connection for a real app)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get a Promise-based version so we can use async/await in controllers
const promisePool = pool.promise();

// Quick check on startup so errors show immediately instead of on first request
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ MySQL connected successfully');
  connection.release();
});

module.exports = promisePool;
