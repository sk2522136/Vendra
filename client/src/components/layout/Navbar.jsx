import { FaSearch, FaChevronDown, FaPowerOff, FaCircle, FaBars } from "react-icons/fa";
import { useState } from "react";
import { useLocation } from "react-router-dom"; 

function Navbar({ mobileOpen, setMobileOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation(); 
  
  const options = ["Last 30 days", "Last 7 days", "Last 3 months", "Last Year"];

  const getTitle = (path) => {
    switch (path) {
      case "/": return "Dashboard";
      case "/dashboard": return "Dashboard";
      case "/items": return "Inventory";
      case "/pos": return "POS System";
      case "/customer": return "Customers";
      case "/suppliers": return "Suppliers";
      case "/expenses": return "Expenses";
      case "/reports": return "Reports";
      case "/staff": return "Staff";
      default: return "Vend";
    }
  };

  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <div className="h-20 border-b border-border flex items-center px-4 lg:px-8 justify-between bg-white sticky top-0 z-30">

      {/* Left: Mobile Toggle + Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all text-text"
          title="Toggle Menu"
        >
          <FaBars size={20} />
        </button>
        <h2 className="font-bold text-text text-2xl lg:text-3xl truncate">
          {getTitle(location.pathname)} 
        </h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-6">

        {/* Search - Hidden on small mobile */}
        {isDashboard && (
          <div className="relative hidden sm:block w-48 lg:w-72">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-muted text-sm" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-2 border border-border rounded-lg outline-none bg-white text-text text-sm hover:border-green focus:border-green transition-all"
            />
          </div>
        )}

        {/* Date Filter */}
        {isDashboard && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 rounded-lg border border-border text-text text-[10px] lg:text-sm hover:bg-gray-50 cursor-pointer transition-all font-medium whitespace-nowrap"
            >
              <span className="hidden sm:inline">Last 30 days</span>
              <span className="sm:hidden">30D</span>
              <FaChevronDown size={10} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-40 lg:w-48 bg-white border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-4 py-2.5 text-xs lg:text-sm text-text hover:bg-green/10 hover:text-green font-medium transition-all"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Profile - Simple Display Only */}
        <div className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg border border-border cursor-default">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green flex items-center justify-center text-white font-bold text-xs lg:text-sm">
            AD
          </div>
          <div className="hidden lg:flex flex-col items-start min-w-max">
            <p className="text-text font-semibold text-xs lg:text-sm leading-tight">Admin</p>
            <p className="text-muted text-xs">Administrator</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Navbar;