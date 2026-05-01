import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

// Individual toast
export function Toast({ id, type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 3500);
    return () => clearTimeout(t);
  }, [id, onClose]);

  const isSuccess = type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm
        ${isSuccess ? 'bg-green-600' : 'bg-red-600'} text-white`}
    >
      {isSuccess
        ? <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
        : <XCircle     size={18} className="flex-shrink-0 mt-0.5" />
      }
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>
      <button onClick={() => onClose(id)} className="opacity-70 hover:opacity-100 transition-opacity mt-0.5">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// Container rendered at top-level
export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} {...t} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
