import { Router } from 'express';
import { getTimetable, createTimetableSlot, deleteTimetableSlot } from '../controllers/timetableController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTimetable);
router.post('/', authenticate, authorize(['ADMIN']), createTimetableSlot);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteTimetableSlot);

export default router;
