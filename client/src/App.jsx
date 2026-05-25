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
import VerifyEmail from "./pages/VerifyEmail.jsx"; // 🔥 1. Yahan import kiya naya page
import ErrorPage from "./pages/ErrorPage.jsx";
import ProductHistory from "./components/inventory/ProductHistory.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        
        {/* 🔥 2. Naya Public Route jo bina login ke token accept karega */}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* PROTECTED LAYOUT */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* DEFAULT REDIRECT */}
         <Route
          index
          element={
            !user ? <Navigate to="/login" /> : 
            (user.role === "admin" ? <Navigate to="/dashboard" /> : <Navigate to="/pos" />)
          }
        />

          {/* ADMIN ROUTES */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="items"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Items />
              </ProtectedRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="inventory/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProductHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="category"
            element={
              <ProtectedRoute allowedRoles={["admin","staff"]}>
                <Category />
              </ProtectedRoute>
            }
          />

          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Staff />
              </ProtectedRoute>
            }
          />

          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Report />
              </ProtectedRoute>
            }
          />

          <Route
            path="suppliers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Supplier />
              </ProtectedRoute>
            }
          />

          <Route
            path="expenses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ExpenseTracker />
              </ProtectedRoute>
            }
          />

          {/* ADMIN + STAFF ROUTES */}
          <Route
            path="pos"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Pos />
              </ProtectedRoute>
            }
          />

          <Route
            path="customer"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Customer />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* ERROR ROUTE */}
        <Route path="*" element={<ErrorPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;