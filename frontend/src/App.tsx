import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';

import { LoginPage } from './pages/auth/LoginPage';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { TeacherManagement } from './pages/admin/TeacherManagement';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { AttendanceManagement } from './pages/admin/AttendanceManagement';
import { ExamManagement } from './pages/admin/ExamManagement';
import { ResultManagement } from './pages/admin/ResultManagement';
import { AssignmentManagement } from './pages/admin/AssignmentManagement';
import { FeeManagement } from './pages/admin/FeeManagement';
import { NoticeManagement } from './pages/admin/NoticeManagement';
import { EventManagement } from './pages/admin/EventManagement';
import { LibraryManagement } from './pages/admin/LibraryManagement';
import { ReportManagement } from './pages/admin/ReportManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { SettingsPage } from './pages/admin/SettingsPage';

// Teacher
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherAttendance } from './pages/teacher/TeacherAttendance';

// Student
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { OnlineExamPage } from './pages/student/OnlineExamPage';
import { GpaCalculatorPage } from './pages/student/GpaCalculatorPage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { TimetablePage } from './pages/student/TimetablePage';
import { StudentDocumentsPage } from './pages/student/StudentDocumentsPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { CampusAiPage } from './pages/student/CampusAiPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            user?.role === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : user?.role === 'TEACHER' ? (
              <Navigate to="/teacher/dashboard" replace />
            ) : (
              <Navigate to="/student/dashboard" replace />
            )
          }
        />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/students" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><StudentManagement /></ProtectedRoute>} />
        <Route path="admin/teachers" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><TeacherManagement /></ProtectedRoute>} />
        <Route path="admin/departments" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><DepartmentManagement /></ProtectedRoute>} />
        <Route path="admin/courses" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><CourseManagement /></ProtectedRoute>} />
        <Route path="admin/attendance" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AttendanceManagement /></ProtectedRoute>} />
        <Route path="admin/exams" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><ExamManagement /></ProtectedRoute>} />
        <Route path="admin/results" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><ResultManagement /></ProtectedRoute>} />
        <Route path="admin/assignments" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><AssignmentManagement /></ProtectedRoute>} />
        <Route path="admin/fees" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><FeeManagement /></ProtectedRoute>} />
        <Route path="admin/notices" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><NoticeManagement /></ProtectedRoute>} />
        <Route path="admin/events" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><EventManagement /></ProtectedRoute>} />
        <Route path="admin/library" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><LibraryManagement /></ProtectedRoute>} />
        <Route path="admin/documents" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><StudentDocumentsPage /></ProtectedRoute>} />
        <Route path="admin/reports" element={<ProtectedRoute roles={['ADMIN', 'STAFF']}><ReportManagement /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
        <Route path="admin/settings" element={<ProtectedRoute roles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />

        {/* Teacher Routes */}
        <Route path="teacher/dashboard" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="teacher/classes" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><CourseManagement /></ProtectedRoute>} />
        <Route path="teacher/attendance" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><TeacherAttendance /></ProtectedRoute>} />
        <Route path="teacher/assignments" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><AssignmentManagement /></ProtectedRoute>} />
        <Route path="teacher/exams" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><ExamManagement /></ProtectedRoute>} />
        <Route path="teacher/results" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><ResultManagement /></ProtectedRoute>} />
        <Route path="teacher/announcements" element={<ProtectedRoute roles={['TEACHER', 'ADMIN']}><NoticeManagement /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="student/profile" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
        <Route path="student/courses" element={<ProtectedRoute><StudentCoursesPage /></ProtectedRoute>} />
        <Route path="student/attendance" element={<ProtectedRoute><StudentAttendancePage /></ProtectedRoute>} />
        <Route path="student/assignments" element={<ProtectedRoute><StudentAssignmentsPage /></ProtectedRoute>} />
        <Route path="student/exams" element={<ProtectedRoute><OnlineExamPage /></ProtectedRoute>} />
        <Route path="student/results" element={<ProtectedRoute><GpaCalculatorPage /></ProtectedRoute>} />
        <Route path="student/fees" element={<ProtectedRoute><StudentFeesPage /></ProtectedRoute>} />
        <Route path="student/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
        <Route path="student/documents" element={<ProtectedRoute><StudentDocumentsPage /></ProtectedRoute>} />
        <Route path="student/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="student/campus-ai" element={<ProtectedRoute><CampusAiPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
