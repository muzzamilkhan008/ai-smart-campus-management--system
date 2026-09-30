import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, Megaphone, Trash2 } from 'lucide-react';

export const NoticeManagement: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('HIGH');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const data = await apiFetch('/notices');
    setNotices(data.notices || []);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/notices', {
      method: 'POST',
      body: JSON.stringify({ title, description, category, priority, targetRole: 'ALL' }),
    });
    setShowModal(false);
    fetchNotices();
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/notices/${id}`, { method: 'DELETE' });
    fetchNotices();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notices & Campus Announcements</h1>
          <p className="text-xs text-gray-500">Publish priority announcements to students, teachers & staff.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Create Notice
        </button>
      </div>

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="flex items-start justify-between rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">{n.category}</span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${n.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{n.priority}</span>
                <span className="text-[10px] text-gray-400">{n.publishDate}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{n.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{n.description}</p>
            </div>
            <button onClick={() => handleDelete(n.id)} className="p-1 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Publish Campus Notice">
        <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Notice Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800">
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Event">Event</option>
                <option value="General">General</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="font-semibold">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="font-semibold">Notice Content</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" rows={4} />
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Publish Announcement</button>
        </form>
      </Modal>
    </div>
  );
};
