import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, IndianRupee, BarChart3 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import SectionCard from '../components/SectionCard';
import { TableSkeleton } from '../components/Skeleton';
import { fmtRupee, fmtRupeeShort, fmtDate } from '../utils/format';

export default function SalesPage() {
  const { data, loading } = useFetch(api.sales);
  const [search, setSearch] = useState('');

  const filtered = (data || []).filter(s =>
    s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.product_name?.toLowerCase().includes(search.toLowerCase())  ||
    s.store_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sales Transactions</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Track and monitor all store sales activity.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Transactions', value: filtered.length, icon: ShoppingCart, color: 'bg-blue-500' },
          { label: 'Total Revenue',      value: fmtRupeeShort(totalRevenue), icon: IndianRupee, color: 'bg-green-500' },
          { label: 'Avg. Order Value',   value: fmtRupeeShort(filtered.length ? totalRevenue / filtered.length : 0), icon: BarChart3, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
              {React.createElement(stat.icon || ShoppingCart, { size: 24, className: stat.color.replace('bg-', 'text-') })}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <SectionCard title="Transaction History" subtitle={`${filtered.length} records processed`} accent="#f97316" delay={0.2}>
        <div className="mb-6 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 bg-gray-50/50 transition-all font-medium"
            placeholder="Search customer, product or store..."
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
                  <th>Product Details</th>
                  <th>Store</th>
                  <th className="text-center">Qty</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr key={s.id || i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                  >
                    <td>
                      <p className="font-bold text-gray-800">{s.customer_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">LOYALTY MEMBER</p>
                    </td>
                    <td>
                      <p className="text-sm font-semibold text-gray-700">{s.product_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{s.brand || 'General'}</p>
                    </td>
                    <td>
                      <span className="badge badge-blue">{s.store_name}</span>
                    </td>
                    <td className="text-center font-bold text-gray-600">{s.quantity}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900">{fmtRupee(s.total_amount)}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Unit: {fmtRupee(s.unit_price || (s.total_amount / s.quantity))}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{fmtDate(s.sale_date)}</span>
                    </td>
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
