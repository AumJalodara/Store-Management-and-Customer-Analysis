import React from 'react';
import { motion } from 'framer-motion';

export default function SectionCard({ title, subtitle, children, accent, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(79,70,229,0.2)] overflow-hidden transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{ background: 'linear-gradient(145deg, #111, #1a1a1a)' }}
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {accent && (
            <div className="w-1.5 h-6 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}80` }} />
          )}
          <div>
            <h2 className="font-bold text-white text-base tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 font-medium mt-0.5 tracking-wide">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}
