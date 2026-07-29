import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  HiChartPie, 
  HiOfficeBuilding, 
  HiCreditCard, 
  HiQuestionMarkCircle, 
  HiCog, 
  HiLogout, 
  HiMenuAlt2,
  HiX
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext'; 

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/super-admin', icon: <HiChartPie size={18} /> },
    { name: 'Tenants', path: '/super-admin/tenants', icon: <HiOfficeBuilding size={18} /> },
    { name: 'Revenue', path: '/super-admin/revenue', icon: <HiCreditCard size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('vendra_user');
      }
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-body text-text font-mona flex flex-col selection:bg-bg-primary selection:text-white">
       <nav className="sticky top-0 z-50 bg-bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 hover:bg-hover text-text rounded-xl transition-colors"
            >
              <HiMenuAlt2 size={22} />
            </button>
            <div className="flex items-center gap-2 select-none">
              <div className="flex items-center ">
              <div className="w-8 h-8 bg-bg-primary  rounded-xl flex items-center justify-center">
            <span className="text-white text-lg font-black">V</span>
          </div>
          <h1 className="text-black text-xl font-black tracking-tighter">endra</h1>
        </div>
            </div>
          </div>

          {/*  DESKTOP  */}
          <div className="hidden md:flex items-center gap-6 font-medium text-text/80">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive 
                      ? 'text-bg-primary' 
                      : 'hover:text-bg-primary text-text/80'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
              <button 
              onClick={handleLogout}
              title="Exit Platform"
              className="hidden md:flex items-center justify-center p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-border/40 active:scale-95"
            >
              <HiLogout size={18} />
            </button>
          </div>

        </div>
      </nav>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-bg-body w-full max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/*  MOBILE */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setIsMobileOpen(false)} 
          />
          
          <div className="relative flex flex-col w-64 max-w-sm bg-bg-card border-r border-border shadow-2xl h-full animate-in slide-in-from-left duration-200 z-10">
            
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <div className="flex items-center ">
                  <div className="w-8 h-8 bg-bg-primary  rounded-xl flex items-center justify-center">
            <span className="text-white text-lg font-black">V</span>
          </div>
          <h1 className="text-black text-xl font-black tracking-tighter">endra</h1>
       
              </div>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 hover:bg-hover rounded-lg text-muted hover:text-text transition-colors"
              >
                <HiX size={18} />
              </button>
            </div>
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto bg-bg-card">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-bg-primary text-white shadow-md shadow-bg-primary/10' 
                        : 'text-muted hover:text-text hover:bg-hover'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border bg-bg-body/40">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <HiLogout size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;