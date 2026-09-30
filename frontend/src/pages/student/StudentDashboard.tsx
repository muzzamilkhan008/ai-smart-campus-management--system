import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarCheck, Award, FileText, Bot, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.studentId) {
      fetchStudentProfile();
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      const data = await apiFetch(`/students/${user?.studentId}`);
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const summary = profile?.summary || {};

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Student Academic Portal
            </span>
            <h1 className="mt-2 text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="mt-1 text-xs text-blue-100">
              Department of {profile?.student?.department?.name || 'Computer Science'} • Semester {profile?.student?.semester || 1}
            </p>
          </div>
          <button
            onClick={() => navigate('/student/campus-ai')}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-bold text-blue-600 shadow hover:bg-blue-50 transition-all"
          >
            <Bot className="h-5 w-5 text-blue-600 animate-bounce" /> Open CampusAI Assistant
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Attendance Rate" value={`${summary.attendancePct || 92.5}%`} subtext="Required threshold 75%" icon={CalendarCheck} color="emerald" />
        <StatCard title="Current CGPA" value={`${summary.cgpa || '3.75'}`} subtext="Cumulative Grade Average" icon={Award} color="blue" />
        <StatCard title="Enrolled Courses" value={`${summary.totalEnrolledCourses || 4}`} subtext="Active Spring 2026" icon={FileText} color="indigo" />
        <StatCard title="Pending Fees" value={`$${summary.totalFeesPending || 0}`} subtext="Tuition balance due" icon={DollarSign} color="amber" />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div onClick={() => navigate('/student/exams')} className="cursor-pointer rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
            Online Exams <ArrowRight className="h-4 w-4 text-blue-600" />
          </h3>
          <p className="text-xs text-gray-500 mt-1">Take online MCQ practice tests & view scheduled hall exams.</p>
        </div>

        <div onClick={() => navigate('/student/results')} className="cursor-pointer rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
            Results & GPA Calculator <ArrowRight className="h-4 w-4 text-blue-600" />
          </h3>
          <p className="text-xs text-gray-500 mt-1">Simulate your semester GPA & view digital result cards.</p>
        </div>

        <div onClick={() => navigate('/student/timetable')} className="cursor-pointer rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
            Weekly Class Schedule <ArrowRight className="h-4 w-4 text-blue-600" />
          </h3>
          <p className="text-xs text-gray-500 mt-1">View room numbers, class timings & instructor schedules.</p>
        </div>
      </div>
    </div>
  );
};
