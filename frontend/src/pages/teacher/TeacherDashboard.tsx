import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { BookOpen, Users, CalendarCheck, FileText, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subData, assData] = await Promise.all([
        apiFetch('/subjects'),
        apiFetch('/assignments'),
      ]);
      setSubjects(subData.subjects || []);
      setAssignments(assData.assignments || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Faculty Dashboard</h1>
          <p className="text-xs text-gray-500">Class management, student attendance marking & assignment grading.</p>
        </div>
        <button onClick={() => navigate('/teacher/attendance')} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <CalendarCheck className="h-4 w-4" /> Mark Class Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Assigned Subjects" value={subjects.length || 2} subtext="Spring 2026 Semester" icon={BookOpen} color="blue" />
        <StatCard title="Active Assignments" value={assignments.length || 1} subtext="Submissions pending review" icon={FileText} color="amber" />
        <StatCard title="Class Attendance Avg" value="94.2%" subtext="Overall cohort compliance" icon={CalendarCheck} color="emerald" />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Assigned Teaching Subjects</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {subjects.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="font-mono text-xs font-bold text-blue-600">{s.code}</span>
              <h3 className="text-base font-bold mt-1 text-slate-900 dark:text-slate-100">{s.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Semester {s.semester} • {s.creditHours} Credit Hours</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
