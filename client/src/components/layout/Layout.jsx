import { Outlet } from 'react-router-dom';
import Sidebar from '../layout/Sidebar.jsx';
import StaffNavbar from '../layout/StaffNavbar.jsx';
import { useAuth } from '../../context/AuthContext';
import ChatbotToggle from '../chatBot/ChatbotToggle.jsx';

function Layout() {
  const { user } = useAuth();

  return (
    <>
    <div className="flex flex-col h-screen overflow-hidden">
      {/* STAFF KE LIYE: Navbar hamesha (desktop + mobile) */}
      {user?.role === 'staff' && (
        <div className="shrink-0">
          <StaffNavbar />
        </div>
      )}

      {/* ADMIN KE LIYE: Mobile Navbar + Desktop Sidebar */}
      {user?.role === 'admin' && (
        <>
          {/* Mobile/Tablet Navbar */}
          <div className="lg:hidden shrink-0">
            <StaffNavbar />
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
              <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
              <Outlet />
            </main>
          </div>
        </>
      )}

      {/* STAFF KE LIYE: Sirf Main Content */}
      {user?.role === 'staff' && (
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
          <Outlet />
        </main>
      )}
    </div>
    <ChatbotToggle />
    </>
  );
}

export default Layout;