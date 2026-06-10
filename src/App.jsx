import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./Componentes/Sidebar/Sidebar";
import Header from "./Componentes/Header/Header";

import Explore from "./pages/Explore/Explore";
import Manage_Categories from "./pages/ManageCategories/Manage_Categories";
import Manage_Items from "./pages/ManageItems/Manage_items";
import Manage_Users from "./pages/ManageUsers/Manage_users";
import ManageEmployees from "./pages/ManageEmployees/ManageEmployees";
import Dashboard from "./pages/Dashboard/Dashboard";
import OrderHistory from "./pages/OrderHistory/OrderHistory";
import Login from "./Componentes/Login/Login";

import Settings from "./pages/Settings/Settings";
import ImportHistory from "./Componentes/ImportHistory/ImportHistory";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Reports from "./pages/Reports/Reports";
import { Toaster } from "react-hot-toast";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import ReceiptPopup from "./Componentes/ReceiptPopup/ReceiptPopup";

import RegisterShop from "./pages/RegisterShop/RegisterShop";
import PendingApproval from "./pages/PendingApproval/PendingApproval";
import AccountRejected from "./pages/AccountRejected/AccountRejected";
import AccountDisabled from "./pages/AccountDisabled/AccountDisabled";
import ManageShops from "./pages/ManageShops/ManageShops";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

// Prevent logged-in users from going to login page
const LoginRoute = ({ auth, element }) => {
  if (auth?.token) {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
};

// Protect routes (auth + role check)
const ProtectedRoute = ({ auth, children, roles }) => {
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(auth?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const { auth, favicon, showPopup, setShowPopup, orderDetails, setOrderDetails } = useContext(AppContext);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPublicRoute = ["/login", "/register-shop", "/pending-approval", "/account-rejected", "/account-disabled", "/verify-email", "/forgot-password"].includes(location.pathname);

  // Dynamic favicon switcher
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = favicon || '/vite.svg';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, [favicon]);

  return (
    <div className="d-flex min-vh-100 bg-obsidian">
      {/* Left Sidebar (hidden on public screens) */}
      {!isPublicRoute && (
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Top Header Bar (hidden on public screens) */}
        {!isPublicRoute && (
          <Header onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        )}

        {/* Dynamic Route Content */}
        <div className="flex-grow-1">
          <Toaster />

          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<LoginRoute auth={auth} element={<Login />} />} />
            <Route path="/register-shop" element={<RegisterShop />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/account-rejected" element={<AccountRejected />} />
            <Route path="/account-disabled" element={<AccountDisabled />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* DEFAULT ROUTES */}
            <Route path="/" element={<ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN", "ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN", "ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}><Explore /></ProtectedRoute>} />

            {/* MANAGE ROUTES */}
            <Route
              path="/manage-categories"
              element={<ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]}><Manage_Categories /></ProtectedRoute>}
            />

            <Route
              path="/manage-items"
              element={<ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]}><Manage_Items /></ProtectedRoute>}
            />

            {/* ADMIN ONLY ROUTES */}
            <Route
              path="/manage-users"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN"]}>
                  <Manage_Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manage-shops"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN"]}>
                  <ManageShops />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/manage-employees"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]}>
                  <ManageEmployees />
                </ProtectedRoute>
              }
            />

            {/* ORDERS */}
            <Route
              path="/manage-orders"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />

            {/* SETTINGS */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN", "ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* IMPORT HISTORY */}
            <Route
              path="/import-history"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]}>
                  <ImportHistory />
                </ProtectedRoute>
              }
            />

            {/* REPORTS */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>

      {showPopup && <ReceiptPopup orderDetails={orderDetails} onClose={() => {
        setShowPopup(false);
        setOrderDetails(null);
      }} />}
    </div>
  );
};

export default App;