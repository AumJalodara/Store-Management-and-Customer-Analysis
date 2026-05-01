import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import SectionCard from '../components/SectionCard';
import { fmtRupee, fmtRupeeShort } from '../utils/format';

const COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name === 'revenue'
            ? `Revenue: ${fmtRupeeShort(p.value)}`
            : `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { data, loading } = useFetch(api.dashboard);

  const chartData = (data?.topProducts || []).map((p, i) => ({
    name:    p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name,
    revenue: Number(p.revenue),
    units:   p.units_sold,
    fill:    COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1 text-sm font-medium">Visual insights into your store performance</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Revenue trend */}
        <SectionCard title="Revenue Trend" subtitle="Monthly revenue trends (24 months)" accent="#4f46e5" delay={0.1}>
          {loading ? <div className="h-64 animate-pulse bg-white/5 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="colorRevenueAnalytic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false}
                  tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Area type="monotone" dataKey="revenue" name="revenue"
                  stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueAnalytic)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Revenue by product */}
        <SectionCard title="Top Products by Revenue" subtitle="Highest earning items" accent="#8b5cf6" delay={0.15}>
          {loading ? <div className="h-64 animate-pulse bg-white/5 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#aaa' }} />
                <YAxis tick={{ fontSize: 10, fill: '#aaa' }}
                  tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="revenue" name="revenue" radius={[6,6,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Units sold */}
        <SectionCard title="Units Sold by Product" subtitle="Volume comparison" accent="#06b6d4" delay={0.2}>
          {loading ? <div className="h-64 animate-pulse bg-white/5 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#aaa' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#aaa' }} width={90} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="units" name="units" radius={[0,6,6,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Revenue distribution pie */}
        <SectionCard title="Revenue Distribution" subtitle="Share across top products" accent="#10b981" delay={0.25}>
          {loading ? <div className="h-64 animate-pulse bg-gray-50 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartData} dataKey="revenue" nameKey="name"
                  cx="50%" cy="50%" outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip formatter={v => fmtRupeeShort(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
