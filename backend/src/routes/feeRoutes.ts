import { Router } from 'express';
import { getFees, createFeeInvoice, recordFeePayment } from '../controllers/feeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getFees);
router.post('/invoice', authenticate, authorize(['ADMIN', 'STAFF']), createFeeInvoice);
router.post('/:feeId/pay', authenticate, authorize(['ADMIN', 'STAFF', 'STUDENT']), recordFeePayment);

export default router;
