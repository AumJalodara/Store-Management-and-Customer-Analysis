import React from 'react';
import Sidebar from '../components/Sidebar';

export default function MainLayout({ children, activePage, onNavigate }) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar active={activePage} onChange={onNavigate} />
      <main className="flex-1 ml-60 p-8 overflow-y-auto min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
