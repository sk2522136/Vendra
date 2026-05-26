import { Outlet } from 'react-router-dom';
import Sidebar from '../layout/Sidebar.jsx';
import StaffNavbar from '../layout/StaffNavbar.jsx';
import { useAuth } from '../../context/AuthContext';

function Layout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Mobile/Tablet Navbar (lg se choti screens par) */}
      <div className="lg:hidden shrink-0">
        <StaffNavbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (lg se badi screen par) */}
        {user?.role === 'admin' && (
          <div className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;