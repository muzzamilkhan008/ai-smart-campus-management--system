import { Router } from 'express';
import { getExams, getExamById, createExam, submitOnlineExam } from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getExams);
router.get('/:id', authenticate, getExamById);
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), createExam);
router.post('/:examId/submit', authenticate, authorize(['STUDENT']), submitOnlineExam);

export default router;
