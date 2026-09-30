import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { FolderDown, FileText, Download } from 'lucide-react';

export const StudentDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    const data = await apiFetch('/documents');
    setDocuments(data.documents || []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Document Repository</h1>
        <p className="text-xs text-gray-500">Access academic transcripts, official certificates, receipts & course materials.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="p-3">Document Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Uploaded Date</th>
              <th className="p-3 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {documents.map((d) => (
              <tr key={d.id}>
                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{d.title}</td>
                <td className="p-3 font-bold text-blue-600">{d.type}</td>
                <td className="p-3 text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-semibold hover:bg-gray-50 dark:border-slate-700">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
