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
{/* staff navbar */}
      {user?.role === 'staff' && (
        <div className="shrink-0">
          <StaffNavbar />
        </div>
      )}

{/* admin navbar */}
      {user?.role === 'admin' && (
        <>
          <div className="lg:hidden shrink-0">
            <StaffNavbar />
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="hidden lg:block w-64 shrink-0">
              <Sidebar />
            </div>

            <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
              <Outlet />
            </main>
          </div>
        </>
      )}


      {user?.role === 'staff' && (
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
          <Outlet />
        </main>
      )}
    </div>
     {user?.role === 'admin' && <ChatbotToggle />}
    </>
  );
}

export default Layout;