import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { CalendarCheck, CheckCircle, Save } from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [subData, stuData] = await Promise.all([
      apiFetch('/subjects'),
      apiFetch('/students'),
    ]);
    setSubjects(subData.subjects || []);
    setStudents(stuData.students || []);
    if (subData.subjects?.length > 0) setSelectedSubjectId(subData.subjects[0].id);

    // Initialize all students as PRESENT
    const initialMap: Record<string, any> = {};
    (stuData.students || []).forEach((s: any) => {
      initialMap[s.id] = 'PRESENT';
    });
    setAttendanceMap(initialMap);
  };

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    const attendanceData = Object.entries(attendanceMap).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    await apiFetch('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({
        subjectId: selectedSubjectId,
        date,
        attendanceData,
      }),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Class Attendance Sheet</h1>
        <p className="text-xs text-gray-500">Select course subject & date to log student daily attendance.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="mt-1 w-full rounded-xl border p-2 text-xs dark:bg-slate-800"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Class Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border p-2 text-xs dark:bg-slate-800"
          />
        </div>
        <div className="ml-auto flex items-end">
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700"
          >
            <Save className="h-4 w-4" /> Save Attendance
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 text-center">
          ✅ Attendance recorded successfully! Warning alerts triggered for students below threshold.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Student ID</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Attendance Marking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="p-3 font-mono font-bold text-blue-600">{s.studentIdCode}</td>
                <td className="p-3 font-semibold">{s.user?.name}</td>
                <td className="p-3">
                  <div className="flex gap-1.5">
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(s.id, st)}
                        className={`rounded-lg px-3 py-1 font-bold transition-all text-[10px] ${
                          attendanceMap[s.id] === st
                            ? st === 'PRESENT'
                              ? 'bg-emerald-600 text-white'
                              : st === 'ABSENT'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                            : 'border border-gray-200 text-gray-600 dark:border-slate-700 dark:text-gray-400'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
