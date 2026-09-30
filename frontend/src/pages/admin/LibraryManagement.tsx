import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, Library, BookOpen } from 'lucide-react';

export const LibraryManagement: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('978-0123456789');
  const [category, setCategory] = useState('Computer Science');
  const [quantity, setQuantity] = useState(5);

  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchStudents();
  }, []);

  const fetchBooks = async () => {
    const data = await apiFetch('/library/books');
    setBooks(data.books || []);
  };

  const fetchStudents = async () => {
    const data = await apiFetch('/students');
    setStudents(data.students || []);
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/library/books', {
      method: 'POST',
      body: JSON.stringify({ title, author, isbn, category, quantity }),
    });
    setShowAddBook(false);
    fetchBooks();
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !studentId) return;
    await apiFetch('/library/issue', {
      method: 'POST',
      body: JSON.stringify({ bookId: selectedBook.id, studentId }),
    });
    setShowIssueModal(false);
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campus Library System</h1>
          <p className="text-xs text-gray-500">Book cataloging, borrowing issues, due dates & overdue fine tracking.</p>
        </div>
        <button onClick={() => setShowAddBook(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Add New Book
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Book Code</th>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">Category</th>
              <th className="p-3">Available Copies</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {books.map((b) => (
              <tr key={b.id}>
                <td className="p-3 font-mono font-bold text-blue-600">{b.bookCode}</td>
                <td className="p-3 font-semibold">{b.title}</td>
                <td className="p-3">{b.author}</td>
                <td className="p-3">{b.category}</td>
                <td className="p-3 font-bold text-emerald-600">{b.availableCopies} / {b.quantity}</td>
                <td className="p-3 text-right">
                  {b.availableCopies > 0 && (
                    <button onClick={() => { setSelectedBook(b); setShowIssueModal(true); }} className="rounded-lg bg-blue-600 px-2.5 py-1 text-white hover:bg-blue-700 font-semibold">
                      Issue Book
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAddBook} onClose={() => setShowAddBook(false)} title="Catalog New Library Book">
        <form onSubmit={handleCreateBook} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Book Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Author</label>
            <input type="text" required value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold">Quantity Copies</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Catalog Book</button>
        </form>
      </Modal>

      <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title={`Issue "${selectedBook?.title}" to Student`}>
        <form onSubmit={handleIssueBook} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Select Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" required>
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.name} ({s.studentIdCode})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Confirm Book Issue</button>
        </form>
      </Modal>
    </div>
  );
};
