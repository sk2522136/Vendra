import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth(); // ✅ checkAuth import karo
  const location = useLocation();

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-3">
        <FaSpinner className="animate-spin text-black text-2xl" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Verifying Security Credentials...
        </span>
      </div>
    );
  }

  // ✅ No user - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    let targetPath = user.role === "admin" ? "/dashboard" : "/pos";
    return <Navigate to={targetPath} replace />;
  }

  return children;
};

export default ProtectedRoute;