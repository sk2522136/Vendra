import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Items = lazy(() => import("./pages/Items.jsx"));
const Pos = lazy(() => import("./pages/Pos.jsx"));
const Customer = lazy(() => import("./pages/Customer.jsx"));
const Supplier = lazy(() => import("./pages/Supplier.jsx"));
const ExpenseTracker = lazy(() => import("./pages/ExpenseTracker.jsx"));
const Inventory = lazy(() => import("./pages/Inventory.jsx"));
const Category = lazy(() => import("./pages/Category.jsx"));
const Staff = lazy(() => import("./pages/Staff.jsx"));
const Report = lazy(() => import("./pages/Report.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.jsx"));
const ErrorPage = lazy(() => import("./pages/ErrorPage.jsx"));
const ProductHistory = lazy(() => import("./components/inventory/ProductHistory.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const SignUp = lazy(() => import("./pages/SignUp.jsx"));
const Pricing = lazy(() => import("./pages/Pricing.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const TenantDirectory = lazy(() => import("./pages/admin/TenantDirectory.jsx"));
const RevenueAnalytics = lazy(() => import("./pages/admin/RevenueAnalytics.jsx"));

const PageLoader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      gap: "16px",
    }}
  >
    <div className="custom-spinner"></div>
    <p
      style={{
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "500",
        letterSpacing: "0.5px",
        margin: 0,
      }}
    >
      Loading...
    </p>
  </div>
);

function App() {
  const { user } = useAuth();

  const getRedirectPath = (u) => {
    if (!u) return "/login";
    if (u.isSuperAdmin || u.role === "super_admin") return "/super-admin";
    if (u.role === "admin") return "/dashboard";
    return "/pos";
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
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

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;