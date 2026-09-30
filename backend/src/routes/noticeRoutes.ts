import { Router } from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotices);
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), createNotice);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteNotice);

export default router;
