import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadResume,
  deleteResume,
  getAdaptiveQuestions
} from '../controllers/candidateController.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `resume-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX documents are allowed.'));
    }
  }
});

const router = express.Router();

router.get('/profile', authenticateToken, getCandidateProfile);
router.put('/profile', authenticateToken, updateCandidateProfile);
router.post('/resume', authenticateToken, upload.single('resume'), uploadResume);
router.delete('/resume', authenticateToken, deleteResume);
router.get('/adaptive-questions', authenticateToken, getAdaptiveQuestions);

export default router;
