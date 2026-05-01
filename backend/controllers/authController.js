const pool = require('../config/db');
const jwt  = require('jsonwebtoken');
require('dotenv').config();

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// DB schema: users (id, username, password_hash, role)
// "username" column stores the email address (e.g. admin@smartstore.com)
// Passwords are stored as plain text in password_hash column
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Query by username column (which holds the email)
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Plain-text password comparison (password_hash stores plain text for now)
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id:       user.id,
        username: user.username,
        role:     user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Set session for EJS views
    if (req.session) {
      req.session.user = {
        id:    user.id,
        email: user.username,
        role:  user.role,
      };
    }

    // Handle response based on request type
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
       return res.redirect('/dashboard');
    }

    res.json({
      token,
      user: {
        id:    user.id,
        email: user.username,   // expose as "email" so frontend stays consistent
        role:  user.role,
      },
    });

  } catch (err) {
    console.error('[authController] login:', err.message);
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
};

// ── GET /api/auth/login ────────────────────────────────────────────────────────
// Added securely per debug checklist to ensure non-crashing behaviour on GET
const getLogin = (req, res) => {
  res.render('login', { error: null });
};

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, getLogin, getMe };
