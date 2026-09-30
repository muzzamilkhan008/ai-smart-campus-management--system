import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Bell, Check, Trash2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const data = await apiFetch('/notifications');
    setNotifications(data.notifications || []);
  };

  const markAllRead = async () => {
    await apiFetch('/notifications/all/read', { method: 'PUT' });
    fetchNotifications();
  };

  const deleteNotif = async (id: string) => {
    await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    fetchNotifications();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notification Center</h1>
          <p className="text-xs text-gray-500">System alerts, exam reminders & assignment deadline notifications.</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:border-slate-800">
          <Check className="h-4 w-4" /> Mark All as Read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`flex items-start justify-between rounded-2xl border p-4 text-xs transition-all ${
            !n.isRead ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900' : 'bg-white dark:bg-slate-900 dark:border-slate-800'
          }`}>
            <div className="space-y-1">
              <span className="font-bold text-blue-600">[{n.type}]</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
              <p className="text-gray-600 dark:text-gray-400">{n.message}</p>
            </div>
            <button onClick={() => deleteNotif(n.id)} className="p-1 text-gray-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
