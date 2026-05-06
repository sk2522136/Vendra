import { Outlet } from 'react-router-dom';
import Sidebar from '../layout/Sidebar.jsx';
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-sidebar overflow-hidden ">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 lg:hidden z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Main Content Area - Full Background Match */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2 rounded-2xl text-white">
        {/* Toggle Button for Mobile (Visible on top of dark background) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 mb-4 bg-[#252525] text-white border border-gray-800 rounded-lg shadow-sm"
        >
          <FaBars size={20} />
        </button>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;