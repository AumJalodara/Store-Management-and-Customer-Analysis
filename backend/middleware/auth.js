const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── Verify JWT token ─────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid or expired. Please log in again.' });
  }
};

// ── Admin only ───────────────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  });
};

// ── Admin or Manager ─────────────────────────────────────────────────────────
const requireManager = (req, res, next) => {
  requireAuth(req, res, () => {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Manager or Admin role required.' });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin, requireManager };
