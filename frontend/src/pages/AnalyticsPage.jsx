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

const COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f97316', '#ef4444', '#eab308'];
const DARK_COLORS = ['#5b21b6', '#0369a1', '#047857', '#c2410c', '#b91c1c', '#a16207'];

const renderPieLabel = (props) => {
  const { cx, x, y, percent, fill } = props;
  const isRight = x > cx;
  const width = 44;
  const height = 24;
  const boxX = isRight ? x + 5 : x - width - 5;
  const boxY = y - height / 2;
  
  if (percent < 0.01) return null; // Don't show labels for <=1% if they get cramped
  
  return (
    <g>
      <rect 
        x={boxX} y={boxY} width={width} height={height} rx="6" 
        fill={fill} fillOpacity="0.25" stroke={fill} strokeWidth="1"
        style={{ filter: `drop-shadow(0 0 6px ${fill})` }}
      />
      <text 
        x={boxX + width / 2} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" 
        className="font-bold text-[11px]" 
        style={{ transform: 'scaleY(1.5)', transformOrigin: `${boxX + width/2}px ${y}px` }}
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    </g>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip-glass text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff' }} className="font-medium drop-shadow-md">
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
  const [activePieIndex, setActivePieIndex] = React.useState(-1);

  const totalRev = (data?.topProducts || []).reduce((sum, p) => sum + Number(p.revenue), 0);
  const chartData = (data?.topProducts || []).map((p, i) => ({
    name:    p.name.length > 20 ? p.name.slice(0, 19) + '…' : p.name,
    revenue: Number(p.revenue),
    units:   p.units_sold,
    fill:    COLORS[i % COLORS.length],
    percent: totalRev > 0 ? Number(p.revenue) / totalRev : 0
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
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="colorBarGradientHoriz" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false}
                  tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Area type="monotone" dataKey="revenue" name="revenue"
                  stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueAnalytic)" animationDuration={1500} />
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
                <Bar dataKey="revenue" name="revenue" radius={[6,6,0,0]} fill="url(#colorBarGradient)" animationDuration={1500}>
                  {chartData.map((d, i) => <Cell key={i} fill="url(#colorBarGradient)" />)}
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
                <Bar dataKey="units" name="units" radius={[0,6,6,0]} fill="url(#colorBarGradientHoriz)" animationDuration={1500}>
                  {chartData.map((d, i) => <Cell key={i} fill="url(#colorBarGradientHoriz)" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Revenue distribution pie */}
        <SectionCard title="Revenue Distribution" subtitle="Share across top products" accent="#10b981" delay={0.25} className="xl:col-span-2">
          {loading ? <div className="h-64 animate-pulse bg-gray-50 rounded-xl" /> : (
            <div className="flex flex-col w-full px-2 lg:px-4 pb-6 pt-2">
              <style dangerouslySetInnerHTML={{__html: `
                .pie-3d-chart { perspective: 1000px; }
                .pie-3d-chart svg.recharts-surface {
                  transform: scaleY(0.65) scaleX(1.15);
                  overflow: visible;
                  filter: drop-shadow(0px 30px 20px rgba(0,0,0,0.8));
                }
                .recharts-pie-sector {
                  transition: all 0.3s ease;
                  cursor: pointer;
                }
                .recharts-pie-label-line {
                  stroke: rgba(255,255,255,0.4) !important;
                  stroke-width: 1.5 !important;
                  stroke-dasharray: 4 4 !important;
                }
              `}} />
              
              <div className="flex flex-col lg:flex-row items-center justify-between w-full min-h-[340px]">
                {/* Left: 3D Pie Chart */}
                <div className="relative w-full lg:w-1/2 h-[340px] flex-shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" className="pie-3d-chart">
                    <PieChart onMouseLeave={() => setActivePieIndex(-1)}>
                      <defs>
                        {chartData.map((d, i) => (
                          <React.Fragment key={`defs${i}`}>
                            <linearGradient id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={1}/>
                              <stop offset="100%" stopColor={DARK_COLORS[i % DARK_COLORS.length]} stopOpacity={0.9}/>
                            </linearGradient>
                            <linearGradient id={`pieWall${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={DARK_COLORS[i % DARK_COLORS.length]} stopOpacity={1}/>
                              <stop offset="100%" stopColor="#000000" stopOpacity={0.7}/>
                            </linearGradient>
                          </React.Fragment>
                        ))}
                      </defs>

                      {/* BOTTOM LAYER: Thickness Extrusion Wall */}
                      <Pie data={chartData} dataKey="revenue" nameKey="none"
                        cx="50%" cy="56%" outerRadius={110} innerRadius={0}
                        stroke="none"
                        animationDuration={1500}
                        activeIndex={activePieIndex}
                        activeShape={{ fillOpacity: 1 }}
                      >
                        {chartData.map((d, i) => <Cell key={`bottom-${i}`} fill={`url(#pieWall${i})`} />)}
                      </Pie>

                      {/* TOP LAYER: Surface */}
                      <Pie data={chartData} dataKey="revenue" nameKey="name"
                        cx="50%" cy="50%" outerRadius={110} innerRadius={0}
                        stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}
                        label={renderPieLabel}
                        labelLine={{ length1: 15, length2: 25 }}
                        animationDuration={1500}
                        activeIndex={activePieIndex}
                        onMouseEnter={(_, i) => setActivePieIndex(i)}
                        activeShape={{ fillOpacity: 1.1 }}
                      >
                        {chartData.map((d, i) => (
                          <Cell key={`top-${i}`} fill={`url(#pieGrad${i})`} className="outline-none drop-shadow-sm hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                        ))}
                      </Pie>
                      <Tooltip wrapperStyle={{ zIndex: 100 }} content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Right: Legend properly structured */}
                <div className="w-full lg:w-1/2 flex flex-col gap-3 max-w-md lg:ml-auto z-10 pt-8 lg:pt-0">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors rounded-3xl px-5 py-3.5 shadow-md backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: d.fill, boxShadow: `0 0 12px ${d.fill}` }} />
                        <span className="text-sm font-semibold text-gray-200">{d.name}</span>
                      </div>
                      <span className="text-base font-black tracking-tight" style={{ color: d.fill }}>
                        {`${Math.round(d.percent * 100)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Center: Total Revenue Floating Badge */}
              <div className="flex justify-center mt-6 lg:-mt-4 z-10">
                <div className="flex items-center gap-5 bg-white/[0.03] border border-white/10 rounded-[24px] px-8 py-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                  <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Total Revenue</p>
                    <p className="text-2xl font-black text-white leading-none tracking-tight">{fmtRupee(totalRev)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
