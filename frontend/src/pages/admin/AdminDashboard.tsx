import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { GraduationCap, Users, BookOpen, Building2, CalendarCheck, DollarSign, FileCheck, FileText, Plus, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await apiFetch('/reports');
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const enrollmentData = [
    { month: 'Jan', students: 240 },
    { month: 'Feb', students: 280 },
    { month: 'Mar', students: 310 },
    { month: 'Apr', students: 350 },
    { month: 'May', students: 410 },
    { month: 'Jun', students: 480 },
  ];

  const feeData = [
    { category: 'Collected', value: stats?.summary?.totalCollected || 125000 },
    { category: 'Pending', value: stats?.summary?.totalPending || 32000 },
  ];

  const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444'];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const s = stats?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Campus Executive Dashboard <Sparkles className="h-5 w-5 text-amber-500" />
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time analytics, student enrollments, fee collections & attendance metrics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/admin/students')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Student
          </button>
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200"
          >
            <Plus className="h-4 w-4" /> Create Course
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Enrolled Students" value={s.totalStudents || 30} subtext="Active cohort 2025-2026" icon={GraduationCap} color="blue" />
        <StatCard title="Faculty & Teachers" value={s.totalTeachers || 5} subtext="Across 4 departments" icon={Users} color="emerald" />
        <StatCard title="Total Academic Courses" value={s.totalCourses || 10} subtext="15 Active Subjects" icon={BookOpen} color="indigo" />
        <StatCard title="Departments" value={s.totalDepartments || 4} subtext="CS, EE, ME, BUS" icon={Building2} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Average Campus Attendance" value={`${s.avgAttendancePct || 93.4}%`} subtext="Threshold warning <75%" icon={CalendarCheck} color="emerald" />
        <StatCard title="Total Tuition Collected" value={`$${(s.totalCollected || 0).toLocaleString()}`} subtext="Spring 2026 Payments" icon={DollarSign} color="amber" />
        <StatCard title="Pending Outstanding Fees" value={`$${(s.totalPending || 0).toLocaleString()}`} subtext="Invoices pending review" icon={DollarSign} color="rose" />
        <StatCard title="Exam Performance Avg" value={`${s.avgExamScore || 82.5}%`} subtext="Combined assessment score" icon={FileCheck} color="blue" />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student Growth Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Student Enrollment Growth Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="students" stroke="#2563eb" fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Collection Pie Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Fee Collection Overview</h3>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600"><span className="h-3 w-3 rounded-full bg-blue-600"></span> Collected</span>
              <span className="flex items-center gap-1.5 text-amber-500"><span className="h-3 w-3 rounded-full bg-amber-500"></span> Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
