import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Plus, X, Package, MapPin } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SectionCard from '../components/SectionCard';
import Badge from '../components/Badge';
import { TableSkeleton } from '../components/Skeleton';
import { ToastContainer } from '../components/Toast';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const EMPTY_TRANSFER = {
  product_id: '', from_store_id: '', to_store_id: '', quantity: '', transfer_date: new Date().toISOString().split('T')[0],
};

function TransferModal({ onClose, onSaved, toast }) {
  const [form, setForm] = useState(EMPTY_TRANSFER);
  const [saving, setSaving] = useState(false);
  const { data: products } = useFetch(api.products);
  const { data: stores } = useFetch(api.stores);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.product_id || !form.from_store_id || !form.to_store_id || !form.quantity) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.from_store_id === form.to_store_id) {
      toast.error('Source and destination stores must be different');
      return;
    }

    setSaving(true);
    try {
      await api.createTransfer(form);
      toast.success('Transfer completed successfully!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const labelCls = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ps-1";
  const inputCls = "w-full px-4 py-2.5 text-sm border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 bg-white/5 text-white transition-all appearance-none";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="crystal-glass rounded-3xl w-full max-w-md overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shadow-inner">
              <ArrowLeftRight size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">New Transfer</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className={labelCls}>Product</label>
            <div className="relative">
              <select 
                className={inputCls} 
                value={form.product_id} 
                onChange={e => setForm({...form, product_id: e.target.value})}
              >
                <option value="" className="bg-[#1a1a2e] text-white">Select Product...</option>
                {(products || []).map(p => (
                  <option key={p.id} value={p.id} className="bg-[#1a1a2e] text-white">
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <Package size={14} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>From Store</label>
              <div className="relative">
                <select 
                  className={inputCls} 
                  value={form.from_store_id} 
                  onChange={e => setForm({...form, from_store_id: e.target.value})}
                >
                  <option value="" className="bg-[#1a1a2e] text-white">Source...</option>
                  {(stores || []).map(s => (
                    <option key={s.id} value={s.id} className="bg-[#1a1a2e] text-white">{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <MapPin size={14} />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>To Store</label>
              <div className="relative">
                <select 
                  className={inputCls} 
                  value={form.to_store_id} 
                  onChange={e => setForm({...form, to_store_id: e.target.value})}
                >
                  <option value="" className="bg-[#1a1a2e] text-white">Destination...</option>
                  {(stores || []).map(s => (
                    <option key={s.id} value={s.id} className="bg-[#1a1a2e] text-white">{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <MapPin size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>Quantity</label>
              <input 
                type="number" 
                min="1" 
                className={inputCls} 
                value={form.quantity} 
                onChange={e => setForm({...form, quantity: e.target.value})} 
                placeholder="0" 
              />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Date</label>
              <input 
                type="date" 
                className={inputCls + " [color-scheme:dark]"} 
                value={form.transfer_date} 
                onChange={e => setForm({...form, transfer_date: e.target.value})} 
              />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? 'Processing...' : 'Complete Transfer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function TransfersPage() {
  const { isManager } = useAuth();
  const { toasts, removeToast, toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const { data, loading } = useFetch(api.transfers, [refreshKey]);

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <AnimatePresence>
        {showModal && <TransferModal onClose={() => setShowModal(false)} onSaved={refresh} toast={toast} />}
      </AnimatePresence>

    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Stock Transfers</h1>
          <p className="text-gray-500 mt-1.5 text-sm font-medium">Manage inter-store movements and logistics.</p>
        </motion.div>
        {isManager && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={18} /> New Transfer
          </motion.button>
        )}
      </div>

      <SectionCard title="Transfer Activities" subtitle={`${(data || []).length} log entries`} accent="#8b5cf6" delay={0.1}>
        {loading ? <TableSkeleton rows={8} /> : (
          <div className="overflow-x-auto -mx-2">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Source Store</th>
                  <th>Destination Store</th>
                  <th className="text-center">Quantity</th>
                  <th>Status</th>
                  <th>Activity Date</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).length === 0 && (
                  <tr><td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowLeftRight size={40} className="text-gray-200" />
                      <p className="text-gray-400 font-medium">No transfers found in the log</p>
                    </div>
                  </td></tr>
                )}
                {(data || []).map((t, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                          <ArrowLeftRight size={18} />
                        </div>
                        <span className="font-bold text-gray-800">{t.product_name}</span>
                      </div>
                    </td>
                    <td className="font-medium text-gray-500">{t.from_store}</td>
                    <td className="font-medium text-gray-500">{t.to_store}</td>
                    <td className="text-center font-black text-gray-700">{t.quantity}</td>
                    <td><Badge status={t.status || 'Completed'} /></td>
                    <td className="text-sm font-medium text-gray-400">{fmtDate(t.transfer_date)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
    </>
  );
}
