import jwt from 'jsonwebtoken';
import { getPool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hackfusion_super_secure_jwt_secret_key_2026_interview_platform';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing. Please sign in.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token. Please sign in again.'
      });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, role, name, email, phone, college, degree, graduation_year, company_name, designation, website, industry, size, profile_completion, skills, resume
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User account not found.'
      });
    }

    const user = rows[0];
    if (typeof user.skills === 'string') {
      try { user.skills = JSON.parse(user.skills); } catch { user.skills = []; }
    }
    if (typeof user.resume === 'string') {
      try { user.resume = JSON.parse(user.resume); } catch { user.resume = null; }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication error.'
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: [${roles.join(', ')}].`
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, role, name, email, phone, college, degree, graduation_year, company_name, designation, website, industry, size, profile_completion, skills, resume
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length > 0) {
      const user = rows[0];
      if (typeof user.skills === 'string') {
        try { user.skills = JSON.parse(user.skills); } catch { user.skills = []; }
      }
      if (typeof user.resume === 'string') {
        try { user.resume = JSON.parse(user.resume); } catch { user.resume = null; }
      }
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};
