import { getPool } from '../config/db.js';
import { runTestCases, SUPPORTED_LANGUAGES } from '../services/codeRunner.js';
import { generateJson } from '../services/aiService.js';
import { completeStarterCodes } from '../services/problemTemplates.js';

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

// `includeHidden` is true only for the owning company; candidates never receive hidden test data
// or the reference solution.
const formatProblem = (row, { includeHidden = false } = {}) => {
  const testCases = parseJson(row.test_cases, []);
  const starterCodes = completeStarterCodes(parseJson(row.starter_codes, {}));
  if (row.starter_code && !parseJson(row.starter_codes, null)) starterCodes[row.language || 'cpp'] = row.starter_code;

  const problem = {
    id: row.id,
    title: row.title,
    difficulty: row.difficulty,
    language: row.language,
    topic: row.topic,
    source: row.source,
    createdBy: row.created_by,
    createdAt: row.created_at,
    description: row.description,
    examples: parseJson(row.examples, []),
    constraints: parseJson(row.constraints, []),
    timeLimitMinutes: row.time_limit_minutes,
    starterCode: starterCodes[row.language || 'cpp'],
    starterCodes,
    testCaseCount: testCases.length,
    testCases: includeHidden
      ? testCases
      : testCases.map((tc) =>
          tc.isPublic === false ? { id: tc.id, isPublic: false, input: null, expectedOutput: null } : tc
        )
  };
  if (includeHidden) problem.referenceSolution = row.reference_solution || '';
  return problem;
};

const canSeeHidden = (user, row) => user?.role === 'company' && (!row.created_by || row.created_by === user.id || row.source === 'seed');

const slugId = () => `prob-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const normalizeTestCases = (testCases = []) =>
  testCases
    .filter((tc) => tc && tc.input !== undefined && tc.expectedOutput !== undefined && String(tc.expectedOutput).trim() !== '')
    .map((tc, i) => ({
      id: tc.id || `tc-${i + 1}`,
      input: String(tc.input),
      expectedOutput: String(tc.expectedOutput).trim(),
      isPublic: tc.isPublic !== false
    }));

/** Run a reference solution (python) over raw inputs to compute trusted expected outputs. */
const computeExpectedOutputs = async (referenceSolution, inputs) => {
  const { compileError, results } = await runTestCases({
    language: 'python',
    code: referenceSolution,
    testCases: inputs.map((tc) => ({ input: tc.input, expectedOutput: '', isPublic: tc.isPublic }))
  });
  if (compileError) throw Object.assign(new Error(`Reference solution failed: ${compileError}`), { status: 422 });
  const cases = [];
  results.forEach((r, i) => {
    if (!r.error) cases.push({ input: inputs[i].input, expectedOutput: String(r.actual).trim(), isPublic: inputs[i].isPublic !== false });
  });
  return cases;
};

const validateAndBuild = async (body) => {
  const { title, difficulty = 'Medium', description, examples = [], constraints = [], language = 'cpp', timeLimitMinutes = 30 } = body;
  if (!title?.trim() || !description?.trim()) {
    throw Object.assign(new Error('Title and description are required.'), { status: 400 });
  }
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    throw Object.assign(new Error('Difficulty must be Easy, Medium or Hard.'), { status: 400 });
  }
  if (!SUPPORTED_LANGUAGES[language]) {
    throw Object.assign(new Error(`Language must be one of: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}.`), { status: 400 });
  }

  let testCases;
  if (body.referenceSolution?.trim() && Array.isArray(body.testInputs) && body.testInputs.length > 0) {
    testCases = await computeExpectedOutputs(body.referenceSolution, body.testInputs.map((t) => ({ input: String(t.input), isPublic: t.isPublic !== false })));
  } else {
    testCases = normalizeTestCases(body.testCases);
  }
  if (testCases.length === 0) {
    throw Object.assign(new Error('At least one valid test case (input + expected output) is required.'), { status: 400 });
  }
  testCases = testCases.map((tc, i) => ({ ...tc, id: `tc-${i + 1}` }));
  if (!testCases.some((tc) => tc.isPublic)) testCases[0].isPublic = true;

  return {
    title: title.trim(),
    difficulty,
    description: description.trim(),
    examples: Array.isArray(examples) ? examples : [],
    constraints: Array.isArray(constraints) ? constraints : String(constraints).split('\n').map((c) => c.trim()).filter(Boolean),
    language,
    timeLimitMinutes: Number(timeLimitMinutes) || 30,
    testCases,
    starterCodes: completeStarterCodes(body.starterCodes || (body.starterCode ? { [language]: body.starterCode } : {})),
    referenceSolution: body.referenceSolution || null,
    topic: body.topic || null
  };
};

export const getProblems = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM coding_problems ORDER BY created_at DESC, id');
    const list = rows.map((r) => formatProblem(r, { includeHidden: canSeeHidden(req.user, r) }));
    const problems = Object.fromEntries(list.map((p) => [p.id, p]));
    return res.json({ success: true, problems, list });
  } catch (error) {
    console.error('[GetProblems Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch coding problems.' });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM coding_problems WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Problem not found.' });
    return res.json({ success: true, problem: formatProblem(rows[0], { includeHidden: canSeeHidden(req.user, rows[0]) }) });
  } catch (error) {
    console.error('[GetProblemById Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch coding problem.' });
  }
};

export const createProblem = async (req, res) => {
  try {
    const p = await validateAndBuild(req.body);
    const id = slugId();
    const pool = getPool();
    await pool.query(
      `INSERT INTO coding_problems (id, title, difficulty, time_limit_minutes, language, description, examples, constraints,
         starter_code, starter_codes, test_cases, reference_solution, topic, source, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, p.title, p.difficulty, p.timeLimitMinutes, p.language, p.description,
        JSON.stringify(p.examples), JSON.stringify(p.constraints),
        p.starterCodes[p.language], JSON.stringify(p.starterCodes), JSON.stringify(p.testCases),
        p.referenceSolution, p.topic, req.body.source === 'ai' ? 'ai' : 'manual', req.user.id
      ]
    );
    const [rows] = await pool.query('SELECT * FROM coding_problems WHERE id = ?', [id]);
    return res.status(201).json({ success: true, message: 'Coding problem saved.', problem: formatProblem(rows[0], { includeHidden: true }) });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, error: error.message });
    console.error('[CreateProblem Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to save coding problem.' });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM coding_problems WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Problem not found.' });
    if (existing[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only edit problems you created.' });
    }
    const p = await validateAndBuild(req.body);
    await pool.query(
      `UPDATE coding_problems SET title = ?, difficulty = ?, time_limit_minutes = ?, language = ?, description = ?, examples = ?,
         constraints = ?, starter_code = ?, starter_codes = ?, test_cases = ?, reference_solution = ?, topic = ? WHERE id = ?`,
      [
        p.title, p.difficulty, p.timeLimitMinutes, p.language, p.description,
        JSON.stringify(p.examples), JSON.stringify(p.constraints),
        p.starterCodes[p.language], JSON.stringify(p.starterCodes), JSON.stringify(p.testCases),
        p.referenceSolution, p.topic, req.params.id
      ]
    );
    const [rows] = await pool.query('SELECT * FROM coding_problems WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Coding problem updated.', problem: formatProblem(rows[0], { includeHidden: true }) });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, error: error.message });
    console.error('[UpdateProblem Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to update coding problem.' });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const pool = getPool();
    const [existing] = await pool.query('SELECT created_by FROM coding_problems WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Problem not found.' });
    if (existing[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete problems you created.' });
    }
    const [used] = await pool.query('SELECT COUNT(*) AS c FROM interviews WHERE coding_problem_id = ?', [req.params.id]);
    if (used[0].c > 0) {
      return res.status(409).json({ success: false, error: `This problem is used by ${used[0].c} interview(s). Reassign them first.` });
    }
    await pool.query('DELETE FROM coding_problems WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Coding problem deleted.' });
  } catch (error) {
    console.error('[DeleteProblem Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete coding problem.' });
  }
};

