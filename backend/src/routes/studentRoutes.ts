import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getStudents);
router.get('/:id', authenticate, getStudentById);
router.post('/', authenticate, authorize(['ADMIN', 'STAFF']), createStudent);
router.put('/:id', authenticate, authorize(['ADMIN', 'STAFF']), updateStudent);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteStudent);

export default router;
