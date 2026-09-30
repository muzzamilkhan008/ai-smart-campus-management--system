import { Router } from 'express';
import { getUsers, updateUserRoleStatus, getAuditLogs } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/users', authenticate, authorize(['ADMIN']), getUsers);
router.put('/users/:id/permissions', authenticate, authorize(['ADMIN']), updateUserRoleStatus);
router.get('/audit-logs', authenticate, authorize(['ADMIN']), getAuditLogs);

export default router;
