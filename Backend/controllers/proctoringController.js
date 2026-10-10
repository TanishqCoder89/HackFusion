import { getPool } from '../config/db.js';

export const logEvent = async (req, res) => {
  try {
    const { interviewId, candidateId, eventType, details } = req.body;
    if (!interviewId || !eventType) {
      return res.status(400).json({ success: false, error: 'Interview ID and event type are required.' });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO proctoring_logs (interview_id, candidate_id, event_type, details)
       VALUES (?, ?, ?, ?)`,
      [interviewId, req.user.id, eventType, details || '']
    );

    return res.status(201).json({ success: true, message: 'Proctoring event logged.' });
  } catch (error) {
    console.error('[LogEvent Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to record proctoring log.' });
  }
};
