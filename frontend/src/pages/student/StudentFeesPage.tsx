import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { DollarSign, Printer, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const StudentFeesPage: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    const data = await apiFetch('/fees');
    setFees(data.fees || []);
  };

  const openReceipt = (fee: any) => {
    setSelectedReceipt(fee);
    setShowReceiptModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tuition Fees & Invoice Receipts</h1>
        <p className="text-xs text-gray-500">Track semester fee invoices, payment history & printable official receipts.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Invoice #</th>
              <th className="p-3">Title</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Paid Amount</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {fees.map((f) => (
              <tr key={f.id}>
                <td className="p-3 font-mono font-bold text-blue-600">{f.invoiceNumber}</td>
                <td className="p-3 font-semibold">{f.title}</td>
                <td className="p-3 font-bold">${f.amount}</td>
                <td className="p-3 font-bold text-emerald-600">${f.paidAmount}</td>
                <td className="p-3">{f.dueDate}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    f.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openReceipt(f)} className="flex items-center gap-1 ml-auto rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 dark:border-slate-700">
                    <Printer className="h-3.5 w-3.5" /> View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title={`Fee Payment Receipt — ${selectedReceipt.invoiceNumber}`}>
          <div className="space-y-4 text-xs p-2">
            <div className="text-center border-b pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-blue-600">AI SMART CAMPUS UNIVERSITY</h2>
              <p className="text-[10px] text-gray-500">Official Financial Payment Receipt</p>
            </div>

            <div className="space-y-1">
              <p><strong>Student Name:</strong> {user?.name}</p>
              <p><strong>Invoice Title:</strong> {selectedReceipt.title}</p>
              <p><strong>Total Invoice Amount:</strong> ${selectedReceipt.amount}</p>
              <p><strong>Total Amount Paid:</strong> <span className="font-bold text-emerald-600">${selectedReceipt.paidAmount}</span></p>
              <p><strong>Payment Status:</strong> {selectedReceipt.status}</p>
            </div>

            <button onClick={() => window.print()} className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700">
              Print Official Receipt PDF
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
