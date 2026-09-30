import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

import authRoutes from '../src/routes/authRoutes';
import studentRoutes from '../src/routes/studentRoutes';
import teacherRoutes from '../src/routes/teacherRoutes';
import departmentRoutes from '../src/routes/departmentRoutes';
import courseRoutes from '../src/routes/courseRoutes';
import attendanceRoutes from '../src/routes/attendanceRoutes';
import examRoutes from '../src/routes/examRoutes';
import resultRoutes from '../src/routes/resultRoutes';
import assignmentRoutes from '../src/routes/assignmentRoutes';
import timetableRoutes from '../src/routes/timetableRoutes';
import feeRoutes from '../src/routes/feeRoutes';
import noticeRoutes from '../src/routes/noticeRoutes';
import eventRoutes from '../src/routes/eventRoutes';
import libraryRoutes from '../src/routes/libraryRoutes';
import documentRoutes from '../src/routes/documentRoutes';
import notificationRoutes from '../src/routes/notificationRoutes';
import aiRoutes from '../src/routes/aiRoutes';
import reportRoutes from '../src/routes/reportRoutes';
import settingRoutes from '../src/routes/settingRoutes';
import userRoutes from '../src/routes/userRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Smart Campus API is active and healthy.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api', userRoutes);

const TEST_PORT = 5098;

