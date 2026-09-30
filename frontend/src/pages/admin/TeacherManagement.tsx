import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, Search, Users, Trash2, BookOpen } from 'lucide-react';

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', qualification: 'Ph.D.', departmentId: '' });

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await apiFetch('/teachers');
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
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

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/teachers', { method: 'POST', body: JSON.stringify(formData) });
      setShowAddModal(false);
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to add teacher.');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher record?')) return;
    try {
      await apiFetch(`/teachers/${id}`, { method: 'DELETE' });
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete teacher.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Faculty Directory</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage university professors, lecturers & department assignments.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add Teacher
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-gray-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Teacher Code</th>
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Department</th>
              <th className="py-3 px-4 font-semibold">Qualification</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-blue-600">{t.teacherIdCode}</td>
                <td className="py-3 px-4 font-semibold">{t.user.name}</td>
                <td className="py-3 px-4">{t.department?.name || 'General Faculty'}</td>
                <td className="py-3 px-4">{t.qualification}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDeleteTeacher(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Faculty Member">
        <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Full Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Department</label>
            <select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800">
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Save Teacher</button>
        </form>
      </Modal>
    </div>
  );
};
