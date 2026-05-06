import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  FaThLarge, FaCashRegister, FaBoxOpen, 
  FaUsers, FaWarehouse, FaFileAlt, 
  FaUserTie, FaBars, FaTimes,
  FaMoneyBillWave, FaSignOutAlt, FaUserCircle 
} from 'react-icons/fa';

function Sidebar({ mobileOpen, setMobileOpen }) {
  const [showLogout, setShowLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const logoutRef = useRef(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Click outside to close logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (logoutRef.current && !logoutRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      
      toast.success('Logged out successfully! 👋', {
        position: "top-right",
        autoClose: 2000,
      });

      // Redirect to login
      navigate('/login');
      
    } catch (error) {
      toast.error('Logout failed', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogout(false);
    }
  };

  const navItems = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin'] },
  { to: '/pos', label: 'POS', roles: ['admin', 'staff'] },
  { to: '/items', label: 'Items', roles: ['admin'] },
  { to: '/inventory', label: 'Inventory', roles: ['admin'] },
  { to: '/category', label: 'Categories', roles: ['admin'] },
  { to: '/expenses', label: 'Expenses', roles: ['admin'] },
  { to: '/reports', label: 'Reports', roles: ['admin'] },
  { to: '/suppliers', label: 'Suppliers', roles: ['admin'] },
  { to: '/customer', label: 'Customers', roles: ['admin', 'staff'] },
  { to: '/staff', label: 'Staff', roles: ['admin'] },
];

  return (
    <div 
      className={`fixed lg:relative top-0 left-0 h-screen w-64 border-r border-gray-800 flex flex-col bg-bg-sidebar transition-transform duration-300 z-40 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Name */}
      <div className="h-20 flex items-center justify-center border-gray-800">
        <h1 className="text-white text-2xl font-extrabold tracking-wide">VENDARA</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
       {navItems
        .filter(item => item.roles.includes(user?.role))
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => window.innerWidth < 1024 && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-3 ${
                isActive ? 'bg-bg-hover text-white' : 'text-gray-400'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Admin User Section */}
      <div ref={logoutRef} className="relative border-t border-gray-800 shrink-0">
        {/* Logout Pop-up Box */}
        {showLogout && (
          <div className="absolute bottom-full left-0 w-full bg-[#252525] border-t border-gray-800 p-2 shadow-xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-all text-sm disabled:opacity-50"
            >
              <FaSignOutAlt size={16} />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        )}

        {/* User Trigger */}
        <div 
          onClick={() => setShowLogout(!showLogout)}
          className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all ${showLogout ? 'bg-[#252525]' : 'hover:bg-[#252525]'}`}
        >
          <FaUserCircle size={32} color="#909611" />
          <div className="flex flex-col">
            <span className="text-white text-sm font-medium">
              {user?.name || user?.email || 'User'}
            </span>
            <span className="text-gray-500 text-xs capitalize">
              {user?.role || 'Manager'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Close Button */}
      <button 
        onClick={() => setMobileOpen(false)} 
        className="lg:hidden absolute top-4 right-4 text-white p-2"
      >
        <FaTimes size={20} />
      </button>
    </div>
  );
}

export default Sidebar;