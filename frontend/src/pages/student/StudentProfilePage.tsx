import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, CalendarCheck, BookOpen, FileText, Award, DollarSign, FolderDown } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'courses' | 'assignments' | 'results' | 'fees'>('overview');

  useEffect(() => {
    if (user?.studentId) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const data = await apiFetch(`/students/${user?.studentId}`);
    setProfileData(data);
  };

  const student = profileData?.student;
  const summary = profileData?.summary;

  return (
    <div className="space-y-6">
      {/* Header Profile Info */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="" className="h-16 w-16 rounded-full border-2 border-blue-500 object-cover" />
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name}</h1>
            <p className="text-xs text-gray-500">Student ID: <span className="font-mono font-bold text-blue-600">{student?.studentIdCode || 'STU-2026-001'}</span> • {student?.department?.name}</p>
            <p className="text-xs text-gray-400">Guardian: {student?.guardianName || 'Robert Smith'} ({student?.guardianContact || '+1 555-900-1122'})</p>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex flex-wrap gap-2 border-t mt-6 pt-4 dark:border-slate-800 text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: GraduationCap },
            { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
            { id: 'courses', label: 'Enrolled Courses', icon: BookOpen },
            { id: 'assignments', label: 'Assignments', icon: FileText },
            { id: 'results', label: 'Results & GPA', icon: Award },
            { id: 'fees', label: 'Tuition Fees', icon: DollarSign },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition-all ${
                  activeTab === t.id ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-gray-400">Overall Attendance</p>
            <h3 className="text-2xl font-bold text-emerald-600">{summary?.attendancePct || 92.5}%</h3>
          </div>
          <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-gray-400">Cumulative GPA</p>
            <h3 className="text-2xl font-bold text-blue-600">{summary?.cgpa || '3.75'}</h3>
          </div>
          <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-gray-400">Total Pending Balance</p>
            <h3 className="text-2xl font-bold text-amber-500">${summary?.totalFeesPending || 0}</h3>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold mb-2">Class Attendance Logs</h3>
          <p className="text-xs text-gray-500">Your logged attendance history across enrolled courses.</p>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="rounded-2xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold mb-2">Enrolled Course Tracks</h3>
          <p className="text-xs text-gray-500">Official semester course enrollments.</p>
        </div>
      )}
    </div>
  );
};
