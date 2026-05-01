import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, Boxes, TrendingUp,
  Users, ArrowLeftRight, BarChart3, FileText,
  Store, AlertTriangle, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'products',  label: 'Products',   icon: Package },
  { id: 'inventory', label: 'Inventory',  icon: Boxes },
  { id: 'sales',     label: 'Sales',      icon: TrendingUp },
  { id: 'customers', label: 'Customers',  icon: Users },
];

const NAV_MGMT = [
  { id: 'transfers', label: 'Transfers',  icon: ArrowLeftRight },
  { id: 'expiry',    label: 'Expiry',     icon: AlertTriangle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const ROLE_COLORS = {
  admin:   'bg-orange-500',
  manager: 'bg-blue-500',
  staff:   'bg-green-500',
};

export default function Sidebar({ active, onChange }) {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-50 bg-[#0f172a] text-gray-300"
    >
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-500 shadow-lg shadow-orange-500/20"
          >
            <Store size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg tracking-tight leading-none">SmartStore</p>
            <p className="text-[10px] uppercase font-bold text-orange-500 mt-1 tracking-widest">Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 pb-3">Main Menu</p>
        {NAV_MAIN.map(item => (
          <NavItem key={item.id} item={item} active={active === item.id} onClick={() => onChange(item.id)} />
        ))}
        <div className="h-6" />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 pb-3">Operations</p>
        {NAV_MGMT.map(item => (
          <NavItem key={item.id} item={item} active={active === item.id} onClick={() => onChange(item.id)} />
        ))}
      </nav>

      {/* User strip */}
      <div className="px-4 py-6 border-t border-white/5 bg-white/5">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-white/10">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-none mb-1">{user?.name || 'User'}</p>
            <p className="text-gray-500 text-[10px] font-medium capitalize tracking-wide">{user?.role || 'staff'}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`sidebar-link w-full text-left font-medium ${active ? 'active' : ''}`}
    >
      <Icon size={18} />
      <span>{item.label}</span>
      {active && (
        <motion.div
          layoutId="active-pill"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      )}
    </button>
  );
}
