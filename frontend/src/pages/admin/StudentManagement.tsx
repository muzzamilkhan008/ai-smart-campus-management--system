import React, { useState, useEffect } from 'react';
import { apiFetch, exportToCSV } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, Search, Download, Eye, Edit3, Trash2, GraduationCap, CheckCircle, AlertTriangle } from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results' | 'fees'>('overview');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '2004-01-01',
    gender: 'Male',
    departmentId: '',
    semester: 1,
    guardianName: '',
    guardianContact: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, [search, selectedDept]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedDept) query.append('departmentId', selectedDept);

      const data = await apiFetch(`/students?${query.toString()}`);
      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiFetch('/departments');
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', dob: '2004-01-01', gender: 'Male', departmentId: '', semester: 1, guardianName: '', guardianContact: '' });
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to create student.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
      await apiFetch(`/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student.');
    }
  };

  const openStudentDetails = async (id: string) => {
    try {
      const data = await apiFetch(`/students/${id}`);
      setSelectedStudent(data);
      setShowViewModal(true);
    } catch (err: any) {
      alert('Failed to load student profile.');
    }
  };

  const handleExportCSV = () => {
    const csvData = students.map((s) => ({
      ID: s.studentIdCode,
      Name: s.user.name,
      Email: s.user.email,
      Department: s.department?.name || 'N/A',
      Semester: s.semester,
      Status: s.status,
    }));
    exportToCSV('students_export', csvData);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Student Directory</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage student profiles, enrollments, and academic records.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search student ID, name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-gray-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Student ID</th>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Semester</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No students found.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{s.studentIdCode}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={s.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.user.name}`} alt="" className="h-7 w-7 rounded-full border object-cover" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{s.user.name}</p>
                          <p className="text-[10px] text-gray-500">{s.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{s.department?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4 font-semibold">Sem {s.semester}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openStudentDetails(s.id)} title="View Profile" className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteStudent(s.id)} title="Delete Student" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Student">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">
            Submit & Save Student
          </button>
        </form>
      </Modal>

      {/* Student View Drawer Modal */}
      {selectedStudent && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={`Student Profile — ${selectedStudent.student.studentIdCode}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-3 dark:border-slate-800">
              <img src={selectedStudent.student.user.avatar} alt="" className="h-12 w-12 rounded-full border" />
              <div>
                <h4 className="font-bold text-sm">{selectedStudent.student.user.name}</h4>
                <p className="text-xs text-gray-500">{selectedStudent.student.user.email} • {selectedStudent.student.department?.name}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-blue-50 p-2 dark:bg-blue-950/40">
                <p className="text-gray-500">Attendance</p>
                <p className="font-bold text-blue-600">{selectedStudent.summary.attendancePct}%</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/40">
                <p className="text-gray-500">CGPA</p>
                <p className="font-bold text-emerald-600">{selectedStudent.summary.cgpa}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2 dark:bg-amber-950/40">
                <p className="text-gray-500">Pending Fees</p>
                <p className="font-bold text-amber-600">${selectedStudent.summary.totalFeesPending}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
