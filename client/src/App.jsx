import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Items from "./pages/Items.jsx";
import Pos from "./pages/Pos.jsx";
import Customer from "./pages/Customer.jsx";
import Supplier from "./pages/Supplier.jsx";
import ExpenseTracker from "./pages/ExpenseTracker.jsx";
import Inventory from "./pages/Inventory.jsx";
import Category from "./pages/Category.jsx";
import Staff from "./pages/Staff.jsx";
import Report from "./pages/Report.jsx";
import Login from "./pages/Login.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx"; 
import ErrorPage from "./pages/ErrorPage.jsx";
import ProductHistory from "./components/inventory/ProductHistory.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SignUp from "./pages/SignUp.jsx";
import Pricing from "./pages/Pricing.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import TenantDirectory from "./pages/admin/TenantDirectory.jsx";
import RevenueAnalytics from "./pages/admin/RevenueAnalytics.jsx";


import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { user } = useAuth();

  // Redirect decision helper
  const getRedirectPath = (u) => {
    if (!u) return "/login";
    if (u.isSuperAdmin || u.role === "super_admin") return "/super-admin";
    if (u.role === "admin") return "/dashboard";
    return "/pos";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        
        <Route 
          path="/login" 
          element={
            user ? <Navigate to={getRedirectPath(user)} replace /> : <Login />
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? <Navigate to={getRedirectPath(user)} replace /> : <SignUp />
          } 
        />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tenants" element={<TenantDirectory />} />
          <Route path="revenue" element={<RevenueAnalytics />} />
        </Route>

        <Route path="/admin" element={<Navigate to="/super-admin" replace />} />

        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Items />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProductHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Supplier />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ExpenseTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "manager"]}>
                <Category />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "manager", "cashier"]}>
                <Pos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "manager"]}>
                <Customer />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;