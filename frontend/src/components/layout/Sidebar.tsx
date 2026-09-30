import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileCheck,
  Award,
  FileText,
  DollarSign,
  Megaphone,
  Calendar,
  Library,
  FolderDown,
  BarChart3,
  UserCheck,
  Settings,
  Bot,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavLinkItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const adminLinks: NavLinkItem[] = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/teachers', label: 'Teachers', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/courses', label: 'Courses & Subjects', icon: BookOpen },
    { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/admin/exams', label: 'Exams', icon: FileCheck },
    { to: '/admin/results', label: 'Results & GPA', icon: Award },
    { to: '/admin/assignments', label: 'Assignments', icon: FileText },
    { to: '/admin/fees', label: 'Fee Management', icon: DollarSign },
    { to: '/admin/notices', label: 'Notices', icon: Megaphone },
    { to: '/admin/events', label: 'Campus Events', icon: Calendar },
    { to: '/admin/library', label: 'Library', icon: Library },
    { to: '/admin/documents', label: 'Documents', icon: FolderDown },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/users', label: 'User Roles & Audits', icon: UserCheck },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const teacherLinks: NavLinkItem[] = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/classes', label: 'Assigned Classes', icon: BookOpen },
    { to: '/teacher/attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { to: '/teacher/assignments', label: 'Assignments', icon: FileText },
    { to: '/teacher/exams', label: 'Exams & Marks', icon: FileCheck },
    { to: '/teacher/results', label: 'Results Entry', icon: Award },
    { to: '/teacher/announcements', label: 'Announcements', icon: Megaphone },
  ];

  const studentLinks: NavLinkItem[] = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/campus-ai', label: 'CampusAI Assistant', icon: Bot, badge: 'AI' },
    { to: '/student/profile', label: 'My Student Profile', icon: GraduationCap },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/student/assignments', label: 'Assignments', icon: FileText },
    { to: '/student/exams', label: 'Exams & Tests', icon: FileCheck },
    { to: '/student/results', label: 'Results & GPA Calc', icon: Award },
    { to: '/student/fees', label: 'Tuition Fees', icon: DollarSign },
    { to: '/student/timetable', label: 'Weekly Timetable', icon: Clock },
    { to: '/student/documents', label: 'Documents & Receipts', icon: FolderDown },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'TEACHER' ? teacherLinks : studentLinks;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400">
            <Sparkles className="h-5 w-5" />
            <span>AI Smart Campus</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Navigation ({role})
          </p>
        </div>

        <nav className="space-y-1 px-3 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
