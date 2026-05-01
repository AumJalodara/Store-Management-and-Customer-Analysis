import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import SectionCard from '../components/SectionCard';
import Badge from '../components/Badge';
import { TableSkeleton } from '../components/Skeleton';

export default function InventoryPage() {
  const { data, loading } = useFetch(api.inventory);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = (data || []).filter(item => {
    const matchSearch = item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
                        item.store_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || item.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    All: (data || []).length,
    Low: (data || []).filter(i => i.status === 'Low').length,
    OK: (data || []).filter(i => i.status === 'OK').length,
    'Out of Stock': (data || []).filter(i => i.status === 'Out of Stock').length,
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventory Management</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Monitor real-time stock levels across all locations.</p>
      </motion.div>

      {/* Filter pills */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
              filter === key
                ? 'bg-orange-500 text-white shadow-orange-500/20'
                : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-gray-600'
            }`}
          >
            {key} <span className={`ml-2 opacity-60`}>{count}</span>
          </button>
        ))}
      </div>

      <SectionCard title="Live Stock Summary" subtitle={`${filtered.length} locations tracked`} accent="#10b981" delay={0.1}>
        <div className="mb-6 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 bg-gray-50/50 transition-all font-medium"
            placeholder="Search product or store..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? <TableSkeleton rows={10} /> : (
          <div className="overflow-x-auto -mx-2">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Location</th>
                  <th className="text-center">Current Stock</th>
                  <th className="text-center">Min Level</th>
                  <th>Action Needed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const isLow = item.status === 'Low' || item.status === 'Out of Stock';
                  const suggested = Math.max(0, (item.reorder_level * 2 - item.quantity));
                  
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className={isLow ? 'bg-red-50/10' : ''}
                    >
                      <td>
                        <p className="font-bold text-gray-800">{item.product_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">BATCH ACTIVE</p>
                      </td>
                      <td className="font-medium text-gray-500">{item.store_name}</td>
                      <td className="text-center">
                        <span className={`text-lg font-black ${
                          item.status === 'Out of Stock' ? 'text-red-600' :
                          item.status === 'Low' ? 'text-orange-500' : 'text-green-600'
                        }`}>{item.quantity}</span>
                        <span className="text-[10px] text-gray-400 block -mt-1 font-bold">UNITS</span>
                      </td>
                      <td className="text-center text-gray-400 font-bold">{item.reorder_level}</td>
                      <td>
                        {isLow ? (
                          <div className="flex flex-col">
                            <span className="font-extrabold text-orange-600">Restock +{suggested}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Recommended order</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-medium">—</span>
                        )}
                      </td>
                      <td><Badge status={item.status} /></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
