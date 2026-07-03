import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaThLarge, FaCashRegister, FaBoxOpen, 
  FaUsers, FaWarehouse, FaFileAlt, 
  FaUserTie, FaTags, FaMoneyBillWave, 
  FaSignOutAlt, FaUserCircle, FaTruck 
} from 'react-icons/fa';

function Sidebar({ mobileOpen, setMobileOpen }) {
  const [showLogout, setShowLogout] = useState(false);
  const { logout, user } = useAuth();
  const logoutRef = useRef(null);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaThLarge />, roles: ['admin'] },
    { to: '/pos', label: 'POS', icon: <FaCashRegister />, roles: ['admin', 'staff'] },
    { to: '/items', label: 'Items', icon: <FaBoxOpen />, roles: ['admin'] },
    { to: '/inventory', label: 'Inventory', icon: <FaWarehouse />, roles: ['admin'] },
    { to: '/category', label: 'Categories', icon: <FaTags />, roles: ['admin'] },
    { to: '/expenses', label: 'Expenses', icon: <FaMoneyBillWave />, roles: ['admin'] },
    { to: '/reports', label: 'Reports', icon: <FaFileAlt />, roles: ['admin'] },
    { to: '/suppliers', label: 'Suppliers', icon: <FaTruck />, roles: ['admin'] },
    { to: '/customer', label: 'Customers', icon: <FaUsers />, roles: ['admin', 'staff'] },
    { to: '/staff', label: 'Staff', icon: <FaUserTie />, roles: ['admin'] },
  ];

  return (
    <div className={`fixed lg:relative h-screen w-64 flex flex-col bg-[#171717] z-40 transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      
      <div className="h-20 flex items-center justify-center border-b border-gray-800">
        <div className="w-9 h-9 bg-bg-primary rounded-xl flex items-center justify-center shadow-lg ">
          <span className="text-white text-2xl font-black tracking-tighter">V</span>
        </div>
        <h1 className="text-white text-2xl font-black tracking-tighter">endra</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-1">
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${
                  isActive ? 'bg-bg-primary text-white' : 'text-muted hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4 relative">
        <div 
          className="flex items-center gap-3 text-white cursor-pointer hover:bg-gray-800 p-2 rounded-xl transition-all"
          onClick={() => setShowLogout(!showLogout)}
        >
          <FaUserCircle size={32} className="text-bg-primary" />
          <div className="flex flex-col flex-1">
            <span className="text-sm font-bold">{user?.name || 'Admin'}</span>
            <span className="text-xs text-muted capitalize">{user?.role || 'Manager'}</span>
          </div>
          <FaSignOutAlt className="text-muted" />
        </div>

        {/* Logout Popup */}
        {showLogout && (
          <div 
            ref={logoutRef}
            className="absolute bottom-20 left-4 right-4 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-2xl z-50"
          >
            <p className="text-white text-sm font-bold mb-3 text-center">Are you sure?</p>
            <button 
              onClick={logout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-sm transition-all"
            >
              Logout Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;