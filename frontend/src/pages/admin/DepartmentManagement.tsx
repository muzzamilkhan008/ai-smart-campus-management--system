import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, Building2, Users, GraduationCap, BookOpen } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    const data = await apiFetch('/departments');
    setDepartments(data.departments || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/departments', { method: 'POST', body: JSON.stringify({ code, name, description }) });
    setShowModal(false);
    setCode(''); setName(''); setDescription('');
    fetchDepts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Academic Departments</h1>
          <p className="text-xs text-gray-500">Manage university faculties, programs & department leadership.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {departments.map((d) => (
          <div key={d.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">{d.code}</span>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">{d.name}</h3>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{d.description || 'University academic department'}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs dark:border-slate-800">
              <div>
                <p className="text-gray-400">Students</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{d._count?.students || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Teachers</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{d._count?.teachers || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Courses</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{d._count?.courses || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Department">
        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Department Code (e.g. CS, EE)</label>
            <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Department Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" rows={3} />
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Create</button>
        </form>
      </Modal>
    </div>
  );
};
