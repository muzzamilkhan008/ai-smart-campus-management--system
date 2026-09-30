import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { FileCheck, Clock, CheckCircle2, Award, Play } from 'lucide-react';

export const OnlineExamPage: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examResult, setExamResult] = useState<any | null>(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const data = await apiFetch('/exams');
    setExams(data.exams || []);
  };

  const handleStartExam = async (examId: string) => {
    try {
      const data = await apiFetch(`/exams/${examId}`);
      setActiveExam(data.exam);
      setAnswers({});
      setShowExamModal(true);
    } catch (err: any) {
      alert('Failed to load exam questions.');
    }
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    try {
      const data = await apiFetch(`/exams/${activeExam.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setShowExamModal(false);
      setExamResult(data.attempt);
      setShowResultModal(true);
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Exams & Online Testing Center</h1>
        <p className="text-xs text-gray-500">Attempt scheduled online MCQ exams & view official examination schedules.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((e) => (
          <div key={e.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${e.type === 'ONLINE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                {e.type} EXAM
              </span>
              <span className="text-xs font-bold text-gray-400">{e.subject?.code}</span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">{e.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{e.subject?.name}</p>

            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-gray-500 dark:border-slate-800">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.durationMinutes} Mins</span>
              {e.type === 'ONLINE' ? (
                <button
                  onClick={() => handleStartExam(e.id)}
                  className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 font-semibold text-white shadow hover:bg-purple-700"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Start Test
                </button>
              ) : (
                <span className="font-semibold text-gray-400">Scheduled Hall Exam</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Online MCQ Simulator Modal */}
      {activeExam && (
        <Modal isOpen={showExamModal} onClose={() => setShowExamModal(false)} title={`Online MCQ Test — ${activeExam.title}`}>
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3 text-purple-900 dark:bg-purple-950/50 dark:text-purple-200">
              <span className="font-bold flex items-center gap-1.5"><Clock className="h-4 w-4" /> Time Remaining: {activeExam.durationMinutes}:00</span>
              <span>Total Marks: {activeExam.totalMarks}</span>
            </div>

            <div className="space-y-4">
              {activeExam.questions?.map((q: any, idx: number) => {
                let options: string[] = [];
                try {
                  options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [];
                } catch (e) {
                  options = ['Option A', 'Option B', 'Option C', 'Option D'];
                }

                return (
                  <div key={q.id} className="rounded-xl border p-4 space-y-2 dark:border-slate-800">
                    <p className="font-bold">Q{idx + 1}. {q.questionText}</p>
                    <div className="space-y-1.5 pt-1">
                      {options.map((opt: string) => (
                        <label key={opt} className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-gray-50 dark:border-slate-800">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={handleSubmitExam} className="w-full rounded-xl bg-purple-600 py-3 font-bold text-white shadow hover:bg-purple-700">
              Submit Answers & View Grade
            </button>
          </div>
        </Modal>
      )}

      {/* Exam Result Score Modal */}
      {examResult && (
        <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="Examination Results">
          <div className="text-center py-4 space-y-3">
            <Award className="mx-auto h-16 w-16 text-emerald-500 animate-bounce" />
            <h3 className="text-xl font-bold">Exam Submitted Successfully!</h3>
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              <p className="text-xs">Your Score</p>
              <p className="text-3xl font-black">{examResult.scoreObtained} / {examResult.totalPossibleMarks}</p>
              <p className="text-xs font-semibold mt-1">Grade: {examResult.grade} ({examResult.percentage}%)</p>
            </div>
            <button onClick={() => setShowResultModal(false)} className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white">
              Close & Return to Dashboard
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
