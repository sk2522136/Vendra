import { NavLink } from 'react-router-dom';
import { 
  FaThLarge, FaCashRegister, FaBoxOpen, 
  FaUsers, FaWarehouse, FaFileAlt, 
  FaUserTie, FaBars, FaTimes,
  FaMoneyBillWave, FaPowerOff
} from 'react-icons/fa';
import logo from '../../assets/logo.svg';
function Sidebar({ mobileOpen, setMobileOpen }) {
  const navItems = [
    { to: '/dashboard', icon: <FaThLarge size={18} />, label: 'Dashboard' },
    { to: '/pos', icon: <FaCashRegister size={18} />, label: 'POS' },
    { to: '/items', icon: <FaBoxOpen size={18} />, label: 'Items' },
    { to: '/inventory', icon: <FaWarehouse size={18} />, label: 'Inventory' },
    { to: '/category', icon: <FaBoxOpen size={18} />, label: 'Categories' },
    { to: '/expenses', icon: <FaMoneyBillWave size={18} />, label: 'Expenses' },
    { to: '/reports', icon: <FaFileAlt size={18} />, label: 'Reports' },
    { to: '/suppliers', icon: <FaUsers size={18} />, label: 'Suppliers' },
    { to: '/customer', icon: <FaUsers size={18} />, label: 'Customers' },
    { to: '/staff', icon: <FaUserTie size={18} />, label: 'Staff' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 lg:hidden z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed lg:relative top-0 left-0 h-screen w-65 lg:w-64 border-r border-border flex flex-col bg-white text-muted transition-transform duration-300 z-40 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Header: Centered Logo/Name + Right-aligned Cross */}
        <div className="flex items-center py-4 px-4 h-20  border-gray-100 shrink-0">
          <div className="flex-1 flex items-center justify-center gap-3">
             <img src={logo} alt="Vend Logo" className="w-40 h-20" />
            
          </div>
          {/* Close button aligned to the right */}
          <button 
            onClick={() => setMobileOpen(false)} 
            className="lg:hidden p-2 text-text hover:bg-gray-100 rounded-full"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Navigation: Removed scrollbar, tighter gap */}
        <nav className="flex-1 overflow-hidden p-2 space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-lg transition-all text-sm ${
                  isActive 
                    ? 'bg-green text-white font-semibold' 
                    : 'text-text hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <button
            onClick={() => console.log('Logout')}
            className="w-full flex items-center gap-3 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-semibold"
          >
            <FaPowerOff size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden p-3 rounded-full bg-green text-white shadow-lg z-50 hover:bg-green-600 transition-all"
        >
          <FaBars size={22} />
        </button>
      )}
    </>
  );
}

export default Sidebar;