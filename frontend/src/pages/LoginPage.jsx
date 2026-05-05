import React, { useState } from 'react';
import { Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  
  // 'admin' or 'staff' or null
  const [activeCard, setActiveCard] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!activeCard) return;
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

  const handleCardClick = (type) => {
    if (activeCard === type) return;
    setActiveCard(type);
    setError('');
    if (type === 'admin') setForm({ email: 'admin@smartstore.com', password: 'password123' });
    if (type === 'staff') setForm({ email: 'staff@smartstore.com', password: 'password123' });
  };

  const renderCard = (type, title, subtitle) => {
    const isActive = activeCard === type;
    const isInactive = activeCard && activeCard !== type;
    
    // Default Isometric
    let transform = 'rotateX(55deg) rotateZ(-20deg) scale(0.9)';
    let zIndex = 10;
    let opacity = 0.85;
    
    if (isActive) {
      transform = 'rotateX(0deg) rotateZ(0deg) scale(1.05) translateY(-10px)';
      zIndex = 20;
      opacity = 1;
    } else if (isInactive) {
      // Push it lower and back
      transform = 'rotateX(60deg) rotateZ(-25deg) scale(0.8) translateY(40px)';
      opacity = 0.4;
      zIndex = 0;
    }

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick(type);
        }}
        className={`relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer
          w-full sm:w-[360px] bg-gradient-to-br from-[#1a1a2e]/90 to-[#0f172a]/90 
          border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex-shrink-0
          ${!isActive && !isInactive ? 'hover:-translate-y-4 hover:translate-x-2' : ''}`}
        style={{
          transform,
          zIndex,
          opacity,
          transformStyle: 'preserve-3d',
          boxShadow: isActive 
             ? '0 30px 60px rgba(139,92,246,0.3), inset 0 0 0 1px rgba(139,92,246,0.5)' 
             : '-20px 30px 40px rgba(0,0,0,0.8)',
        }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20 
             ${type === 'admin' ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_25px_rgba(249,115,22,0.4)]' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_25px_rgba(99,102,241,0.4)]'}`}>
             <Store size={26} className="text-white drop-shadow-lg" />
          </div>
          <div>
            <h2 className="font-black text-2xl text-white tracking-widest uppercase">{title}</h2>
            <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em] mt-1 pl-0.5">{subtitle}</p>
          </div>
        </div>

        {error && isActive && (
          <div className="w-full mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-500 font-black uppercase tracking-[0.1em]">
            {error}
          </div>
        )}

        <div className={`transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {/* Prevent form submission if not active */}
          <form 
            onSubmit={(e) => {
              if(!isActive) { e.preventDefault(); return; }
              handleSubmit(e);
            }} 
            className="w-full space-y-5"
          >
            <div className="text-left">
              <label className="block text-[10px] font-black text-indigo-300/50 uppercase tracking-[0.3em] mb-2.5 ml-1">Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/50 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="email" name="email" required 
                  value={isActive ? form.email : (type === 'admin' ? 'admin@smartstore.com' : 'staff@smartstore.com')} 
                  onChange={handleChange}
                  placeholder="user@smartstore.com"
                  tabIndex={isActive ? 0 : -1}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:border-violet-500/50 focus:bg-white/[0.06] transition-all outline-none"
                />
              </div>
            </div>

            <div className="text-left">
              <label className="block text-[10px] font-black text-indigo-300/50 uppercase tracking-[0.3em] mb-2.5 ml-1">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/50 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type={showPwd ? 'text' : 'password'} name="password" required 
                  value={isActive ? form.password : '••••••••'} 
                  onChange={handleChange}
                  placeholder="••••••••"
                  tabIndex={isActive ? 0 : -1}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:border-violet-500/50 focus:bg-white/[0.06] transition-all outline-none"
                />
                <button 
                  type="button" 
                  tabIndex={isActive ? 0 : -1} 
                  onClick={(e) => { e.preventDefault(); setShowPwd(s => !s); }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/50 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading || !isActive}
              tabIndex={isActive ? 0 : -1}
              className={`w-full mt-4 py-4 rounded-xl font-black text-xs text-white transition-all disabled:opacity-50 uppercase tracking-[0.2em]
                ${type === 'admin' 
                   ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_10px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_10px_30px_rgba(249,115,22,0.5)]'
                   : 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_30px_rgba(79,70,229,0.5)]'
                }`}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#1f2937] overflow-hidden p-4"
      onClick={() => setActiveCard(null)}
    >
      {/* Background Ambience */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className={`transition-all duration-700 z-10 text-center ${activeCard ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100 mb-16'}`}>
         <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-lg">Select Portal</h1>
         <p className="text-indigo-200/50 text-xs font-bold mt-3 uppercase tracking-[0.3em]">SmartStore 3D Authentication</p>
      </div>

      <div 
        className="flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-24 w-full z-10"
        style={{ perspective: '1200px' }}
      >
        {renderCard('admin', 'Admin', 'Full Access Control')}
        {renderCard('staff', 'Staff', 'Store Operations')}
      </div>
      
      <div className="absolute bottom-8 text-[9px] text-indigo-300/30 font-black uppercase tracking-[0.6em] pointer-events-none">
        Engineered for Excellence
      </div>
    </div>
  );
}
