// Holds the AI interview room's result between steps of the assessment flow.
// Violation screenshots are base64 and too large for sessionStorage, so they live in memory only;
// everything else is mirrored to sessionStorage so a page refresh doesn't lose the interview.
const memory = new Map();
const key = (interviewId) => `interview_avatar_${interviewId}`;

export const setAvatarResult = (interviewId, payload) => {
  memory.set(interviewId, payload);
  try {
    const { report, history, warningCounts, tabWarnings, elapsedSeconds, topic, difficulty, language } = payload;
    const { violationScreenshots, ...reportWithoutShots } = report || {};
    sessionStorage.setItem(
      key(interviewId),
      JSON.stringify({ report: reportWithoutShots, history, warningCounts, tabWarnings, elapsedSeconds, topic, difficulty, language })
    );
  } catch { /* storage unavailable or full */ }
};

export const getAvatarResult = (interviewId) => {
  if (memory.has(interviewId)) return memory.get(interviewId);
  try {
    return JSON.parse(sessionStorage.getItem(key(interviewId)) || 'null');
  } catch {
    return null;
  }
};

export const clearAvatarResult = (interviewId) => {
  memory.delete(interviewId);
  try { sessionStorage.removeItem(key(interviewId)); } catch { /* ignore */ }
};

export const totalWarnings = (warningCounts = {}) =>
  Object.values(warningCounts).reduce((n, c) => n + (Number(c) || 0), 0);
