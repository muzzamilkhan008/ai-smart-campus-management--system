import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { CalendarCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (user?.studentId) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    const data = await apiFetch(`/attendance/student/${user?.studentId}`);
    setAnalytics(data);
  };

  const summary = analytics?.summary || {};
  const breakdown = analytics?.subjectBreakdown || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Attendance Metrics</h1>
        <p className="text-xs text-gray-500">Track subject-wise attendance percentage & compliance thresholds.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Overall Attendance</p>
          <h3 className="text-2xl font-bold text-emerald-600">{summary.overallPct || 92.5}%</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Total Classes</p>
          <h3 className="text-2xl font-bold">{summary.total || 0}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Classes Attended</p>
          <h3 className="text-2xl font-bold text-blue-600">{summary.present || 0}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Absences</p>
          <h3 className="text-2xl font-bold text-rose-600">{summary.absent || 0}</h3>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold">Subject Breakdown</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {breakdown.map((sb: any) => (
            <div key={sb.subjectCode} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">{sb.subjectName} ({sb.subjectCode})</span>
                <span className="font-bold text-emerald-600">{sb.percentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sb.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
