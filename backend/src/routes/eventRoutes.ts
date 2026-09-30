import { Router } from 'express';
import { getEvents, createEvent, registerForEvent } from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getEvents);
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), createEvent);
router.post('/:eventId/register', authenticate, authorize(['STUDENT']), registerForEvent);

export default router;
