import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth(); 
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isSuperAdmin = user.isSuperAdmin || user.role === "super_admin";
  const isAdmin = user.role === "admin";
  const isStaff = user.role === "staff" || user.role === "manager";

  const getSafeHomeRoute = () => {
    if (isSuperAdmin) return "/super-admin";
    if (isAdmin) return "/dashboard";
    return "/pos";
  };

  // Role Checks
  if (allowedRoles && !allowedRoles.includes(user.role) && !(isSuperAdmin && allowedRoles.includes("super_admin"))) {
    return <Navigate to={getSafeHomeRoute()} replace />;
  }

  if (isSuperAdmin) {
    return children;
  }

  // Subscription Status Check
  const now = new Date();
  const subStatus = user.organization?.subscriptionStatus || user.subscriptionStatus;
  const subPlan = user.organization?.subscriptionPlan || user.subscriptionPlan;
  const subEndDate = user.organization?.subscriptionEndDate || user.subscriptionEndDate;

  const isExpired = subStatus === "expired" || (subEndDate && new Date(subEndDate) < now);
  const requiresPlanSelection = !subPlan || subStatus === "pending" || isExpired;

  // --- STAFF 
  if (isStaff) {
    if (location.pathname === "/pricing") {
      return <Navigate to="/pos" replace />;
    }
    if (requiresPlanSelection) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-center p-6">
          <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800">Subscription Expired</h1>
          <p className="text-slate-600 mt-2 max-w-md text-sm">
            Aapke store ka subscription plan expire ho gaya hai. Service dobara start karne ke liye apne Store Admin se rabta karein.
          </p>
        </div>
      );
    }
    return children;
  }

  // - ADMIN 
  if (isAdmin) {
    if (requiresPlanSelection) {
      if (location.pathname !== "/pricing") {
        return <Navigate to="/pricing" replace />;
      }
      return children;
    }

    if (!requiresPlanSelection && location.pathname === "/pricing") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;