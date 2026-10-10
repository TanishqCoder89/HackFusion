import { generateJson, isAiConfigured } from './aiService.js';

const wordCount = (text) => (String(text || '').trim().match(/\S+/g) || []).length;

// Length/engagement based provisional score, used only when no AI key is configured.
const heuristicScore = (answer) => {
  const words = wordCount(answer);
  if (words === 0) return 0;
  return Math.min(85, 30 + Math.round(words * 1.1));
};

/**
 * Scores each spoken/typed answer 0-100. Uses the configured AI model when available,
 * otherwise a clearly-labelled heuristic.
 * @returns {{ answers: Array, method: 'ai'|'heuristic', technical: number, communication: number, problemSolving: number }}
 */
export const evaluateAnswers = async (questions, answersById) => {
  const items = questions.map((q) => ({
    questionId: q.id,
    questionText: q.question,
    category: q.category,
    candidateAnswer: (answersById[q.id] || '').trim()
  }));

  const answered = items.filter((i) => i.candidateAnswer);

  if (isAiConfigured() && answered.length > 0) {
    try {
      const result = await generateJson(
        'You are a strict but fair technical interviewer scoring candidate answers. Respond with ONE JSON object only: {"scores":[{"questionId":string,"score":0-100,"feedback":string (max 25 words),"technical":0-100,"communication":0-100,"problemSolving":0-100}]}. Empty answers score 0.',
        `Score these interview answers:\n${JSON.stringify(items)}`
      );
      const byId = Object.fromEntries((result.scores || []).map((s) => [s.questionId, s]));
      const scored = items.map((i) => {
        const s = byId[i.questionId];
        return { ...i, score: s ? Math.round(s.score) : heuristicScore(i.candidateAnswer), feedback: s?.feedback || 'Evaluated automatically.', _s: s };
      });
      const avg = (key) => {
        const vals = scored.map((s) => (s._s ? Number(s._s[key]) : s.score)).filter((v) => !Number.isNaN(v));
        return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      };
      return {
        answers: scored.map(({ _s, ...rest }) => rest),
        method: 'ai',
        technical: avg('technical'),
        communication: avg('communication'),
        problemSolving: avg('problemSolving')
      };
    } catch (err) {
      console.warn('[Evaluator] AI scoring failed, using heuristic:', err.message);
    }
  }

  const scored = items.map((i) => ({
    ...i,
    candidateAnswer: i.candidateAnswer || '(No answer provided)',
    score: heuristicScore(i.candidateAnswer),
    feedback: i.candidateAnswer
      ? 'Provisional score based on answer completeness. Recruiter review recommended.'
      : 'No answer was recorded for this question.'
  }));
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length) : 0;
  return { answers: scored, method: 'heuristic', technical: avg, communication: avg, problemSolving: avg };
};

/** Maps the AI avatar interviewer's final report to the platform's answer/score structure. */
export const fromAvatarReport = (avatar) => {
  const report = avatar.report || {};
  const verbal = Number.isFinite(Number(report.verbalScore)) ? Number(report.verbalScore) : Number(report.overallScore) || 0;
  const breakdown = Array.isArray(report.breakdown) ? report.breakdown : [];
  return {
    answers: breakdown.map((b, i) => ({
      questionId: `q-${i + 1}`,
      questionText: b.question,
      candidateAnswer: b.answer || '(No response)',
      idealAnswer: b.idealAnswer || null,
      score: Math.round(Number(b.score) || 0),
      feedback: b.feedback || ''
    })),
    method: report.isMock ? 'ai-interviewer (offline question bank)' : 'ai-interviewer',
    technical: Math.round(verbal),
    communication: Math.round(verbal),
    problemSolving: Math.round(verbal)
  };
};

const WARNING_LABELS = {
  tab: 'Tab switch', focus: 'Window lost focus', fullscreen: 'Left fullscreen', clipboard: 'Clipboard / shortcut',
  camera: 'Camera blocked', monitor: 'Extra monitor', noface: 'Face not visible', multiface: 'Multiple faces',
  lookaway: 'Looked away', eyegaze: 'Eye gaze off-screen', audio: 'Suspicious audio', mobile_device: 'Mobile phone detected'
};

/** Flattens the room's per-category warning counters into proctoring events. */
export const avatarProctoringEvents = (avatar) => {
  const counts = avatar.warningCounts || {};
  const events = [];
  Object.entries(counts).forEach(([type, count]) => {
    for (let i = 0; i < (Number(count) || 0); i++) events.push({ type, label: WARNING_LABELS[type] || type, occurrence: i + 1 });
  });
  return events;
};
