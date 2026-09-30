import { Router } from 'express';
import { getDocuments, createDocument } from '../controllers/documentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getDocuments);
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), createDocument);

export default router;