const GENERATE_SYSTEM = `You are an expert competitive-programming problem setter creating coding-interview questions.
Respond with ONE JSON object only (no prose, no markdown fences) with exactly these keys:
{
  "title": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "topic": string,
  "description": string  // problem statement in markdown. MUST end with "**Input format**" and "**Output format**" sections describing the exact stdin/stdout format
  "examples": [{"input": string, "output": string, "explanation": string}],
  "constraints": [string],
  "starterCodes": {"cpp": string, "python": string, "javascript": string}, // full programs that read stdin and print stdout, with the solution body left as a TODO returning a placeholder
  "referenceSolution": string, // a CORRECT, efficient Python 3 program that reads the same stdin and prints the answer
  "testInputs": [{"input": string, "isPublic": boolean}] // 6-8 raw stdin inputs: 2-3 public (matching the examples), the rest hidden edge cases (empty/minimum, maximum-size-ish, duplicates, negatives where valid)
}
Rules: the answer for any input must be deterministic and uniquely defined, printed as a single line or a fixed format. Inputs must obey the constraints. Do NOT include expected outputs; they are computed by running referenceSolution.`;

export const generateProblem = async (req, res) => {
  try {
    const { topic, difficulty = 'Medium', hints = '', testCaseCount = 7 } = req.body;
    if (!topic?.trim()) return res.status(400).json({ success: false, error: 'A topic is required (e.g. "sliding window", "binary trees").' });
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Difficulty must be Easy, Medium or Hard.' });
    }

    const count = Math.min(12, Math.max(4, Number(testCaseCount) || 7));
    const draft = await generateJson(
      GENERATE_SYSTEM,
      `Create a ${difficulty} coding interview problem on: ${topic.trim()}.\n${hints ? `Extra guidance: ${String(hints).slice(0, 800)}\n` : ''}Provide about ${count} test inputs.`
    );

    if (!draft.referenceSolution || !Array.isArray(draft.testInputs) || draft.testInputs.length === 0) {
      return res.status(502).json({ success: false, error: 'AI returned an incomplete problem. Please try again.' });
    }

    const testCases = await computeExpectedOutputs(
      draft.referenceSolution,
      draft.testInputs.map((t) => ({ input: String(t.input), isPublic: t.isPublic !== false }))
    );
    if (testCases.length < 3) {
      return res.status(502).json({ success: false, error: 'The AI reference solution failed on most inputs, so no verified test cases could be produced. Please try again.' });
    }
    testCases.forEach((tc, i) => { tc.id = `tc-${i + 1}`; });
    if (!testCases.some((tc) => tc.isPublic)) testCases[0].isPublic = true;

    return res.json({
      success: true,
      message: `Generated "${draft.title}" with ${testCases.length} verified test cases. Review it, then save.`,
      draft: {
        title: draft.title,
        difficulty: ['Easy', 'Medium', 'Hard'].includes(draft.difficulty) ? draft.difficulty : difficulty,
        topic: draft.topic || topic,
        description: draft.description,
        examples: draft.examples || [],
        constraints: draft.constraints || [],
        starterCodes: completeStarterCodes(draft.starterCodes || {}),
        referenceSolution: draft.referenceSolution,
        testCases,
        language: 'cpp',
        timeLimitMinutes: difficulty === 'Hard' ? 45 : difficulty === 'Easy' ? 20 : 30,
        source: 'ai'
      }
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, error: error.message });
    console.error('[GenerateProblem Error]:', error);
    return res.status(502).json({ success: false, error: `AI generation failed: ${error.message}` });
  }
};

