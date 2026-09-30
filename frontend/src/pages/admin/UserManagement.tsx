import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { ShieldCheck, UserCheck, Clock } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'audits'>('users');

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const fetchUsers = async () => {
    const data = await apiFetch('/users');
    setUsers(data.users || []);
  };

  const fetchAuditLogs = async () => {
    const data = await apiFetch('/audit-logs');
    setAuditLogs(data.logs || []);
  };

  const toggleUserStatus = async (user: any) => {
    await apiFetch(`/users/${user.id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Governance & Audit Trails</h1>
          <p className="text-xs text-gray-500">Configure role permissions, deactivate accounts & inspect security logs.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('users')} className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}>
            User Roles
          </button>
          <button onClick={() => setActiveTab('audits')} className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${activeTab === 'audits' ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}>
            Audit Trail
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-[10px] text-gray-500">{u.email}</p>
                  </td>
                  <td className="p-3 font-mono">{u.username}</td>
                  <td className="p-3 font-bold text-blue-600">{u.role}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => toggleUserStatus(u)} className="rounded-lg border px-2 py-1 text-[11px] font-semibold hover:bg-gray-50">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-xl border bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
              <div>
                <span className="font-bold text-blue-600">[{log.action}]</span> <span className="font-semibold">{log.user?.name || 'System'}</span> — {log.details}
              </div>
              <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
