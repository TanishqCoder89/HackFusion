import { getPool } from '../config/db.js';
import { runTestCases } from '../services/codeRunner.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateAnswers, fromAvatarReport, avatarProctoringEvents } from '../services/evaluator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIOLATIONS_DIR = path.join(__dirname, '..', 'uploads', 'violations');

// Persist proctoring screenshots (base64 data URIs from the room) as files; returns their public paths.
const saveScreenshots = async (submissionId, shots = []) => {
  const saved = [];
  await fs.mkdir(VIOLATIONS_DIR, { recursive: true });
  for (const [i, shot] of shots.slice(0, 10).entries()) {
    const m = typeof shot === 'string' ? shot.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/) : null;
    if (!m) continue;
    const file = `${submissionId}-${i + 1}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
    await fs.writeFile(path.join(VIOLATIONS_DIR, file), Buffer.from(m[2], 'base64'));
    saved.push(`/uploads/violations/${file}`);
  }
  return saved;
};

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const formatSubmission = (s) => ({
  ...s,
  proctoringSummary: parseJson(s.proctoring_summary, {}),
  answers: parseJson(s.answers, []),
  codingSubmission: parseJson(s.coding_submission, null),
  evaluationReport: parseJson(s.evaluation_report, {}),
  interviewId: s.interview_id,
  interviewTitle: s.interview_title,
  jobId: s.job_id,
  jobTitle: s.job_title,
  candidateId: s.candidate_id,
  candidateName: s.candidate_name,
  candidateEmail: s.candidate_email,
  candidateCollege: s.candidate_college,
  submittedAt: s.submitted_at,
  timeSpentMinutes: s.time_spent_minutes
});

const loadOwned = async (pool, id, user) => {
  const [rows] = await pool.query(
    `SELECT s.*, i.company_id AS owner_company_id FROM submissions s
     LEFT JOIN interviews i ON i.id = s.interview_id WHERE s.id = ?`,
    [id]
  );
  if (rows.length === 0) return { status: 404, error: 'Submission record not found.' };
  const row = rows[0];
  const allowed = user.role === 'company' ? row.owner_company_id === user.id : row.candidate_id === user.id;
  if (!allowed) return { status: 403, error: 'You do not have access to this submission.' };
  return { row };
};

export const getSubmissions = async (req, res) => {
  try {
    const pool = getPool();
    let rows;
    if (req.user.role === 'company') {
      [rows] = await pool.query(
        `SELECT s.* FROM submissions s JOIN interviews i ON i.id = s.interview_id
         WHERE i.company_id = ? ORDER BY s.submitted_at DESC`,
        [req.user.id]
      );
    } else {
      [rows] = await pool.query('SELECT * FROM submissions WHERE candidate_id = ? ORDER BY submitted_at DESC', [req.user.id]);
    }
    return res.json({ success: true, submissions: rows.map(formatSubmission) });
  } catch (error) {
    console.error('[GetSubmissions Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch submissions.' });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const result = await loadOwned(getPool(), req.params.id, req.user);
    if (result.error) return res.status(result.status).json({ success: false, error: result.error });
    return res.json({ success: true, submission: formatSubmission(result.row) });
  } catch (error) {
    console.error('[GetSubmissionById Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch submission details.' });
  }
};

export const createSubmission = async (req, res) => {
  try {
    const { interviewId, timeSpentMinutes = 0, proctoringEvents = [], answers = {}, codingSubmission } = req.body;
    const avatar = req.body.avatar?.report ? req.body.avatar : null;
    const pool = getPool();

    const [interviews] = await pool.query('SELECT * FROM interviews WHERE id = ?', [interviewId]);
    if (interviews.length === 0) {
      return res.status(404).json({ success: false, error: 'Interview not found.' });
    }
    const interview = interviews[0];

    const [dupes] = await pool.query('SELECT id FROM submissions WHERE interview_id = ? AND candidate_id = ?', [interviewId, req.user.id]);
    if (dupes.length > 0) {
      return res.status(409).json({ success: false, error: 'You have already submitted this interview.', submissionId: dupes[0].id });
    }

    // ---- Interview answers ----
    const questions = parseJson(interview.questions, []);
    const evaluated = avatar ? fromAvatarReport(avatar) : await evaluateAnswers(questions, answers && typeof answers === 'object' ? answers : {});

    // ---- Coding: re-run on the server against ALL test cases (never trust client-reported results) ----
    let coding = null;
    let codeScore = 0;
    if (interview.coding_problem_id) {
      const [problems] = await pool.query('SELECT * FROM coding_problems WHERE id = ?', [interview.coding_problem_id]);
      const problem = problems[0];
      if (problem && codingSubmission?.code?.trim()) {
        const language = codingSubmission.language || problem.language || 'cpp';
        const run = await runTestCases({ language, code: codingSubmission.code, testCases: parseJson(problem.test_cases, []) });
        const total = run.results.length || parseJson(problem.test_cases, []).length;
        const passed = run.results.filter((r) => r.passed).length;
        codeScore = total ? Math.round((passed / total) * 100) : 0;
        coding = {
          problemId: problem.id,
          problemTitle: problem.title,
          language,
          code: codingSubmission.code,
          passedCount: passed,
          totalCount: total,
          score: codeScore,
          compileError: run.compileError || null
        };
      } else if (problem) {
        coding = { problemId: problem.id, problemTitle: problem.title, language: problem.language, code: '', passedCount: 0, totalCount: parseJson(problem.test_cases, []).length, score: 0 };
      }
    }

    // ---- Proctoring & rubric ----
    const disqualified = Boolean(avatar?.report?.isDisqualified);
    const events = avatar ? avatarProctoringEvents(avatar) : (Array.isArray(proctoringEvents) ? proctoringEvents : []);
    const strikes = events.length;
    const integrityScore = disqualified ? 0 : Math.max(0, 100 - strikes * 5);
    const rubric = parseJson(interview.scoring_rubric, {});
    const wTech = rubric.technicalKnowledgeWeight ?? 35;
    const wComm = rubric.communicationClarityWeight ?? 20;
    const wProb = rubric.problemSolvingWeight ?? 20;
    const wCode = interview.coding_problem_id ? rubric.codingCorrectnessWeight ?? 25 : 0;
    const totalWeight = wTech + wComm + wProb + wCode || 1;
    let overallScore = Math.round(
      (evaluated.technical * wTech + evaluated.communication * wComm + evaluated.problemSolving * wProb + codeScore * wCode) / totalWeight
    );
    if (integrityScore < 60) overallScore = Math.min(overallScore, 50);
    if (disqualified) overallScore = 0;

    const verdict = disqualified ? 'Disqualified' : overallScore >= 85 ? 'Strong Hire' : overallScore >= 70 ? 'Hire' : overallScore >= 50 ? 'Under Review' : 'No Hire';
    const answeredCount = evaluated.answers.filter((a) => a.score > 0).length;

    const report = {
      overallScore,
      verdict,
      scoringMethod: evaluated.method,
      rubricScores: {
        technicalKnowledge: evaluated.technical,
        communicationClarity: evaluated.communication,
        problemSolving: evaluated.problemSolving,
        codingCorrectness: codeScore,
        integrityScore
      },
      strengths: (avatar?.report?.strengths?.length ? avatar.report.strengths : [
        coding && codeScore === 100 ? 'All coding test cases passed' : null,
        answeredCount === questions.length && questions.length > 0 ? 'Answered every interview question' : null,
        strikes === 0 ? 'No proctoring violations recorded' : null
      ].filter(Boolean)),
      areasForGrowth: (avatar?.report?.improvements?.length ? avatar.report.improvements : [
        coding && codeScore < 100 ? `Coding solution passed ${coding.passedCount}/${coding.totalCount} test cases` : null,
        answeredCount < questions.length ? `${questions.length - answeredCount} question(s) left unanswered` : null,
        strikes > 0 ? `${strikes} proctoring violation(s) recorded` : null
      ].filter(Boolean)),
      recruiterNotes: '',
      status: 'Awaiting Recruiter Review'
    };
    if (avatar) report.generalTips = avatar.report.generalTips || [];

    const submissionId = `sub-${Date.now()}`;
    const screenshots = avatar ? await saveScreenshots(submissionId, avatar.violationScreenshots || avatar.report.violationScreenshots || []) : [];
    await pool.query(
      `INSERT INTO submissions (
        id, interview_id, interview_title, job_id, job_title, candidate_id,
        candidate_name, candidate_email, candidate_college, submitted_at, status,
        time_spent_minutes, proctoring_summary, answers, coding_submission, evaluation_report
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Evaluated', ?, ?, ?, ?, ?)`,
      [
        submissionId,
        interview.id,
        interview.title,
        interview.job_id,
        interview.job_title,
        req.user.id,
        req.user.name,
        req.user.email,
        req.user.college || null,
        Math.max(0, Math.round(Number(timeSpentMinutes) || 0)),
        JSON.stringify({ integrityScore, strikes, eventsCount: strikes, events, disqualified, screenshots, warningCounts: avatar?.warningCounts || null }),
        JSON.stringify(evaluated.answers),
        JSON.stringify(coding),
        JSON.stringify(report)
      ]
    );

    if (interview.job_id) {
      await pool.query(
        'UPDATE jobs SET applicants_count = (SELECT COUNT(DISTINCT candidate_id) FROM submissions WHERE job_id = ?) WHERE id = ?',
        [interview.job_id, interview.job_id]
      );
    }

    const [rows] = await pool.query('SELECT * FROM submissions WHERE id = ?', [submissionId]);
    return res.status(201).json({
      success: true,
      message: 'Assessment submitted and evaluated successfully.',
      submission: formatSubmission(rows[0])
    });
  } catch (error) {
    console.error('[CreateSubmission Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to record assessment submission.' });
  }
};

export const updateSubmissionReview = async (req, res) => {
  try {
    const { recruiterNotes, verdict } = req.body;
    const pool = getPool();
    const result = await loadOwned(pool, req.params.id, req.user);
    if (result.error) return res.status(result.status).json({ success: false, error: result.error });

    const current = formatSubmission(result.row);
    const updatedReport = {
      ...current.evaluationReport,
      recruiterNotes: recruiterNotes !== undefined ? recruiterNotes : current.evaluationReport?.recruiterNotes,
      verdict: verdict !== undefined ? verdict : current.evaluationReport?.verdict,
      status: 'Reviewed'
    };
    await pool.query(`UPDATE submissions SET status = 'Reviewed', evaluation_report = ? WHERE id = ?`, [JSON.stringify(updatedReport), req.params.id]);

    const [updatedRows] = await pool.query('SELECT * FROM submissions WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Candidate review verdict and notes saved.', submission: formatSubmission(updatedRows[0]) });
  } catch (error) {
    console.error('[UpdateSubmissionReview Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update candidate review.' });
  }
};
