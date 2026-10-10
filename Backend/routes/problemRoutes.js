import express from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  generateProblem,
  previewTestCases,
  runCode,
  savePracticeAttempt,
  getPracticeAttempts
} from '../controllers/problemController.js';
import { optionalAuth, authenticateToken, requireRole } from '../middleware/auth.js';
import { runLimiter } from '../middleware/security.js';

const router = express.Router();
const company = [authenticateToken, requireRole('company')];

router.get('/', optionalAuth, getProblems);
router.get('/practice/attempts', authenticateToken, getPracticeAttempts);
router.post('/practice/attempts', authenticateToken, savePracticeAttempt);
router.post('/run', authenticateToken, runLimiter, runCode);
router.post('/generate', ...company, runLimiter, generateProblem);
router.post('/preview-tests', ...company, runLimiter, previewTestCases);
router.post('/', ...company, createProblem);
router.get('/:id', optionalAuth, getProblemById);
router.put('/:id', ...company, updateProblem);
router.delete('/:id', ...company, deleteProblem);

export default router;
