import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Settings, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    institutionName: 'AI Smart Campus University',
    academicYear: '2025-2026',
    currentSemester: 'Spring 2026',
    attendanceThreshold: 75.0,
    currency: 'USD',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const data = await apiFetch('/settings');
    if (data.settings) setSettings(data.settings);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Institution System Settings</h1>
        <p className="text-xs text-gray-500">Configure global university parameters, academic calendar & warning thresholds.</p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border bg-white p-6 shadow-sm space-y-4 text-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">Institution Name</label>
          <input
            type="text"
            value={settings.institutionName}
            onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
            className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Academic Year</label>
            <input
              type="text"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Current Semester</label>
            <input
              type="text"
              value={settings.currentSemester}
              onChange={(e) => setSettings({ ...settings, currentSemester: e.target.value })}
              className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"
            />
          </div>
        </div>
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">Attendance Warning Threshold (%)</label>
          <input
            type="number"
            step="0.1"
            value={settings.attendanceThreshold}
            onChange={(e) => setSettings({ ...settings, attendanceThreshold: Number(e.target.value) })}
            className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"
          />
        </div>

        <button type="submit" className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Settings Saved Successfully!' : 'Save System Settings'}
        </button>
      </form>
    </div>
  );
};
