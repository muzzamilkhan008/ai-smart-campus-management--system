import { Router } from 'express';
import { getCourses, getSubjects, createCourse, createSubject, assignTeacherToSubject } from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/courses', authenticate, getCourses);
router.get('/subjects', authenticate, getSubjects);
router.post('/courses', authenticate, authorize(['ADMIN']), createCourse);
router.post('/subjects', authenticate, authorize(['ADMIN']), createSubject);
router.put('/subjects/:subjectId/assign-teacher', authenticate, authorize(['ADMIN']), assignTeacherToSubject);

export default router;
