import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export const AssignmentManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState('2026-10-10 23:59');

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  const fetchAssignments = async () => {
    const data = await apiFetch('/assignments');
    setAssignments(data.assignments || []);
  };

  const fetchSubjects = async () => {
    const data = await apiFetch('/subjects');
    setSubjects(data.subjects || []);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/assignments', {
      method: 'POST',
      body: JSON.stringify({ title, description, subjectId, deadline, totalMarks: 100 }),
    });
    setShowModal(false);
    fetchAssignments();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Assignment System</h1>
          <p className="text-xs text-gray-500">Course homework, project submissions & faculty grading portal.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="font-mono text-xs font-bold text-blue-600">{a.subject?.code}</span>
            <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">{a.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-gray-400 dark:border-slate-800">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due {a.deadline}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{a.submissions?.length || 0} Submissions</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Assignment">
        <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
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
          <div>
            <label className="font-semibold">Deadline</label>
            <input type="text" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" rows={3} />
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Save Assignment</button>
        </form>
      </Modal>
    </div>
  );
};
