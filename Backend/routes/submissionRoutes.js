import express from 'express';
import {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmissionReview
} from '../controllers/submissionController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { runLimiter } from '../middleware/security.js';

const router = express.Router();

router.get('/', authenticateToken, getSubmissions);
router.get('/:id', authenticateToken, getSubmissionById);
router.post('/', authenticateToken, requireRole('candidate'), runLimiter, createSubmission);
router.put('/:id/review', authenticateToken, requireRole('company'), updateSubmissionReview);

export default router;
