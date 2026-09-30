import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { FileText, Calendar, Upload, CheckCircle2 } from 'lucide-react';

export const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const data = await apiFetch('/assignments');
    setAssignments(data.assignments || []);
  };

  const handleOpenSubmit = (assignment: any) => {
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setFileUrl('');
    setShowSubmitModal(true);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    await apiFetch(`/assignments/${selectedAssignment.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ submissionText, fileUrl }),
    });
    setShowSubmitModal(false);
    fetchAssignments();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Course Assignments</h1>
        <p className="text-xs text-gray-500">View upcoming homework tasks, deadlines & submit completed solutions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <span className="font-mono text-xs font-bold text-blue-600">{a.subject?.code}</span>
            <h3 className="text-sm font-bold">{a.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{a.description}</p>
            <div className="flex items-center justify-between border-t pt-3 text-xs text-gray-500 dark:border-slate-800">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due {a.deadline}</span>
              <button onClick={() => handleOpenSubmit(a)} className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700">
                <Upload className="h-3.5 w-3.5" /> Submit
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAssignment && (
        <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title={`Submit Solution — ${selectedAssignment.title}`}>
          <form onSubmit={handleSubmitAssignment} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold">Solution Comments / Repository Link</label>
              <textarea
                required
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Paste code links or explanation here..."
                className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800"
                rows={3}
              />
            </div>
            <div>
              <label className="font-semibold">Document / File URL (Optional)</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/... or /uploads/file.pdf"
                className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800"
              />
            </div>
            <button type="submit" className="w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700">
              Confirm & Submit Assignment
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
