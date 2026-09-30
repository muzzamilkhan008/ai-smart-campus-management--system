import { Router } from 'express';
import { getAssignments, createAssignment, submitAssignment, gradeSubmission } from '../controllers/assignmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAssignments);
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), createAssignment);
router.post('/:assignmentId/submit', authenticate, authorize(['STUDENT']), submitAssignment);
router.put('/submissions/:submissionId/grade', authenticate, authorize(['ADMIN', 'TEACHER']), gradeSubmission);

export default router;
