import express from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob } from '../controllers/jobController.js';
import { optionalAuth, authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const company = [authenticateToken, requireRole('company')];

router.get('/', optionalAuth, getJobs);
router.get('/:id', getJobById);
router.post('/', ...company, createJob);
router.put('/:id', ...company, updateJob);
router.delete('/:id', ...company, deleteJob);

export default router;
