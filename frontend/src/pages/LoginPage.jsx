import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
      login(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Admin',   email: 'admin@smartstore.com' },
    { label: 'Staff',   email: 'staff@smartstore.com' },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1f2937] overflow-hidden p-4">
      
      {/* Subtle Glow Layer */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Level 2: Centered Login Form - High-End Crystal Glass Circle */}
      <motion.div
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         transition={{ type: "spring", stiffness: 100, damping: 20 }}
         className="crystal-glass crystal-glass-circle max-w-lg w-full z-10 shadow-[0_0_80px_rgba(139,92,246,0.15)] ring-1 ring-white/5"
      >
        <div className="flex flex-col items-center text-center">
          {/* Neon Logo Section */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center border border-white/20 shadow-[0_0_25px_rgba(139,92,246,0.5)]">
              <Store size={26} className="text-white drop-shadow-lg" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-black text-2xl text-white tracking-widest uppercase">SmartStore</span>
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-[0.4em] mt-1 pl-0.5">Management</span>
            </div>
          </div>

          <h1 className="text-5xl font-black text-white mb-3 uppercase tracking-tighter drop-shadow-2xl">Login</h1>
          <p className="text-indigo-200/40 text-[11px] font-bold mb-12 max-w-xs uppercase tracking-widest leading-relaxed">
            Unleash your perspective.<br/>See the growth in Real-time.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="w-full mb-8 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-black uppercase tracking-[0.15em] backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="text-left">
              <label className="block text-[10px] font-black text-indigo-300/50 uppercase tracking-[0.3em] mb-2.5 ml-2">Access Email</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-violet-600/10 rounded-2xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400/50 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="user@smartstore.com"
                  className="relative w-full pl-14 pr-6 py-4.5 bg-white/[0.02] border border-white/10 rounded-2xl text-sm text-white focus:border-violet-500/50 focus:bg-white/[0.05] transition-all outline-none placeholder:text-indigo-100/10"
                />
              </div>
            </div>

            <div className="text-left">
              <label className="block text-[10px] font-black text-indigo-300/50 uppercase tracking-[0.3em] mb-2.5 ml-2">Secure Code</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-violet-600/10 rounded-2xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400/50 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type={showPwd ? 'text' : 'password'} name="password" required value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="relative w-full pl-14 pr-14 py-4.5 bg-white/[0.02] border border-white/10 rounded-2xl text-sm text-white focus:border-violet-500/50 focus:bg-white/[0.05] transition-all outline-none placeholder:text-indigo-100/10"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400/50 hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 shadow-[0_15px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.3em]"
            >
              {loading ? "Authenticating..." : "System Access"}
            </button>
          </form>

          {/* Quick Connect Demo */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
             {demoAccounts.map(acc => (
               <button
                 key={acc.email}
                 onClick={() => setForm({ email: acc.email, password: 'password123' })}
                 className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-indigo-300/40 hover:bg-white/10 hover:text-white hover:border-violet-500/50 transition-all flex items-center gap-2 group uppercase tracking-widest"
               >
                 {acc.label}
                 <ArrowRight size={10} className="w-0 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all" />
               </button>
             ))}
          </div>
          
          <div className="mt-14 flex gap-10 text-[9px] font-black text-indigo-300/30 uppercase tracking-[0.4em]">
            <a href="#" className="hover:text-violet-400 transition-all">Recover</a>
            <a href="#" className="hover:text-violet-400 transition-all">Register</a>
          </div>
        </div>
      </motion.div>

      {/* Corporate Branding v2 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] text-indigo-300/20 font-black uppercase tracking-[0.6em] transition-opacity hover:opacity-100">
        Engineered for Excellence — v2.0.4
      </div>
    </div>
  );
}
