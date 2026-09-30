import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';

export const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-25');
  const [time, setTime] = useState('09:00 AM');
  const [location, setLocation] = useState('Auditorium Hall A');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const data = await apiFetch('/events');
    setEvents(data.events || []);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/events', {
      method: 'POST',
      body: JSON.stringify({ title, description, date, time, location, organizer: 'University AI Club' }),
    });
    setShowModal(false);
    fetchEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campus Events & Tech Expos</h1>
          <p className="text-xs text-gray-500">Organize seminars, AI hackathons, sports events & student RSVPs.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ev.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
            <div className="mt-4 space-y-1 text-xs text-gray-500 border-t pt-3 dark:border-slate-800">
              <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-blue-600" /> {ev.date} at {ev.time}</p>
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-rose-500" /> {ev.location}</p>
              <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-emerald-500" /> {ev._count?.registrations || 0} Registered</p>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Campus Event">
        <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Event Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold">Time</label>
              <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
          </div>
          <div>
            <label className="font-semibold">Location / Venue</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" rows={3} />
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Publish Event</button>
        </form>
      </Modal>
    </div>
  );
};
