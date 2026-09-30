import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, authorize(['ADMIN']), updateSettings);

export default router;
