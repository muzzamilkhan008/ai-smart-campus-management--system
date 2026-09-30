import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<any[]>([]);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    const data = await apiFetch('/timetable');
    setTimetable(data.timetable || []);
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Weekly Timetable & Schedule</h1>
        <p className="text-xs text-gray-500">Personalized weekly calendar, room allocations & instructor timetables.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const slots = timetable.filter((t) => t.dayOfWeek === day);
          return (
            <div key={day} className="rounded-2xl border bg-white p-5 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b pb-2 dark:border-slate-800">{day}</h3>
              {slots.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No scheduled lectures</p>
              ) : (
                slots.map((slot) => (
                  <div key={slot.id} className="rounded-xl border p-3 bg-gray-50 dark:bg-slate-800/60 dark:border-slate-800 space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{slot.subject?.name} ({slot.subject?.code})</p>
                    <p className="text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {slot.startTime} - {slot.endTime}</p>
                    <p className="text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3 text-rose-500" /> Room {slot.roomNumber}</p>
                    <p className="text-gray-500 flex items-center gap-1"><User className="h-3 w-3 text-blue-500" /> {slot.teacher?.user?.name || 'Faculty Instructor'}</p>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
