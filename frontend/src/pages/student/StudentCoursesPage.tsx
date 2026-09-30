import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { BookOpen, User, Clock } from 'lucide-react';

export const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const data = await apiFetch('/courses');
    setCourses(data.courses || []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Enrolled Courses</h1>
        <p className="text-xs text-gray-500">View enrolled subject syllabi, instructor profiles & credit hours.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {courses.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="font-mono text-xs font-bold text-blue-600">{c.code}</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{c.name}</h3>
            <p className="text-xs text-gray-500">{c.description || 'Department of Computer Science & AI'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
