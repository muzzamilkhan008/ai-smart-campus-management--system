import { Router } from 'express';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getDepartments);
router.get('/:id', authenticate, getDepartmentById);
router.post('/', authenticate, authorize(['ADMIN']), createDepartment);
router.put('/:id', authenticate, authorize(['ADMIN']), updateDepartment);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteDepartment);

export default router;
