import { Router } from 'express';
import { getConsolidatedReports } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'STAFF']), getConsolidatedReports);

export default router;