async function runFullWorkflowVerification() {
  console.log('🧪 Running AI Smart Campus Comprehensive End-to-End Workflow Test Suite...\n');

  const server = app.listen(TEST_PORT);
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failedCount++;
    }
  }

  async function request(method: string, path: string, body?: any, token?: string) {
    return new Promise<{ status: number; body: any }>((resolve) => {
      const payload = body ? JSON.stringify(body) : '';
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: TEST_PORT,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            let json = {};
            try {
              json = JSON.parse(data);
            } catch (e) {
              json = { text: data };
            }
            resolve({ status: res.statusCode || 500, body: json });
          });
        }
      );
      if (body) req.write(payload);
      req.end();
    });
  }

  try {
    // 1. Health Endpoint Verification
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'OK', 'GET /api/health endpoint active (Status: OK)');

    // 2. Admin Authentication
    const adminLogin = await request('POST', '/api/auth/login', {
      emailOrUsername: 'admin@campus.edu',
      password: 'admin123',
    });
    assert(adminLogin.status === 200 && !!adminLogin.body.token, 'ADMIN Login (admin@campus.edu) succeeds');
    const adminToken = adminLogin.body.token;

    // 3. Teacher Authentication
    const teacherLogin = await request('POST', '/api/auth/login', {
      emailOrUsername: 'teacher1@campus.edu',
      password: 'password123',
    });
    assert(teacherLogin.status === 200 && !!teacherLogin.body.token, 'TEACHER Login (teacher1@campus.edu) succeeds');
    const teacherToken = teacherLogin.body.token;

    // 4. Student Authentication
    const studentLogin = await request('POST', '/api/auth/login', {
      emailOrUsername: 'student1@campus.edu',
      password: 'password123',
    });
    assert(studentLogin.status === 200 && !!studentLogin.body.token, 'STUDENT Login (student1@campus.edu) succeeds');
    const studentToken = studentLogin.body.token;

    // 5. Security & RBAC Isolation Verification
    const rbacAccess = await request('GET', '/api/users', undefined, studentToken);
    assert(rbacAccess.status === 403, 'RBAC prevents student token from reaching Admin-only /api/users (403 Forbidden)');

    // 6. Admin Workflow: Create Department
    const randId = Math.floor(100 + Math.random() * 900);
    const deptCode = `DATA${randId}`;
    const createDept = await request('POST', '/api/departments', {
      code: deptCode,
      name: `Department of Data Science ${randId}`,
      description: 'Big Data Processing and Statistical Computing',
    }, adminToken);
    assert(createDept.status === 201 && createDept.body.department?.code === deptCode, `Admin Workflow: Created Department (${deptCode})`);
    const deptId = createDept.body.department?.id;

    // 7. Admin Workflow: Create Student
    const createStudent = await request('POST', '/api/students', {
      name: 'Michael Scott',
      email: `mscott${randId}@campus.edu`,
      phone: '+1 555-444-3322',
      departmentId: deptId,
      semester: 1,
    }, adminToken);
    assert(createStudent.status === 201 && !!createStudent.body.student?.id, 'Admin Workflow: Created Student record');
    const newStudentId = createStudent.body.student?.id;

    // Fetch a valid subject UUID
    const getSubjects = await request('GET', '/api/subjects', undefined, teacherToken);
    const validSubjectId = getSubjects.body.subjects?.[0]?.id;

    // 8. Teacher Workflow: Mark Class Attendance
    const markAtt = await request('POST', '/api/attendance/mark', {
      subjectId: validSubjectId,
      date: '2026-09-30',
      attendanceData: [
        { studentId: newStudentId, status: 'PRESENT' },
      ],
    }, teacherToken);
    assert(markAtt.status === 200 && markAtt.body.count > 0, 'Teacher Workflow: Marked class attendance for students');

    // 9. Teacher Workflow: Create Assignment
    const createAssignment = await request('POST', '/api/assignments', {
      title: `Python Lab Assignment ${randId}`,
      description: 'Implement binary trees and linked lists',
      subjectId: validSubjectId,
      deadline: '2026-10-15 23:59',
      totalMarks: 100,
    }, teacherToken);
    assert(createAssignment.status === 201 && !!createAssignment.body.assignment?.id, 'Teacher Workflow: Created Assignment');
    const assignmentId = createAssignment.body.assignment?.id;

    // 10. Student Workflow: Submit Assignment
    const submitAssignment = await request('POST', `/api/assignments/${assignmentId}/submit`, {
      submissionText: 'GitHub Submission: https://github.com/mscott/python-lab1',
    }, studentToken);
    assert(submitAssignment.status === 200 && submitAssignment.body.submission?.status === 'SUBMITTED', 'Student Workflow: Submitted assignment solution');

    // 11. Fee Billing & Payment Workflow
    const createFee = await request('POST', '/api/fees/invoice', {
      studentId: newStudentId,
      title: `Fall Registration Fee ${randId}`,
      amount: 1500,
      dueDate: '2026-10-30',
    }, adminToken);
    assert(createFee.status === 201 && !!createFee.body.fee?.id, 'Admin Workflow: Generated Fee Invoice');
    const feeId = createFee.body.fee?.id;

    const recordPay = await request('POST', `/api/fees/${feeId}/pay`, {
      amountPaid: 1500,
      paymentMethod: 'ONLINE',
    }, studentToken);
    assert(recordPay.status === 200 && recordPay.body.receipt?.receiptNumber, 'Student Workflow: Processed Fee Payment & Generated Receipt');

    // 12. CampusAI Contextual Database Query
    const aiResponse = await request('POST', '/api/ai/chat', {
      message: 'What is my attendance rate?',
    }, studentToken);
    assert(aiResponse.status === 200 && aiResponse.body.reply.includes('Attendance'), 'CampusAI Engine: Fetched factual attendance database response');

    // 13. Campus Consolidated Report Verification
    const reportData = await request('GET', '/api/reports', undefined, adminToken);
    assert(reportData.status === 200 && typeof reportData.body.summary.totalStudents === 'number', 'Consolidated Reports: Generated campus summary statistics');

  } catch (err: any) {
    console.error('Test execution exception:', err);
  } finally {
    server.close();
    console.log(`\n📊 E2E Workflow Verification Summary: ${passedCount} Passed, ${failedCount} Failed`);
    if (failedCount > 0) {
      process.exit(1);
    } else {
      console.log('🎉 All Full-Stack End-to-End Workflows PASSED Cleanly!\n');
      process.exit(0);
    }
  }
}

runFullWorkflowVerification();
