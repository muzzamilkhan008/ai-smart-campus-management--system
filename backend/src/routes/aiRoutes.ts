import { Router } from 'express';
import { handleCampusAiQuery, getAiPerformanceAnalytics } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/chat', authenticate, handleCampusAiQuery);
router.get('/analytics/:studentId?', authenticate, getAiPerformanceAnalytics);

export default router;
