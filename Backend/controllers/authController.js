import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hackfusion_super_secure_jwt_secret_key_2026_interview_platform';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const formatUser = (user) => {
  const formatted = { ...user };
  delete formatted.password_hash;
  if (typeof formatted.skills === 'string') {
    try { formatted.skills = JSON.parse(formatted.skills); } catch { formatted.skills = []; }
  }
  if (typeof formatted.resume === 'string') {
    try { formatted.resume = JSON.parse(formatted.resume); } catch { formatted.resume = null; }
  }
  formatted.companyName = formatted.company_name;
  formatted.graduationYear = formatted.graduation_year;
  formatted.profileCompletion = formatted.profile_completion;
  return formatted;
};

export const register = async (req, res) => {
  try {
    const {
      role = 'candidate',
      email,
      password,
      name,
      phone,
      college,
      degree,
      graduationYear,
      companyName,
      designation,
      website
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    if (!['candidate', 'company'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either candidate or company.'
      });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `${role}-${Date.now()}`;

    const defaultSkills = role === 'candidate' ? ['React', 'JavaScript', 'Problem Solving'] : [];
    const profileCompletion = role === 'candidate' ? 70 : 80;

    await pool.query(
      `INSERT INTO users (
        id, role, name, email, password_hash, phone, college, degree,
        graduation_year, company_name, designation, website, profile_completion, skills, resume
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        role,
        name.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        phone || null,
        college || null,
        degree || null,
        graduationYear || null,
        companyName || null,
        designation || null,
        website || null,
        profileCompletion,
        JSON.stringify(defaultSkills),
        null
      ]
    );

    const [createdRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = formatUser(createdRows[0]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during registration.'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const pool = getPool();
    let querySql = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';
    let queryParams = [email.trim()];

    if (role) {
      querySql += ' AND role = ?';
      queryParams.push(role);
    }

    const [rows] = await pool.query(querySql, queryParams);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials or matching role not found.'
      });
    }

    const dbUser = rows[0];
    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.'
      });
    }

    const user = formatUser(dbUser);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during authentication.'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: formatUser(req.user)
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile.'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    const pool = getPool();

    const allowedFields = [
      'name', 'phone', 'college', 'degree', 'graduation_year',
      'company_name', 'designation', 'website', 'industry', 'size',
      'profile_completion'
    ];

    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      const camelKey = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = updates[field] !== undefined ? updates[field] : updates[camelKey];
      if (value !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(value);
      }
    }

    if (updates.skills !== undefined) {
      setClauses.push('skills = ?');
      values.push(JSON.stringify(updates.skills));
    }

    if (setClauses.length === 0) {
      return res.json({ success: true, user: formatUser(req.user) });
    }

    values.push(userId);
    await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = formatUser(rows[0]);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('[UpdateProfile Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile.'
    });
  }
};
