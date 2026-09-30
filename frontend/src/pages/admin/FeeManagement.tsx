import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Plus, DollarSign, CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('Spring 2026 Semester Tuition Fee');
  const [amount, setAmount] = useState(2500);
  const [dueDate, setDueDate] = useState('2026-10-15');

  const [amountPaid, setAmountPaid] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const fetchFees = async () => {
    const data = await apiFetch('/fees');
    setFees(data.fees || []);
    setOverview(data.overview);
  };

  const fetchStudents = async () => {
    const data = await apiFetch('/students');
    setStudents(data.students || []);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/fees/invoice', {
      method: 'POST',
      body: JSON.stringify({ studentId, title, amount, dueDate }),
    });
    setShowInvoiceModal(false);
    fetchFees();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    await apiFetch(`/fees/${selectedFee.id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ amountPaid, paymentMethod }),
    });
    setShowPayModal(false);
    fetchFees();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Fee & Billing Management</h1>
          <p className="text-xs text-gray-500">Student tuition invoicing, payment recording & receipt generation.</p>
        </div>
        <button onClick={() => setShowInvoiceModal(true)} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Total Collected</p>
          <h3 className="text-2xl font-bold text-emerald-600">${overview?.totalCollected?.toLocaleString() || 0}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Total Pending Balance</p>
          <h3 className="text-2xl font-bold text-amber-500">${overview?.totalPending?.toLocaleString() || 0}</h3>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-gray-400">Total Invoices Issued</p>
          <h3 className="text-2xl font-bold">{overview?.totalInvoices || 0}</h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Invoice #</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Invoice Title</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Paid Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {fees.map((f) => (
              <tr key={f.id}>
                <td className="p-3 font-mono font-bold text-blue-600">{f.invoiceNumber}</td>
                <td className="p-3 font-medium">{f.student?.user?.name}</td>
                <td className="p-3">{f.title}</td>
                <td className="p-3 font-bold">${f.amount}</td>
                <td className="p-3 font-bold text-emerald-600">${f.paidAmount}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    f.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : f.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {f.status !== 'PAID' && (
                    <button onClick={() => { setSelectedFee(f); setShowPayModal(true); }} className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700">
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Generate Fee Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" required>
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user?.name} ({s.studentIdCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Invoice Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold">Amount ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700">Issue Invoice</button>
        </form>
      </Modal>

      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title={`Record Payment for ${selectedFee?.invoiceNumber}`}>
        <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold">Payment Amount ($)</label>
            <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800" />
          </div>
          <div>
            <label className="font-semibold">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-xl border p-2 mt-1 dark:bg-slate-800">
              <option value="ONLINE">Online Card</option>
              <option value="BANK_TRANSFER">Bank Wire Transfer</option>
              <option value="CASH">Cash Deposit</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2 text-white font-semibold hover:bg-emerald-700">Confirm Payment</button>
        </form>
      </Modal>
    </div>
  );
};
