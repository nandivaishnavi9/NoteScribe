const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const SALT_ROUNDS = 10;

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { fullName, studentId, password, confirmPassword } = req.body;

    // Basic validation
    if (!fullName || !studentId || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if student ID is already taken
    const [existing] = await db.query(
      'SELECT id FROM users WHERE student_id = ?',
      [studentId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'This Student ID is already registered.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.query(
      'INSERT INTO users (full_name, student_id, password) VALUES (?, ?, ?)',
      [fullName, studentId, hashedPassword]
    );

    // Auto-login after signup: create a token right away
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: result.insertId,
        fullName,
        studentId
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error during signup.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: 'Student ID and password are required.' });
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE student_id = ?',
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid Student ID or password.' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid Student ID or password.' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        studentId: user.student_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
}

module.exports = { signup, login };
