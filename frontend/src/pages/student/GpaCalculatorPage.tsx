import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Award, Calculator, Plus, Trash2, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const GpaCalculatorPage: React.FC = () => {
  const { user } = useAuth();
  const [resultCard, setResultCard] = useState<any>(null);

  // Dedicated GPA Calculator State
  const [calcRows, setCalcRows] = useState([
    { subjectName: 'AI & Neural Nets', creditHours: 3, grade: 'A+' },
    { subjectName: 'Database Management', creditHours: 4, grade: 'A' },
    { subjectName: 'Data Structures', creditHours: 4, grade: 'B+' },
  ]);
  const [calculatedGpa, setCalculatedGpa] = useState<any>(null);

  useEffect(() => {
    if (user?.studentId) fetchResultCard();
    handleCalculateGPA();
  }, [user]);

  const fetchResultCard = async () => {
    try {
      const data = await apiFetch(`/results/result-card/${user?.studentId}`);
      setResultCard(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculateGPA = async () => {
    try {
      const data = await apiFetch('/results/calculate-gpa', {
        method: 'POST',
        body: JSON.stringify({ subjects: calcRows }),
      });
      setCalculatedGpa(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addCalcRow = () => {
    setCalcRows([...calcRows, { subjectName: 'New Subject', creditHours: 3, grade: 'A' }]);
  };

  const removeCalcRow = (idx: number) => {
    setCalcRows(calcRows.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Academic Results & GPA Calculator</h1>
          <p className="text-xs text-gray-500">View official grade transcripts & simulate semester GPA outcomes.</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-800 dark:text-gray-200">
          <Printer className="h-4 w-4" /> Print Transcript
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Official Grade Card */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold">Official Digital Result Transcript</h3>
              <p className="text-xs text-gray-400">Cumulative GPA (CGPA): <span className="font-bold text-blue-600">{resultCard?.cgpa || '3.75'} / 4.00</span></p>
            </div>
            <Award className="h-8 w-8 text-amber-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5">Marks</th>
                  <th className="p-2.5">Grade</th>
                  <th className="p-2.5">GPA Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {resultCard?.results?.map((r: any) => (
                  <tr key={r.id}>
                    <td className="p-2.5 font-medium">{r.subject?.name}</td>
                    <td className="p-2.5 font-bold">{r.obtainedMarks} / {r.totalMarks}</td>
                    <td className="p-2.5 font-bold text-emerald-600">{r.grade}</td>
                    <td className="p-2.5 font-mono">{r.gpaPoint}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">Transcripts available for enrolled semester.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dedicated GPA Calculator Tool */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" /> Interactive GPA Calculator
            </h3>
            <span className="rounded-xl bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              GPA: {calculatedGpa?.gpa || '3.74'}
            </span>
          </div>

          <div className="space-y-2">
            {calcRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <input
                  type="text"
                  value={row.subjectName}
                  onChange={(e) => {
                    const newRows = [...calcRows];
                    newRows[idx].subjectName = e.target.value;
                    setCalcRows(newRows);
                  }}
                  className="flex-1 rounded-xl border p-2 dark:bg-slate-800"
                />
                <select
                  value={row.creditHours}
                  onChange={(e) => {
                    const newRows = [...calcRows];
                    newRows[idx].creditHours = Number(e.target.value);
                    setCalcRows(newRows);
                  }}
                  className="w-20 rounded-xl border p-2 dark:bg-slate-800"
                >
                  <option value={1}>1 CH</option>
                  <option value={2}>2 CH</option>
                  <option value={3}>3 CH</option>
                  <option value={4}>4 CH</option>
                </select>
                <select
                  value={row.grade}
                  onChange={(e) => {
                    const newRows = [...calcRows];
                    newRows[idx].grade = e.target.value;
                    setCalcRows(newRows);
                  }}
                  className="w-20 rounded-xl border p-2 dark:bg-slate-800"
                >
                  {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <button onClick={() => removeCalcRow(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={addCalcRow} className="flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:border-slate-800">
              <Plus className="h-4 w-4" /> Add Subject
            </button>
            <button onClick={handleCalculateGPA} className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Recalculate GPA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
