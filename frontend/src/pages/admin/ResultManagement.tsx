import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, Award, CheckCircle } from 'lucide-react';

export const ResultManagement: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [obtainedMarks, setObtainedMarks] = useState(85);
  const [totalMarks, setTotalMarks] = useState(100);

  useEffect(() => {
    fetchResults();
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchResults = async () => {
    const data = await apiFetch('/results');
    setResults(data.results || []);
  };

  const fetchStudents = async () => {
    const data = await apiFetch('/students');
    setStudents(data.students || []);
  };

  const fetchSubjects = async () => {
    const data = await apiFetch('/subjects');
    setSubjects(data.subjects || []);
  };

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/results/record', {
      method: 'POST',
      body: JSON.stringify({ studentId, subjectId, obtainedMarks, totalMarks, semester: 1 }),
    });
    setShowModal(false);
    fetchResults();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Results & Grading System</h1>
          <p className="text-xs text-gray-500">Record assessment scores, GPA points & publish grade reports.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Record Marks
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Student Name</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Marks Scored</th>
              <th className="p-3">Percentage</th>
              <th className="p-3">Grade</th>
              <th className="p-3">GPA Point</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {results.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-semibold">{r.student?.user?.name}</td>
                <td className="p-3">{r.subject?.name} ({r.subject?.code})</td>
                <td className="p-3 font-bold">{r.obtainedMarks} / {r.totalMarks}</td>
                <td className="p-3">{r.percentage}%</td>
                <td className="p-3">
                  <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    {r.grade}
                  </span>
                </td>
                <td className="p-3 font-bold text-blue-600">{r.gpaPoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Student Grade">
        <form onSubmit={handleRecordResult} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" required>
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.name} ({s.studentIdCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Subject</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" required>
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Obtained Marks</label>
              <input type="number" value={obtainedMarks} onChange={(e) => setObtainedMarks(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold">Total Marks</label>
              <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Save Result</button>
        </form>
      </Modal>
    </div>
  );
};