// Compute expected outputs for a company's draft from their own reference solution (preview before saving).
export const previewTestCases = async (req, res) => {
  try {
    const { referenceSolution, testInputs } = req.body;
    if (!referenceSolution?.trim() || !Array.isArray(testInputs) || testInputs.length === 0) {
      return res.status(400).json({ success: false, error: 'referenceSolution (Python) and testInputs are required.' });
    }
    const testCases = await computeExpectedOutputs(referenceSolution, testInputs.map((t) => ({ input: String(t.input), isPublic: t.isPublic !== false })));
    testCases.forEach((tc, i) => { tc.id = `tc-${i + 1}`; });
    return res.json({ success: true, testCases, skipped: testInputs.length - testCases.length });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, error: error.message });
    console.error('[PreviewTestCases Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to compute expected outputs.' });
  }
};

export const runCode = async (req, res) => {
  try {
    const { problemId, code, language = 'cpp', mode = 'run' } = req.body;
    if (!problemId || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, error: 'problemId and code are required.' });
    }
    if (code.length > 100000) return res.status(413).json({ success: false, error: 'Code is too large.' });

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM coding_problems WHERE id = ?', [problemId]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Problem not found.' });

    const allCases = parseJson(rows[0].test_cases, []);
    const cases = mode === 'submit' ? allCases : allCases.filter((tc) => tc.isPublic !== false);

    const { compileError, results } = await runTestCases({ language, code, testCases: cases });

    if (compileError) {
      return res.json({
        success: true,
        execution: { status: 'Compilation Error', compileError, passedCount: 0, totalCount: cases.length, score: 0, results: [] }
      });
    }

    // Hide hidden-case data from the candidate; they only see pass/fail.
    const safeResults = results.map((r) =>
      r.isPublic ? r : { ...r, input: null, expected: null, actual: r.passed ? null : r.error ? 'Runtime error / timeout' : null }
    );
    const passedCount = results.filter((r) => r.passed).length;
    const runtimes = results.map((r) => parseInt(r.runtime, 10) || 0);

    return res.json({
      success: true,
      execution: {
        status: passedCount === results.length ? 'Accepted' : results.some((r) => r.error) ? 'Runtime Error' : 'Wrong Answer',
        passedCount,
        totalCount: results.length,
        runtimeAvg: `${Math.round(runtimes.reduce((a, b) => a + b, 0) / (runtimes.length || 1))}ms`,
        score: results.length ? Math.round((passedCount / results.length) * 100) : 0,
        mode,
        results: safeResults
      }
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, error: error.message });
    console.error('[RunCode Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to execute test cases.' });
  }
};

// ---- Practice attempts (persisted, outside of any interview) ----
export const savePracticeAttempt = async (req, res) => {
  try {
    const { problemId, language = 'cpp', code, passedCount = 0, totalCount = 0, score = 0, status = 'Wrong Answer' } = req.body;
    if (!problemId) return res.status(400).json({ success: false, error: 'problemId is required.' });
    const pool = getPool();
    const id = `pa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await pool.query(
      `INSERT INTO practice_attempts (id, candidate_id, problem_id, language, code, passed_count, total_count, score, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, problemId, language, code || '', passedCount, totalCount, score, status]
    );
    return res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('[SavePracticeAttempt Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to save practice attempt.' });
  }
};

export const getPracticeAttempts = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT problem_id AS problemId, MAX(score) AS bestScore, COUNT(*) AS attempts, MAX(created_at) AS lastAttemptAt
       FROM practice_attempts WHERE candidate_id = ? GROUP BY problem_id`,
      [req.user.id]
    );
    return res.json({ success: true, attempts: rows });
  } catch (error) {
    console.error('[GetPracticeAttempts Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch practice attempts.' });
  }
};
