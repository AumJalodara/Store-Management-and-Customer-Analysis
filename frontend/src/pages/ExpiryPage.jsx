import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import SectionCard from '../components/SectionCard';
import { TableSkeleton } from '../components/Skeleton';

const fmtDate = d => d
  ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

function urgencyStyle(days) {
  if (days <= 7)  return { bg: 'bg-red-50',    text: 'text-red-600',    badge: 'bg-red-100 text-red-600' };
  if (days <= 14) return { bg: 'bg-amber-50',  text: 'text-amber-600',  badge: 'bg-amber-100 text-amber-600' };
  return            { bg: 'bg-yellow-50', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-600' };
}

export default function ExpiryPage() {
  const { data, loading } = useFetch(api.expiry);

  const soon    = data?.expiringSoon   || [];
  const expired = data?.alreadyExpired || [];

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Expiry Tracking</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Monitor batch longevity and prevent inventory waste.</p>
      </motion.div>

      {/* Expiring soon */}
      <SectionCard
        title="Upcoming Expiries"
        subtitle={`${soon.length} batches require immediate attention`}
        accent="#f59e0b"
        delay={0.1}
      >
        {loading ? <TableSkeleton rows={6} /> : soon.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-2">
            <Clock size={40} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">No impending expiries detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Batch ID</th>
                  <th>Expiry Date</th>
                  <th className="text-center">Stock</th>
                  <th className="text-right">Urgency</th>
                </tr>
              </thead>
              <tbody>
                {soon.map((b, i) => {
                  const s = urgencyStyle(b.days_remaining);
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.01 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <Clock size={18} className={s.text} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{b.product_name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.brand || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs font-bold text-gray-400">{b.batch_number}</td>
                      <td className="font-bold text-gray-600">{fmtDate(b.exp_date)}</td>
                      <td className="text-center font-black text-gray-700">{b.quantity}</td>
                      <td className="text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-tighter ${s.badge} shadow-sm uppercase`}>
                          In {b.days_remaining} Days
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Already expired */}
      <SectionCard
        title="Critically Expired"
        subtitle={`${expired.length} batches must be disposed`}
        accent="#ef4444"
        delay={0.2}
      >
        {loading ? <TableSkeleton rows={4} /> : expired.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-2">
            <AlertTriangle size={40} className="text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">No expired stock records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Batch ID</th>
                  <th>Expired Date</th>
                  <th className="text-center">Waste Qty</th>
                  <th className="text-right">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {expired.map((b, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                    className="bg-red-50/5"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center text-red-600 shadow-sm">
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{b.product_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.brand || 'General'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs font-bold text-gray-400">{b.batch_number}</td>
                    <td className="text-red-500 font-black">{fmtDate(b.exp_date)}</td>
                    <td className="text-center font-black text-gray-900">{b.quantity}</td>
                    <td className="text-right">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-red-600 text-white shadow-md shadow-red-600/20 uppercase tracking-widest">
                        {b.days_overdue}d Overdue
                      </span>
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
