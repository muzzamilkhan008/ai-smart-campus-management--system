import { Router } from 'express';
import { getAttendance, markAttendance, getStudentAttendanceAnalytics, getCampusAttendanceAnalytics } from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAttendance);
router.post('/mark', authenticate, authorize(['ADMIN', 'TEACHER']), markAttendance);
router.get('/student/:studentId?', authenticate, getStudentAttendanceAnalytics);
router.get('/campus-analytics', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), getCampusAttendanceAnalytics);

export default router;
