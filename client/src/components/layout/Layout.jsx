import { Outlet } from 'react-router-dom';
import Sidebar from '../layout/Sidebar.jsx';
import StaffNavbar from '../layout/StaffNavbar.jsx';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  // ✅ Staff ke liye navbar dikhao, admin ke liye sidebar
  const isStaff = user?.role === 'staff';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      
      {/* Mobile ke liye - Staff navbar ya Admin sidebar toggle */}
      {isStaff ? (
        // ✅ STAFF KE LIYE - Top navbar only
        <StaffNavbar />
      ) : (
        // ✅ ADMIN KE LIYE - Purana Layout
        <div className="flex h-screen">
          {mobileOpen && (
            <div 
              className="fixed inset-0 bg-bg-card lg:hidden z-30"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <Outlet />
          </main>
        </div>
      )}

      {/* STAFF - Content area */}
      {isStaff && (
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <Outlet />
        </main>
      )}

    </div>
  );
}

export default Layout;