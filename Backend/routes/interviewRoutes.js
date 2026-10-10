import express from 'express';
import {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  generateQuestions
} from '../controllers/interviewController.js';
import { optionalAuth, authenticateToken, requireRole } from '../middleware/auth.js';
import { runLimiter } from '../middleware/security.js';

const router = express.Router();
const company = [authenticateToken, requireRole('company')];

router.get('/', optionalAuth, getInterviews);
router.post('/generate-questions', ...company, runLimiter, generateQuestions);
router.get('/:id', authenticateToken, getInterviewById);
router.post('/', ...company, createInterview);
router.put('/:id', ...company, updateInterview);
router.delete('/:id', ...company, deleteInterview);

export default router;
