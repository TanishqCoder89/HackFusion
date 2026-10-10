import { getPool } from '../config/db.js';
import { generateJson } from '../services/aiService.js';

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const formatInterview = (i) => ({
  ...i,
  supportedLanguages: parseJson(i.supported_languages, ['English']),
  requiredSkills: parseJson(i.required_skills, []),
  proctoringConfig: parseJson(i.proctoring_config, {}),
  scoringRubric: parseJson(i.scoring_rubric, {}),
  questions: parseJson(i.questions, []),
  jobId: i.job_id,
  jobTitle: i.job_title,
  companyId: i.company_id,
  companyName: i.company_name,
  durationMinutes: i.duration_minutes,
  scheduledDate: i.scheduled_date,
  codingProblemId: i.coding_problem_id
});

export const getInterviews = async (req, res) => {
  try {
    const pool = getPool();
    let rows;
    if (req.user?.role === 'company') {
      [rows] = await pool.query('SELECT * FROM interviews WHERE company_id = ? ORDER BY created_at DESC', [req.user.id]);
    } else {
      [rows] = await pool.query('SELECT * FROM interviews ORDER BY created_at DESC');
    }
    let interviews = rows.map(formatInterview);

    if (req.user?.role === 'candidate') {
      // Interview status is per candidate: "Completed" only if this candidate has submitted.
      const [subs] = await pool.query('SELECT interview_id FROM submissions WHERE candidate_id = ?', [req.user.id]);
      const done = new Set(subs.map((s) => s.interview_id));
      interviews = interviews.map((i) => ({ ...i, status: done.has(i.id) ? 'Completed' : 'Ready to Start' }));
    } else if (req.user?.role === 'company') {
      const [counts] = await pool.query('SELECT interview_id, COUNT(*) AS c FROM submissions GROUP BY interview_id');
      const byId = Object.fromEntries(counts.map((c) => [c.interview_id, c.c]));
      interviews = interviews.map((i) => ({ ...i, submissionsCount: byId[i.id] || 0 }));
    }

    return res.json({ success: true, interviews });
  } catch (error) {
    console.error('[GetInterviews Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch interviews.' });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM interviews WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Interview not found.' });
    }
    return res.json({ success: true, interview: formatInterview(rows[0]) });
  } catch (error) {
    console.error('[GetInterviewById Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch interview details.' });
  }
};

export const createInterview = async (req, res) => {
  try {
    const {
      jobId,
      title,
      description,
      durationMinutes = 45,
      language = 'English',
      supportedLanguages = ['English'],
      scheduledDate,
      requiredSkills,
      proctoringConfig,
      scoringRubric,
      codingProblemId,
      questions = []
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, error: 'Interview title is required.' });
    }

    const pool = getPool();

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ? AND company_id = ?', [jobId, req.user.id]);
    if (jobs.length === 0) {
      return res.status(400).json({ success: false, error: 'Select one of your job postings for this interview.' });
    }
    const job = jobs[0];

    if (codingProblemId) {
      const [problems] = await pool.query('SELECT id FROM coding_problems WHERE id = ?', [codingProblemId]);
      if (problems.length === 0) {
        return res.status(400).json({ success: false, error: 'Selected coding problem does not exist.' });
      }
    }

    const cleanQuestions = (Array.isArray(questions) ? questions : [])
      .filter((q) => q?.question?.trim())
      .map((q, i) => ({ id: q.id || `q-${Date.now()}-${i + 1}`, category: q.category || 'General', question: q.question.trim() }));

    const interviewId = `int-${Date.now()}`;
    await pool.query(
      `INSERT INTO interviews (
        id, job_id, job_title, company_id, company_name, title, description,
        duration_minutes, language, supported_languages, scheduled_date, status,
        required_skills, proctoring_config, scoring_rubric, coding_problem_id, questions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ready to Start', ?, ?, ?, ?, ?)`,
      [
        interviewId,
        job.id,
        job.title,
        req.user.id,
        req.user.company_name || job.company_name,
        title.trim(),
        description || 'Technical and behavioral evaluation.',
        Number(durationMinutes) || 45,
        language,
        JSON.stringify(supportedLanguages),
        scheduledDate || new Date().toISOString(),
        JSON.stringify(requiredSkills || parseJson(job.required_skills, [])),
        JSON.stringify(
          proctoringConfig || {
            fullScreenLock: true,
            tabFocusTracking: true,
            webcamGazeMonitoring: true,
            audioNoiseAnalysis: true,
            maxGeneralStrikes: 5
          }
        ),
        JSON.stringify(
          scoringRubric || {
            technicalKnowledgeWeight: 35,
            communicationClarityWeight: 20,
            problemSolvingWeight: 20,
            codingCorrectnessWeight: 25
          }
        ),
        codingProblemId || null,
        JSON.stringify(cleanQuestions)
      ]
    );

    const [rows] = await pool.query('SELECT * FROM interviews WHERE id = ?', [interviewId]);
    return res.status(201).json({
      success: true,
      message: 'Interview session created successfully.',
      interview: formatInterview(rows[0])
    });
  } catch (error) {
    console.error('[CreateInterview Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to create interview session.' });
  }
};

export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, scheduledDate } = req.body;
    const pool = getPool();

    const [existing] = await pool.query('SELECT company_id FROM interviews WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Interview not found.' });
    if (existing[0].company_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only modify your own interviews.' });
    }

    const updates = [];
    const values = [];
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (scheduledDate !== undefined) { updates.push('scheduled_date = ?'); values.push(scheduledDate); }
    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE interviews SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const [rows] = await pool.query('SELECT * FROM interviews WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Interview updated.', interview: formatInterview(rows[0]) });
  } catch (error) {
    console.error('[UpdateInterview Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update interview.' });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT company_id FROM interviews WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Interview not found.' });
    if (existing[0].company_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own interviews.' });
    }
    const [subs] = await pool.query('SELECT COUNT(*) AS c FROM submissions WHERE interview_id = ?', [req.params.id]);
    if (subs[0].c > 0) {
      return res.status(409).json({ success: false, error: 'This interview already has candidate submissions and cannot be deleted.' });
    }
    await pool.query('DELETE FROM interviews WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Interview deleted.' });
  } catch (error) {
    console.error('[DeleteInterview Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete interview.' });
  }
};

export const generateQuestions = async (req, res) => {
  try {
    const { jobTitle, skills = [], count = 5, difficulty = 'Medium' } = req.body;
    if (!jobTitle?.trim()) return res.status(400).json({ success: false, error: 'jobTitle is required.' });
    const n = Math.min(10, Math.max(1, Number(count) || 5));
    const result = await generateJson(
      'You write spoken technical-interview questions. Respond with ONE JSON object only: {"questions":[{"category":string,"question":string}]}. Questions must be open-ended, answerable verbally in 1-2 minutes, and specific to the role and skills.',
      `Role: ${jobTitle}\nSkills: ${(Array.isArray(skills) ? skills : []).join(', ') || 'general software engineering'}\nDifficulty: ${difficulty}\nWrite ${n} questions.`
    );
    const questions = (result.questions || [])
      .filter((q) => q?.question)
      .slice(0, n)
      .map((q, i) => ({ id: `q-${Date.now()}-${i + 1}`, category: q.category || 'Technical', question: q.question }));
    if (questions.length === 0) return res.status(502).json({ success: false, error: 'AI returned no usable questions. Try again.' });
    return res.json({ success: true, questions });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, error: error.message });
    console.error('[GenerateQuestions Error]:', error);
    return res.status(502).json({ success: false, error: `AI generation failed: ${error.message}` });
  }
};
