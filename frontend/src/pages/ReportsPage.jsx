import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { exportToCSV } from '../utils/csvExport';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const REPORTS = [
  { id: 'daily-sales', title: 'Daily Sales Report', desc: 'All transactions for today with totals', color: '#f97316', tag: 'Sales' },
  { id: 'low-stock', title: 'Low Stock Report', desc: 'Products needing immediate reorder', color: '#ef4444', tag: 'Inventory' },
  { id: 'expiry', title: 'Expiry Alert Report', desc: 'Batches expiring within 30 days', color: '#f59e0b', tag: 'Inventory' },
  { id: 'customers', title: 'Customer Activity Report', desc: 'Purchase history & behavior metrics', color: '#06b6d4', tag: 'Customers' },
  { id: 'revenue', title: 'Revenue Summary', desc: 'Monthly & quarterly revenue breakdown', color: '#8b5cf6', tag: 'Finance' },
  { id: 'transfers', title: 'Transfer Log Report', desc: 'All inter-store stock movements', color: '#10b981', tag: 'Logistics' },
];

export default function ReportsPage() {
  const { toasts, removeToast, toast } = useToast();
  const [loadingReport, setLoadingReport] = useState(null);

  const handleExport = async (reportId, title) => {
    setLoadingReport(reportId);
    try {
      let data = [];
      switch (reportId) {
        case 'daily-sales':
          const sales = await api.sales();
          const today = new Date().toISOString().split('T')[0];
          data = sales.filter(s => s.sale_date.startsWith(today));
          break;
        case 'low-stock':
          const inventory = await api.inventory();
          data = inventory.filter(i => i.status === 'Low' || i.status === 'Out of Stock');
          break;
        case 'expiry':
          data = await api.expiry();
          break;
        case 'customers':
          data = await api.customers();
          break;
        case 'revenue':
          const dash = await api.dashboard();
          data = dash.monthlyRevenue;
          break;
        case 'transfers':
          data = await api.transfers();
          break;
        default:
          break;
      }

      if (data.length === 0) {
        toast.error("No data found for this report.");
      } else {
        exportToCSV(data, title.replace(/\s+/g, '_').toLowerCase());
        toast.success(`${title} exported successfully.`);
      }
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="space-y-8 pb-10">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Business Reports</h1>
          <p className="text-gray-500 mt-1.5 text-sm font-medium">Generate and analyze deep-dive business intelligence reports.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {REPORTS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between h-48"
            >
              {/* Subtle background circle */}
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gray-50 group-hover:bg-orange-50/50 transition-colors pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                       style={{ background: r.color + '15' }}>
                    <FileText size={22} style={{ color: r.color }} />
                  </div>
                  <span className="badge font-bold"
                        style={{ background: r.color + '10', color: r.color }}>
                    {r.tag}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1 tracking-tight">{r.title}</h3>
                <p className="text-xs text-gray-400 font-medium line-clamp-2">{r.desc}</p>
              </div>
              
              <button
                disabled={loadingReport === r.id}
                onClick={() => handleExport(r.id, r.title)}
                className="relative z-10 mt-auto flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all bg-gray-50 text-gray-600 hover:bg-orange-500 hover:text-white disabled:opacity-50"
              >
                {loadingReport === r.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Generate CSV
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
