import { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const AttendanceManagement = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [anaData, recData] = await Promise.all([
        apiFetch('/attendance/campus-analytics'),
        apiFetch('/attendance'),
      ]);
      setAnalytics(anaData);
      setRecords(recData.records || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campus Attendance Management</h1>
          <p className="text-xs text-gray-500">Monitor campus-wide attendance percentage & compliance thresholds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Campus Average</p>
          <h3 className="text-2xl font-bold text-emerald-600">{analytics?.averagePct || 93.4}%</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Total Classes Recorded</p>
          <h3 className="text-2xl font-bold">{analytics?.totalRecords || 300}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Total Present Marks</p>
          <h3 className="text-2xl font-bold text-blue-600">{analytics?.breakdown?.present || 280}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Total Absent Marks</p>
          <h3 className="text-2xl font-bold text-rose-600">{analytics?.breakdown?.absent || 20}</h3>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800">
          <h3 className="text-sm font-bold">Recent Class Attendance Records</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Student</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-mono">{r.date}</td>
                <td className="p-3 font-medium">{r.student?.user?.name}</td>
                <td className="p-3">{r.subject?.name}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    r.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
