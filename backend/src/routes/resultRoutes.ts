import { Router } from 'express';
import { getResults, createOrUpdateResult, calculateGPA, getStudentResultCard } from '../controllers/resultController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getResults);
router.post('/record', authenticate, authorize(['ADMIN', 'TEACHER']), createOrUpdateResult);
router.post('/calculate-gpa', authenticate, calculateGPA);
router.get('/result-card/:studentId?', authenticate, getStudentResultCard);

export default router;
