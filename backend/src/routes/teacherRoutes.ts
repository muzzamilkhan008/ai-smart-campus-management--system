import { Router } from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from '../controllers/teacherController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTeachers);
router.get('/:id', authenticate, getTeacherById);
router.post('/', authenticate, authorize(['ADMIN']), createTeacher);
router.put('/:id', authenticate, authorize(['ADMIN']), updateTeacher);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteTeacher);

export default router;
