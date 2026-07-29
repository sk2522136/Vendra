import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle, FaCashRegister, FaUsers, FaBars, FaThLarge, FaBoxOpen, FaWarehouse, FaFileAlt, FaUserTie, FaTags, FaMoneyBillWave, FaTruck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


function StaffNavbar() {
  const [showLogout, setShowLogout] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const { logout, user } = useAuth();
  const logoutRef = useRef(null);
  const navigate = useNavigate(); 
  

  const allNavItems = [
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

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = async () => {
  try {
    await logout();        
    navigate('/login', { replace: true }); 
  } catch (error) {
    console.error("Logout navigation failed", error);
  }
};

  return (
    <div className="bg-bg-card m-4 rounded-4xl border-b border-border shadow-sm shrink-0">
      
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        
        <div className="flex items-center ">
          <div className="w-8 h-8 bg-bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white text-lg font-black">V</span>
          </div>
          <h1 className="text-black text-xl font-black tracking-tighter">endra</h1>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          
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

        {/* mobile view*/}
        <button
          onClick={() => setShowNav(!showNav)}
          className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <FaBars size={20} />
        </button>
      </div>

      {showNav && (
        <div className="lg:hidden bg-bg-body border-t border-border px-4 py-3 space-y-2 ">
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