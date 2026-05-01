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
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
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
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.topProducts || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 13, fill: '#aaa', fontWeight: 600 }} width={120} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="units_sold" name="units sold" fill="#4f46e5" radius={[0,6,6,0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
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
