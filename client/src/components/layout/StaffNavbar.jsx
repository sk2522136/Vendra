import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle, FaCashRegister, FaUsers, FaBars } from 'react-icons/fa';
import { toast } from 'react-toastify';

function StaffNavbar() {
  const [showLogout, setShowLogout] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const { logout, user } = useAuth();
  const logoutRef = useRef(null);

  const navItems = [
    { to: '/pos', label: 'POS', icon: <FaCashRegister /> },
    { to: '/customer', label: 'Customers', icon: <FaUsers /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      setShowLogout(false);
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="bg-bg-card m-4 rounded-4xl border-b border-border shadow-sm">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        
        {/* Logo */}
        <div className="flex items-center ">
          <div className="w-8 h-8 bg-bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white text-lg font-black">V</span>
          </div>
          <h1 className="text-black text-xl font-black tracking-tighter">endra</h1>
        </div>

        {/* Desktop Navigation + User */}
        <div className="hidden md:flex items-center gap-8">
          
          {/* Nav Items */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${
                    isActive 
                      ? 'bg-bg-primary text-white' 
                      : 'text-muted hover:text-white hover:bg-gray-200'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="relative">
            <div 
              className="flex items-center gap-3 text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded-xl transition-all"
              onClick={() => setShowLogout(!showLogout)}
            >
              <FaUserCircle size={28} className="text-bg-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{user?.name || 'Staff'}</span>
                <span className="text-xs text-muted capitalize">{user?.role}</span>
              </div>
            </div>

            {/* Logout Popup */}
            {showLogout && (
              <div className="absolute top-14 right-0 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-2xl z-50 w-48">
                <p className="text-white text-sm font-bold mb-3 text-center">Logout?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleLogout}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-sm transition-all"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setShowLogout(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm transition-all"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowNav(!showNav)}
          className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Mobile Navigation */}
      {showNav && (
        <div className="md:hidden bg-gray-50 border-t border-border px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setShowNav(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm block w-full ${
                  isActive 
                    ? 'bg-bg-primary text-white' 
                    : 'text-muted hover:text-white hover:bg-gray-200'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Mobile User Section */}
          <div className="border-t border-border pt-3 mt-3">
            <div className="flex items-center gap-2 text-gray-700 px-4 py-2">
              <FaUserCircle size={24} className="text-bg-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{user?.name || 'Staff'}</span>
                <span className="text-xs text-muted capitalize">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-sm transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffNavbar;