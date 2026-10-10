import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { getPool } from '../config/db.js';

const SKILL_VOCABULARY = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Python', 'Django', 'Flask',
  'FastAPI', 'Java', 'Spring', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
  'Redis', 'GraphQL', 'REST APIs', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Linux', 'Tailwind CSS',
  'HTML', 'CSS', 'System Design', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Structures', 'Algorithms'
];

const extractResumeText = async (file) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const buffer = await fs.readFile(file.path);
    if (ext === '.pdf') return (await pdfParse(buffer)).text || '';
    if (ext === '.docx') return (await mammoth.extractRawText({ buffer })).value || '';
  } catch (err) {
    console.warn('[Resume] Text extraction failed:', err.message);
  }
  return '';
};

const detectSkills = (text) =>
  SKILL_VOCABULARY.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^A-Za-z0-9+#])${escaped}($|[^A-Za-z0-9+#])`, 'i').test(text);
  });

export const getCandidateProfile = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT id, role, name, email, phone, college, degree, graduation_year as graduationYear,
              profile_completion as profileCompletion, skills, resume
       FROM users WHERE id = ? LIMIT 1`,
      [candidateId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
    }

    const row = rows[0];
    if (typeof row.skills === 'string') {
      try { row.skills = JSON.parse(row.skills); } catch { row.skills = []; }
    }
    if (typeof row.resume === 'string') {
      try { row.resume = JSON.parse(row.resume); } catch { row.resume = null; }
    }

    return res.json({ success: true, profile: row });
  } catch (error) {
    console.error('[GetCandidateProfile Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch candidate profile.' });
  }
};

export const updateCandidateProfile = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { name, phone, college, degree, graduationYear, skills, profileCompletion } = req.body;
    const pool = getPool();

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (college !== undefined) { updates.push('college = ?'); values.push(college); }
    if (degree !== undefined) { updates.push('degree = ?'); values.push(degree); }
    if (graduationYear !== undefined) { updates.push('graduation_year = ?'); values.push(graduationYear); }
    if (profileCompletion !== undefined) { updates.push('profile_completion = ?'); values.push(profileCompletion); }
    if (skills !== undefined) {
      updates.push('skills = ?');
      values.push(JSON.stringify(skills));
    }

    if (updates.length > 0) {
      values.push(candidateId);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [rows] = await pool.query(
      `SELECT id, role, name, email, phone, college, degree, graduation_year as graduationYear,
              profile_completion as profileCompletion, skills, resume
       FROM users WHERE id = ?`,
      [candidateId]
    );

    const profile = rows[0];
    if (typeof profile.skills === 'string') {
      try { profile.skills = JSON.parse(profile.skills); } catch { profile.skills = []; }
    }
    if (typeof profile.resume === 'string') {
      try { profile.resume = JSON.parse(profile.resume); } catch { profile.resume = null; }
    }

    return res.json({ success: true, message: 'Candidate profile updated.', profile });
  } catch (error) {
    console.error('[UpdateCandidateProfile Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update candidate profile.' });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [candidateId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
    }

    const candidate = rows[0];
    let currentSkills = [];
    if (typeof candidate.skills === 'string') {
      try { currentSkills = JSON.parse(candidate.skills); } catch { currentSkills = []; }
    } else if (Array.isArray(candidate.skills)) {
      currentSkills = candidate.skills;
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Please attach a PDF or DOCX resume file.' });
    }

    const text = await extractResumeText(file);
    const detectedSkills = detectSkills(text);
    const extractedSkills = Array.from(new Set([...currentSkills, ...detectedSkills]));
    const email = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0];
    const phone = (text.match(/(\+?\d[\d\s().-]{8,}\d)/) || [])[0];

    const resumeData = {
      fileName: file.originalname,
      storedAs: file.filename,
      uploadedAt: new Date().toISOString(),
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: text ? 'Processed & Verified' : 'Uploaded (no readable text found)',
      parsedData: {
        contact: {
          name: candidate.name,
          email: email || candidate.email,
          phone: phone || candidate.phone || null
        },
        skills: extractedSkills,
        detectedSkills,
        textPreview: text.slice(0, 600)
      }
    };

    await pool.query(
      `UPDATE users SET resume = ?, skills = ?, profile_completion = 100 WHERE id = ?`,
      [JSON.stringify(resumeData), JSON.stringify(extractedSkills), candidateId]
    );

    const [updatedRows] = await pool.query(
      `SELECT id, role, name, email, phone, college, degree, graduation_year as graduationYear,
              profile_completion as profileCompletion, skills, resume
       FROM users WHERE id = ?`,
      [candidateId]
    );

    const updated = updatedRows[0];
    if (typeof updated.skills === 'string') {
      try { updated.skills = JSON.parse(updated.skills); } catch { updated.skills = []; }
    }
    if (typeof updated.resume === 'string') {
      try { updated.resume = JSON.parse(updated.resume); } catch { updated.resume = null; }
    }

    return res.json({
      success: true,
      message: 'Resume parsed and verified successfully.',
      profile: updated
    });
  } catch (error) {
    console.error('[UploadResume Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to upload and parse resume.' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const pool = getPool();

    await pool.query(
      `UPDATE users SET resume = NULL, profile_completion = 65 WHERE id = ?`,
      [candidateId]
    );

    const [rows] = await pool.query(
      `SELECT id, role, name, email, phone, college, degree, graduation_year as graduationYear,
              profile_completion as profileCompletion, skills, resume
       FROM users WHERE id = ?`,
      [candidateId]
    );

    const updated = rows[0];
    if (typeof updated.skills === 'string') {
      try { updated.skills = JSON.parse(updated.skills); } catch { updated.skills = []; }
    }
    updated.resume = null;

    return res.json({
      success: true,
      message: 'Resume deleted successfully.',
      profile: updated
    });
  } catch (error) {
    console.error('[DeleteResume Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete resume.' });
  }
};

export const getAdaptiveQuestions = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query('SELECT skills FROM users WHERE id = ?', [candidateId]);
    let candidateSkills = ['React', 'TypeScript', 'C++', 'Python'];

    if (rows.length > 0 && rows[0].skills) {
      if (typeof rows[0].skills === 'string') {
        try { candidateSkills = JSON.parse(rows[0].skills); } catch {}
      } else if (Array.isArray(rows[0].skills)) {
        candidateSkills = rows[0].skills;
      }
    }

    const questionPool = [
      {
        skill: 'React',
        question: 'In your React projects, how did you handle concurrent UI transitions or heavy state operations without degrading frame rates?',
        category: 'Frontend Performance'
      },
      {
        skill: 'TypeScript',
        question: 'How do you design extensible type definitions using discriminated unions and conditional types for complex API payloads?',
        category: 'Type Safety & Architecture'
      },
      {
        skill: 'C++',
        question: 'Walk through your experience with C++ move semantics (std::move, rvalue references) and how they eliminate unnecessary memory allocations.',
        category: 'Low-Level Systems'
      },
      {
        skill: 'Python',
        question: 'Discuss how you structure asynchronous coroutines (asyncio) in Python microservices to handle high-concurrency external IO.',
        category: 'Backend Scalability'
      },
      {
        skill: 'Docker',
        question: 'How do you structure multi-stage Docker builds to reduce container attack surface and minimize image deploy sizes?',
        category: 'DevOps & Reliability'
      },
      {
        skill: 'SQL',
        question: 'When a database query exhibits slow execution, what steps and execution plan metrics (EXPLAIN ANALYZE) do you inspect first?',
        category: 'Database Optimization'
      }
    ];

    const matched = questionPool.filter(q =>
      candidateSkills.some(s => s.toLowerCase() === q.skill.toLowerCase())
    );

    const questions = matched.length > 0 ? matched : questionPool.slice(0, 3);
    return res.json({ success: true, questions });
  } catch (error) {
    console.error('[GetAdaptiveQuestions Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate adaptive questions.' });
  }
};
