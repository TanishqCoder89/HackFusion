import express from 'express';
import { logEvent } from '../controllers/proctoringController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/event', authenticateToken, logEvent);

export default router;
