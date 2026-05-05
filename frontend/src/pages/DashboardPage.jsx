import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Package, IndianRupee, ShoppingCart, Users,
  AlertTriangle, Clock, ArrowLeftRight
} from 'lucide-react';

import { useFetch }  from '../hooks/useFetch';
import { useAuth }   from '../context/AuthContext';
import { api }       from '../services/api';
import { fmtRupee, fmtRupeeShort, fmtDate } from '../utils/format';
import KpiCard       from '../components/KpiCard';
import SectionCard   from '../components/SectionCard';
import { KpiSkeleton, TableSkeleton } from '../components/Skeleton';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip-glass text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff' }} className="font-medium drop-shadow-md">
          {p.name === 'revenue' ? fmtRupeeShort(p.value) : `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useFetch(api.dashboard);
  const kpis = data?.kpis || {};

  const revenueChange = kpis.lastMonthRevenue > 0
    ? (((kpis.monthRevenue - kpis.lastMonthRevenue) / kpis.lastMonthRevenue) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
        </h1>
        <p className="text-indigo-200/70 mt-1.5 text-sm font-medium">Here's what's happening with your store today.</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          [0,1,2,3].map(i => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total Products" value={fmt(kpis.totalProducts)}
              trend="Active SKUs" icon={Package}
              gradientClass="gradient-card-purple" delay={0} />
            <KpiCard title="Total Customers" value={fmt(kpis.totalCustomers)}
              trend="Registered" icon={Users}
              gradientClass="gradient-card-blue" delay={0.1} />
            <KpiCard title="Sales Today" value={fmt(kpis.salesToday)}
              trend="Orders processed" icon={ShoppingCart}
              gradientClass="gradient-card-orange" delay={0.2} />
            <KpiCard title="Low Stock Items" value={kpis.lowStockCount || 0}
              trend={kpis.lowStockCount > 0 ? "Restock required" : "All good"}
              icon={AlertTriangle}
              gradientClass="gradient-card-pink" delay={0.3} />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Best Selling" subtitle="Top products by units"
          accent="#4f46e5" delay={0.45} className="xl:col-span-3">
          {loading ? (
            <div className="h-64 animate-pulse bg-white/5 rounded-xl" />
          ) : (
              <div className="w-full mt-6 space-y-2.5 pb-2">
                {/* Table Header */}
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-5 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-6 w-1/3">
                    <span className="w-8 text-center">Rank</span>
                    <span>Product Name</span>
                  </div>
                  <span className="flex-1">Popularity Metrics</span>
                  <span className="w-24 text-right">Units</span>
                </div>
                
                {/* Ranked List */}
                {(() => {
                  const topProductsList = [...(data?.topProducts || [])].sort((a,b) => (Number(b.units_sold) || 0) - (Number(a.units_sold) || 0));
                  const maxUnits = topProductsList.length > 0 
                    ? Math.max(...topProductsList.map(p => Number(p.units_sold) || 0)) 
                    : 1;
                    
                  return topProductsList.map((product, i) => {
                    const val = Number(product.units_sold) || 0;
                    const widthPercent = Math.min((val / maxUnits) * 100, 100);
                    const isTop = i === 0;
                    
                    return (
                      <motion.div 
                        key={product.name || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.05 }}
                        className={`flex items-center justify-between px-5 py-4 bg-white/[0.015] border rounded-2xl transition-all duration-300 group
                          ${isTop ? 'border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.1)] hover:bg-white/[0.04]' : 'border-white/5 hover:bg-white/[0.03]'}`}
                      >
                        {/* Rank & Name */}
                        <div className="flex items-center gap-6 w-1/3">
                          <span className={`w-8 text-center text-xl font-black transition-colors duration-300
                            ${isTop ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'text-gray-600 group-hover:text-gray-400'}`}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="flex flex-col">
                            <p className={`text-sm font-bold transition-colors duration-300 ${isTop ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                              {product.name}
                            </p>
                            {isTop && <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Top Performer</span>}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-1 mx-8 flex items-center">
                          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden relative">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${widthPercent}%` }}
                               transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                               className={`absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r shadow-[0_0_12px_rgba(129,140,248,0.5)]
                                  ${isTop ? 'from-purple-600 to-indigo-400' : 'from-indigo-600/60 to-purple-500/80'}`}
                             />
                          </div>
                        </div>

                        {/* Value Status */}
                        <div className="w-24 text-right flex flex-col justify-center">
                           <span className={`text-base font-black transition-colors duration-300 ${isTop ? 'text-indigo-300 drop-shadow-sm' : 'text-gray-200 group-hover:text-white'}`}>
                             {val.toLocaleString()}
                           </span>
                           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                             Sold
                           </span>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
          )}
        </SectionCard>
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low Stock */}
        <SectionCard title="Inventory Alerts" subtitle="Low stock items needing attention"
          accent="#ef4444" delay={0.5}>
          {loading ? <TableSkeleton /> : (
            <div className="space-y-1">
              {(data?.lowStock || []).map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.04 }}
                  className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">{item.product_name}</p>
                      <p className="text-xs text-gray-500 font-medium">{item.store_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-red-500">{item.quantity} left</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Stock Level</p>
                  </div>
                </motion.div>
              ))}
              {(data?.lowStock || []).length === 0 && (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package size={24} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">All stock levels are healthy</p>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Expiry Alerts */}
        <SectionCard title="Expiry Tracking" subtitle="Batches expiring soon"
          accent="#f59e0b" delay={0.55}>
          {loading ? <TableSkeleton /> : (
            <div className="space-y-1">
              {(data?.expiryAlerts || []).map((item, i) => {
                const urgent = item.days_remaining <= 7;
                const warn   = item.days_remaining <= 14;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.04 }}
                    className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${urgent ? 'bg-red-500/20 text-red-400' : warn ? 'bg-amber-500/20 text-amber-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200">{item.product_name}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.batch_number} · {fmtDate(item.exp_date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${item.days_remaining <= 0 ? 'text-red-500' : urgent ? 'text-red-400' : warn ? 'text-amber-400' : 'text-yellow-400'}`}>
                        {item.days_remaining <= 0 ? 'EXPIRED' : `${item.days_remaining} days`}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        {item.days_remaining <= 0 ? 'Action Needed' : 'Remaining'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              {(data?.expiryAlerts || []).length === 0 && (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock size={24} />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No items expiring soon</p>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

    </div>
  );
}
