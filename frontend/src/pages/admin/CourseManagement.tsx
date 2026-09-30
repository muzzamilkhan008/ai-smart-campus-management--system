import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, BookOpen, User } from 'lucide-react';

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSubjModal, setShowSubjModal] = useState(false);

  // Form states
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [subjCode, setSubjCode] = useState('');
  const [subjName, setSubjName] = useState('');
  const [creditHours, setCreditHours] = useState(3);
  const [semester, setSemester] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
    fetchDepts();
  }, []);

  const fetchCourses = async () => {
    const data = await apiFetch('/courses');
    setCourses(data.courses || []);
  };

  const fetchSubjects = async () => {
    const data = await apiFetch('/subjects');
    setSubjects(data.subjects || []);
  };

  const fetchDepts = async () => {
    const data = await apiFetch('/departments');
    setDepartments(data.departments || []);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/courses', { method: 'POST', body: JSON.stringify({ code: courseCode, name: courseName, departmentId }) });
    setShowCourseModal(false);
    fetchCourses();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/subjects', { method: 'POST', body: JSON.stringify({ code: subjCode, name: subjName, creditHours, semester, courseId: selectedCourseId }) });
    setShowSubjModal(false);
    fetchSubjects();
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Courses & Subjects</h1>
          <p className="text-xs text-gray-500">Configure academic curricula, credit hours & subject offerings.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCourseModal(true)} className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800">
            + Add Course Track
          </button>
          <button onClick={() => setShowSubjModal(true)} className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
            + Add Subject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Courses List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Course Tracks</h2>
          {courses.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600">{c.code}</span>
                <span className="text-[10px] text-gray-400">{c.department?.name}</span>
              </div>
              <h3 className="text-sm font-bold mt-1">{c.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{c.subjects?.length || 0} Assigned Subjects</p>
            </div>
          ))}
        </div>

        {/* Subjects List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Active Subjects</h2>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-mono font-bold text-blue-600">{s.code}</td>
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.creditHours} CH</td>
                    <td className="p-3 text-gray-500">{s.teacher?.user?.name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title="Add Course Track">
        <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Course Code (e.g. CS-CORE)</label>
            <input type="text" required value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Course Name</label>
            <input type="text" required value={courseName} onChange={(e) => setCourseName(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" required>
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Save Course</button>
        </form>
      </Modal>

      <Modal isOpen={showSubjModal} onClose={() => setShowSubjModal(false)} title="Add Subject">
        <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Subject Code (e.g. CS101)</label>
            <input type="text" required value={subjCode} onChange={(e) => setSubjCode(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Subject Name</label>
            <input type="text" required value={subjName} onChange={(e) => setSubjName(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Credit Hours</label>
              <input type="number" value={creditHours} onChange={(e) => setCreditHours(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold">Semester</label>
              <input type="number" value={semester} onChange={(e) => setSemester(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
          </div>
          <div>
            <label className="font-semibold">Course Track</label>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" required>
              <option value="">Select Course Track</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Save Subject</button>
        </form>
      </Modal>
    </div>
  );
};
