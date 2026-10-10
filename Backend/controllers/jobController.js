import { getPool } from '../config/db.js';

const formatJob = (job) => {
  const formatted = { ...job };
  if (typeof formatted.responsibilities === 'string') {
    try { formatted.responsibilities = JSON.parse(formatted.responsibilities); } catch { formatted.responsibilities = []; }
  }
  if (typeof formatted.required_skills === 'string') {
    try { formatted.requiredSkills = JSON.parse(formatted.required_skills); } catch { formatted.requiredSkills = []; }
  } else if (Array.isArray(formatted.required_skills)) {
    formatted.requiredSkills = formatted.required_skills;
  }
  formatted.companyId = formatted.company_id;
  formatted.companyName = formatted.company_name;
  formatted.createdAt = formatted.created_at ? formatted.created_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  formatted.applicantsCount = formatted.applicants_count || 0;
  return formatted;
};

export const getJobs = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = req.user?.role === 'company'
      ? await pool.query('SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC', [req.user.id])
      : await pool.query("SELECT * FROM jobs WHERE status = 'Published' ORDER BY created_at DESC");
    const jobs = rows.map(formatJob);
    return res.json({ success: true, jobs });
  } catch (error) {
    console.error('[GetJobs Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch jobs.' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job posting not found.' });
    }

    return res.json({ success: true, job: formatJob(rows[0]) });
  } catch (error) {
    console.error('[GetJobById Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch job details.' });
  }
};

export const createJob = async (req, res) => {
  try {
    const {
      title,
      department = 'Engineering',
      location = 'Remote',
      type = 'Full-time',
      experience = '2+ years',
      description,
      responsibilities = [],
      requiredSkills = []
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Job title is required.' });
    }

    const companyId = req.user.id;
    const companyName = req.user.company_name || req.user.name;
    const jobId = `job-${Date.now()}`;

    const pool = getPool();
    await pool.query(
      `INSERT INTO jobs (id, company_id, company_name, title, department, location, type, experience, description, responsibilities, required_skills, status, applicants_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Published', 0)`,
      [
        jobId,
        companyId,
        companyName,
        title.trim(),
        department,
        location,
        type,
        experience,
        description || 'Role responsible for engineering scalable architectures.',
        JSON.stringify(responsibilities),
        JSON.stringify(requiredSkills)
      ]
    );

    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
    return res.status(201).json({
      success: true,
      message: 'Job posting created successfully.',
      job: formatJob(rows[0])
    });
  } catch (error) {
    console.error('[CreateJob Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to create job posting.' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, location, type, experience, description, responsibilities, requiredSkills, status } = req.body;
    const pool = getPool();

    const [existing] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found.' });
    }
    if (existing[0].company_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only edit your own job postings.' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (department !== undefined) { updates.push('department = ?'); values.push(department); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (experience !== undefined) { updates.push('experience = ?'); values.push(experience); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (responsibilities !== undefined) {
      updates.push('responsibilities = ?');
      values.push(JSON.stringify(responsibilities));
    }
    if (requiredSkills !== undefined) {
      updates.push('required_skills = ?');
      values.push(JSON.stringify(requiredSkills));
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Job updated successfully.', job: formatJob(rows[0]) });
  } catch (error) {
    console.error('[UpdateJob Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update job.' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM jobs WHERE id = ? AND company_id = ?', [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Job not found.' });
    }

    return res.json({ success: true, message: 'Job posting deleted successfully.' });
  } catch (error) {
    console.error('[DeleteJob Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete job.' });
  }
};
