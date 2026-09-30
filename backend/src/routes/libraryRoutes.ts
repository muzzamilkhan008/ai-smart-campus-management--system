import { Router } from 'express';
import { getBooks, createBook, issueBook, returnBook } from '../controllers/libraryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/books', authenticate, getBooks);
router.post('/books', authenticate, authorize(['ADMIN', 'STAFF']), createBook);
router.post('/issue', authenticate, authorize(['ADMIN', 'STAFF']), issueBook);
router.put('/issues/:issueId/return', authenticate, authorize(['ADMIN', 'STAFF']), returnBook);

export default router;
