import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, FileCheck, Calendar, Clock, Award } from 'lucide-react';

export const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [type, setType] = useState('ONLINE');

  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    const data = await apiFetch('/exams');
    setExams(data.exams || []);
  };

  const fetchSubjects = async () => {
    const data = await apiFetch('/subjects');
    setSubjects(data.subjects || []);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/exams', {
      method: 'POST',
      body: JSON.stringify({
        title,
        subjectId,
        examDate,
        startTime,
        durationMinutes,
        totalMarks,
        type,
        questions: type === 'ONLINE' ? [
          { questionText: 'Sample MCQ Question 1', questionType: 'MCQ', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 'Option A', marks: 10 }
        ] : [],
      }),
    });
    setShowModal(false);
    fetchExams();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Exam Management</h1>
          <p className="text-xs text-gray-500">Create & schedule offline and timed online MCQ examinations.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Create Exam
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((e) => (
          <div key={e.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${e.type === 'ONLINE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                {e.type} EXAM
              </span>
              <span className="text-xs font-bold text-gray-400">{e.subject?.code}</span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">{e.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{e.subject?.name}</p>

            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-gray-500 dark:border-slate-800">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {e.examDate}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.durationMinutes} mins</span>
              <span className="font-bold text-blue-600">{e.totalMarks} Marks</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Examination">
        <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Exam Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Subject</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" required>
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Exam Date</label>
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold">Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Duration (Mins)</label>
              <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800">
                <option value="ONLINE">ONLINE (MCQ Simulator)</option>
                <option value="OFFLINE">OFFLINE (Written Hall Exam)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Save Exam</button>
        </form>
      </Modal>
    </div>
  );
};
