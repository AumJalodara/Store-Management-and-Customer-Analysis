import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function KpiCard({ title, value, trend, icon: Icon, gradientClass, color, delay = 0 }) {
  const isGradient = !!gradientClass;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-sm border ${
        isGradient 
          ? `${gradientClass} text-white border-transparent` 
          : 'text-white border-white/5'
      }`}
      style={!isGradient ? { background: 'linear-gradient(145deg, #111, #1a1a1a)', boxShadow: '0 0 20px rgba(79,70,229,0.2)' } : {}}
    >
      {/* Soft circular overlay shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isGradient ? 'bg-white/20' : ''
          }`}
          style={!isGradient ? { background: color + '10' } : {}}>
            <Icon size={24} style={{ color: isGradient ? '#fff' : color }} />
          </div>
          {trend != null && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
              isGradient ? 'bg-white/20' : 'bg-green-50 text-green-600'
            }`}>
              <TrendingUp size={12} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
            isGradient ? 'text-white/70' : 'text-gray-400'
          }`}>
            {title}
          </p>
          <p className="text-3xl font-extrabold tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
