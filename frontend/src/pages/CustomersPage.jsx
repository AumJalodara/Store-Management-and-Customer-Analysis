import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SectionCard from '../components/SectionCard';
import { TableSkeleton } from '../components/Skeleton';
import { ToastContainer } from '../components/Toast';
import { fmtRupee, fmtDate } from '../utils/format';

export default function CustomersPage({ onNavigate }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading } = useFetch(api.customers, [refreshKey]);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { toasts, removeToast, toast } = useToast();
  const { isAdmin } = useAuth();

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    
    setDeleting(id);
    try {
      await api.deleteCustomer(id);
      toast.success('Customer deleted successfully');
      refresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = (data || []).filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 mt-1.5 text-sm font-medium">Analyze customer behavior and value metrics.</p>
        </div>
        <motion.button
          onClick={() => onNavigate('addCustomer')}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold"
        >
          <Plus size={18} /> Add Customer
        </motion.button>
      </motion.div>

      <SectionCard title="Customer Directory" subtitle={`${filtered.length} customers registered`} accent="#06b6d4" delay={0.1}>
        <div className="mb-6 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 bg-gray-50/50 transition-all font-medium"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? <TableSkeleton rows={10} /> : (
          <div className="overflow-x-auto -mx-2">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th className="text-center">Orders</th>
                  <th>Total Spend</th>
                  <th>Last Purchase</th>
                  {isAdmin && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                             style={{ background: `hsl(${(i * 137) % 360}, 65%, 50%)` }}>
                          {c.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 leading-tight">{c.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-600">{c.email}</span>
                        <span className="text-xs text-gray-400">{c.phone}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-orange font-bold">{c.total_orders || 0}</span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{fmtRupee(c.total_spend)}</span>
                        <span className="text-[11px] text-gray-400 font-medium">Avg: {fmtRupee(c.avg_order_value)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-500">{fmtDate(c.last_purchase)}</span>
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deleting === c.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete Customer"
                        >
                          {deleting === c.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
